// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC4626} from "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract GoldenPEFund is ERC4626, ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using Math for uint256;

    uint256 private constant BASIS_POINT_SCALE = 1e4;

    address public fundManager;

    uint256 public entryFeeBasisPoints;
    uint256 public exitFeeBasisPoints;
    uint256 public performanceFeeBasisPoints;

    uint256 public highWaterMark;
    uint256 public assetsInStrategy;

    event StrategyWithdrawal(uint256 amount);
    event StrategyReturn(uint256 amount);
    event PerformanceCrystallized(uint256 profit, uint256 fee);

    // =========================
    // Constructor
    // =========================

    constructor(
        IERC20 _asset,
        address _fundManager,
        uint256 _entryFeeBp,
        uint256 _exitFeeBp,
        uint256 _performanceFeeBp
    )
        ERC4626(_asset)
        ERC20("Golden Private Equity Fund Share", "GPEF")
    {
        fundManager = _fundManager;
        entryFeeBasisPoints = _entryFeeBp;
        exitFeeBasisPoints = _exitFeeBp;
        performanceFeeBasisPoints = _performanceFeeBp;
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
    // Admin functions
    // =========================

    function setFundManager(address newManager) external onlyOwner {
        fundManager = newManager;
    }

    function setFees(
        uint256 _entryFeeBp,
        uint256 _exitFeeBp,
        uint256 _performanceFeeBp
    ) external onlyOwner {
        entryFeeBasisPoints = _entryFeeBp;
        exitFeeBasisPoints = _exitFeeBp;
        performanceFeeBasisPoints = _performanceFeeBp;
    }

    // =========================
    // Off-chain strategy control
    // =========================

    function withdrawForStrategy(uint256 amount) external nonReentrant{
        require(msg.sender == fundManager, "Not manager");
        require(amount <= IERC20(asset()).balanceOf(address(this)), "Insufficient vault liquidity");

        assetsInStrategy += amount;

        IERC20(asset()).safeTransfer(fundManager, amount);

        emit StrategyWithdrawal(amount);
    }

    function returnFromStrategy(uint256 amount) external nonReentrant{
        require(msg.sender == fundManager, "Not manager");

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

    function crystallizePerformance(uint256 newTotalAssets) external nonReentrant{
        require(msg.sender == fundManager, "Not manager");

        if (newTotalAssets > highWaterMark) {
            uint256 profit = newTotalAssets - highWaterMark;

            uint256 fee = profit.mulDiv(
                performanceFeeBasisPoints,
                BASIS_POINT_SCALE
            );

            highWaterMark = newTotalAssets;

            IERC20(asset()).safeTransfer(fundManager, fee);

            emit PerformanceCrystallized(profit, fee);
        }
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
    // Deposit / Withdraw overrides with fees
    // =========================

    function _deposit(
        address caller,
        address receiver,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant{
        uint256 fee = _feeOnTotal(assets, entryFeeBasisPoints);

        super._deposit(caller, receiver, assets, shares);

        if (fee > 0) {
            IERC20(asset()).safeTransfer(fundManager, fee);
        }
    }

    function _withdraw(
        address caller,
        address receiver,
        address owner,
        uint256 assets,
        uint256 shares
    ) internal override nonReentrant{
        uint256 fee = _feeOnRaw(assets, exitFeeBasisPoints);

        super._withdraw(caller, receiver, owner, assets, shares);

        if (fee > 0) {
            IERC20(asset()).safeTransfer(fundManager, fee);
        }
    }
}