// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GoldenPEFund is ERC4626, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Math for uint256;

    uint256 private constant BASIS_POINT_SCALE = 1e4;
    uint256 private constant INITIAL_DEPOSIT = 1e6; // Prévention contre inflation attack

    address public fundManager;

    uint256 public entryFeeBasisPoints;
    uint256 public exitFeeBasisPoints;
    uint256 public performanceFeeBasisPoints;

    uint256 public highWaterMark;
    uint256 public assetsInStrategy;
    
    // NOUVELLES VARIABLES
    uint256 public maxDepositLimit; // Limite de dépôt maximum
    mapping(address => bool) public whitelistedStablecoins; // Stablecoins acceptés
    bool private initialized; // Flag pour initialisation unique

    event StrategyWithdrawal(uint256 amount);
    event StrategyReturn(uint256 amount);
    event PerformanceCrystallized(uint256 profit, uint256 fee);
    event StablecoinWhitelisted(address indexed token, bool status);
    event MaxDepositLimitUpdated(uint256 newLimit);
    event FundManagerUpdated(address indexed newManager);

    // =========================
    // Constructor
    // =========================

    constructor(
        IERC20 _asset,
        address _fundManager,
        uint256 _entryFeeBp,
        uint256 _exitFeeBp,
        uint256 _performanceFeeBp,
        uint256 _maxDepositLimit
    )
        ERC4626(_asset)
        ERC20("Golden Private Equity Fund Share", "GPEF")
    {
        require(_fundManager != address(0), "Invalid fund manager");
        require(_entryFeeBp <= 10000 && _exitFeeBp <= 10000 && _performanceFeeBp <= 10000, "Invalid fee");
        require(_maxDepositLimit >= INITIAL_DEPOSIT, "Max deposit must be >= initial deposit");

        fundManager = _fundManager;
        entryFeeBasisPoints = _entryFeeBp;
        exitFeeBasisPoints = _exitFeeBp;
        performanceFeeBasisPoints = _performanceFeeBp;
        maxDepositLimit = _maxDepositLimit;
        
        // Whitelist asset par défaut
        whitelistedStablecoins[address(_asset)] = true;
        
        // Initialisation pour prévention inflation attack
        _initializeFund();
    }

    // =========================
    // Initialisation
    // =========================

    function _initializeFund() private {
        if (!initialized) {
            try IERC20(asset()).transferFrom(msg.sender, address(this), INITIAL_DEPOSIT) returns (bool success) {
                if (success) {
                    _mint(address(0x000000000000000000000000000000000000dEaD), INITIAL_DEPOSIT);
                    initialized = true;
                    highWaterMark = totalAssets();
                }
            } catch {
                // Si le transfert échoue au déploiement, l'owner devra faire un premier dépôt
            }
        }
    }

    function initializeFund() external onlyOwner {
        require(!initialized, "Already initialized");
        IERC20(asset()).safeTransferFrom(msg.sender, address(this), INITIAL_DEPOSIT);
        _mint(address(0x000000000000000000000000000000000000dEaD), INITIAL_DEPOSIT);
        initialized = true;
        highWaterMark = totalAssets();
    }

    // =========================
    // Stablecoin Whitelist Management
    // =========================

    function addWhitelistedStablecoin(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(!whitelistedStablecoins[token], "Already whitelisted");
        whitelistedStablecoins[token] = true;
        emit StablecoinWhitelisted(token, true);
    }

    function removeWhitelistedStablecoin(address token) external onlyOwner {
        require(whitelistedStablecoins[token], "Not whitelisted");
        require(token != address(asset()), "Cannot remove primary asset");
        whitelistedStablecoins[token] = false;
        emit StablecoinWhitelisted(token, false);
    }

    function isStablecoinWhitelisted(address token) external view returns (bool) {
        return whitelistedStablecoins[token];
    }

    // =========================
    // Max Deposit Limit Management
    // =========================

    function setMaxDepositLimit(uint256 _maxDepositLimit) external onlyOwner {
        require(_maxDepositLimit > 0, "Max deposit must be > 0");
        maxDepositLimit = _maxDepositLimit;
        emit MaxDepositLimitUpdated(_maxDepositLimit);
    }

    function maxDeposit(address) public view override returns (uint256) {
        if (paused()) return 0;
        uint256 currentTotal = totalAssets();
        if (currentTotal >= maxDepositLimit) return 0;
        return maxDepositLimit - currentTotal;
    }

    function maxMint(address) public view override returns (uint256) {
        uint256 maxDepositAmount = maxDeposit(msg.sender);
        if (maxDepositAmount == 0) return 0;
        return convertToShares(maxDepositAmount);
    }

    // =========================
    // Pause mechanism
    // =========================

    bool private _paused;

    function pause() external onlyOwner {
        _paused = true;
    }

    function unpause() external onlyOwner {
        _paused = false;
    }

    function paused() public view returns (bool) {
        return _paused;
    }

    modifier whenNotPaused() {
        require(!_paused, "Vault is paused");
        _;
    }

    // =========================
    // Preview overrides with fees
    // =========================

    function previewDeposit(uint256 assets)
        public
        view
        override
        returns (uint256)
    {
        uint256 fee = _feeOnTotal(assets, entryFeeBasisPoints);
        return super.previewDeposit(assets - fee);
    }

    function previewMint(uint256 shares)
        public
        view
        override
        returns (uint256)
    {
        uint256 assets = super.previewMint(shares);
        return assets + _feeOnRaw(assets, entryFeeBasisPoints);
    }

    function previewWithdraw(uint256 assets)
        public
        view
        override
        returns (uint256)
    {
        uint256 fee = _feeOnRaw(assets, exitFeeBasisPoints);
        return super.previewWithdraw(assets + fee);
    }

    function previewRedeem(uint256 shares)
        public
        view
        override
        returns (uint256)
    {
        uint256 assets = super.previewRedeem(shares);
        return assets - _feeOnTotal(assets, exitFeeBasisPoints);
    }

    // =========================
    // Deposit / Withdraw overrides with fees
    // =========================

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant whenNotPaused {
        uint256 fee = _feeOnTotal(assets, entryFeeBasisPoints);
        require(assets > fee, "Deposit amount too small after fee");
        require(totalAssets() + assets - fee <= maxDepositLimit, "Deposit exceeds max limit");

        super._deposit(caller, receiver, assets, shares);

        if (fee > 0) {
            IERC20(asset()).safeTransfer(fundManager, fee);
        }

        if (highWaterMark == 0) {
            highWaterMark = totalAssets();
        }
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant {
        uint256 fee = _feeOnRaw(assets, exitFeeBasisPoints);
        uint256 grossAssets = assets + fee;

        super._withdraw(caller, address(this), owner, grossAssets, shares);

        if (fee > 0) {
            IERC20(asset()).safeTransfer(fundManager, fee);
        }
        IERC20(asset()).safeTransfer(receiver, assets);
    }

    // =========================
    // Admin functions
    // =========================

    function setFundManager(address newManager) external onlyOwner {
        require(newManager != address(0), "Invalid fund manager");
        fundManager = newManager;
        emit FundManagerUpdated(newManager);
    }

    function setFees(
        uint256 _entryFeeBp,
        uint256 _exitFeeBp,
        uint256 _performanceFeeBp
    ) external onlyOwner {
        require(_entryFeeBp <= 10000 && _exitFeeBp <= 10000 && _performanceFeeBp <= 10000, "Invalid fee");
        entryFeeBasisPoints = _entryFeeBp;
        exitFeeBasisPoints = _exitFeeBp;
        performanceFeeBasisPoints = _performanceFeeBp;
    }

    // =========================
    // Off-chain strategy control
    // =========================

    function withdrawForStrategy(uint256 amount) 
        external 
        onlyFundManager 
        nonReentrant 
        whenNotPaused
    {
        require(amount > 0, "Amount must be > 0");
        require(amount <= IERC20(asset()).balanceOf(address(this)), "Insufficient vault liquidity");

        assetsInStrategy += amount;

        IERC20(asset()).safeTransfer(fundManager, amount);

        emit StrategyWithdrawal(amount);
    }

    function returnFromStrategy(uint256 amount) 
        external 
        onlyFundManager 
        nonReentrant 
    {
        require(amount > 0, "Amount must be > 0");
        require(assetsInStrategy >= amount, "Return exceeds assets in strategy");

        IERC20(asset()).safeTransferFrom(msg.sender, address(this), amount);

        assetsInStrategy -= amount;

        emit StrategyReturn(amount);
    }

    // =========================
    // Total assets override
    // =========================

    function totalAssets() public view override returns (uint256) {
        return
            IERC20(asset()).balanceOf(address(this)) +
            assetsInStrategy;
    }

    // =========================
    // Performance Fee with HWM
    // =========================

    function crystallizePerformance() 
        external 
        onlyFundManager 
        nonReentrant
    {
        uint256 newTotalAssets = totalAssets();
        require(newTotalAssets > 0, "Invalid total assets");

        if (highWaterMark == 0) {
            highWaterMark = newTotalAssets;
            return;
        }

        require(newTotalAssets > highWaterMark, "No performance to crystallize");

        uint256 profit = newTotalAssets - highWaterMark;

        uint256 fee = profit.mulDiv(
            performanceFeeBasisPoints,
            BASIS_POINT_SCALE,
            Math.Rounding.Up
        );

        require(fee <= IERC20(asset()).balanceOf(address(this)), "Insufficient balance for fee");

        uint256 newHighWaterMark = newTotalAssets - fee;
        highWaterMark = newHighWaterMark;

        IERC20(asset()).safeTransfer(fundManager, fee);

        emit PerformanceCrystallized(profit, fee);
    }

    // =========================
    // Fee helpers
    // =========================

    function _feeOnRaw(uint256 assets, uint256 feeBp)
        internal
        pure
        returns (uint256)
    {
        return assets.mulDiv(feeBp, BASIS_POINT_SCALE, Math.Rounding.Up);
    }

    function _feeOnTotal(uint256 assets, uint256 feeBp)
        internal
        pure
        returns (uint256)
    {
        return assets.mulDiv(
            feeBp,
            feeBp + BASIS_POINT_SCALE,
            Math.Rounding.Up
        );
    }

    // =========================
    // Modifiers
    // =========================

    modifier onlyFundManager() {
        require(msg.sender == fundManager, "Not manager");
        _;
    }
}