// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LoanFactory.sol";

contract TokenFarm is ChainlinkClient, Ownable, ReentrancyGuard {
  using SafeERC20 for IERC20;

  string public name = "Golden Token Farm";
  IERC20 public goldenToken;

  address[] public stakers;
  // token > address
  mapping(address => mapping(address => uint256)) public stakingBalance;
  mapping(address => uint256) public uniqueTokensStaked;
  mapping(address => address) public tokenPriceFeedMapping;
  mapping(address => bool) public allowedTokensMapping;
  address[] public allowedTokens;
  LoanFactory public loanFactory;
  
  // Pull-over-push : stocke les retours de chaque StateMachine
  mapping(address => uint256) public pendingReturns;
  mapping(address => bool) public authorizedLoans;
  address[] public authorizedLoansArray;
  mapping(address => bool) public isStaker;
  uint256 public stakerCount;

  event TokenStaked(
    address indexed user,
    address indexed token,
    uint256 amount
  );

  event TokenUnstaked(
    address indexed user,
    address indexed token,
    uint256 amount
  );
  
  event LoanCreated(
    uint256 indexed loanId,
    uint256 amount,
    uint256 interest,
    uint256 duration
  );

  event LoanFunded(uint256 indexed loanId, uint256 amount);

  event LoanClosed(uint256 indexed loanId);

  event LoanReturnsReceived(address indexed loanAddress, uint256 amount);

  event LoanReturnsDistributed(
    uint256 totalAmount,
    uint256 stakerCount,
    uint256 timestamp
  );

  event AllowedTokenAdded(address indexed token);

  event AllowedTokenRemoved(address indexed token);
  // Limites
  uint256 public maxStakePerUser = 1_00_000 * 10**18; // 100K tokens max

  modifier onlyAuthorizedLoan() {
    require(authorizedLoans[msg.sender], "Unauthorized loan");
    _;
  }

  constructor(address _goldenTokenAddress, address _loanFactory) {
    goldenToken = IERC20(_goldenTokenAddress);
    loanFactory = LoanFactory(_loanFactory);
  }

  function depositNative() external payable onlyOwner {
    require(msg.value > 0, "Must send ETH");
  }

  function addAllowedTokens(address token) public onlyOwner {
    require(token != address(0), "Invalid token address");
    if (!allowedTokensMapping[token]) {
      allowedTokensMapping[token] = true;
      allowedTokens.push(token);
      emit AllowedTokenAdded(token);
    }
  }

  function setPriceFeedContract(
    address token,
    address priceFeed
  ) public onlyOwner {
    require(token != address(0), "Invalid token address");
    tokenPriceFeedMapping[token] = priceFeed;
  }

  function stakeTokens(uint256 _amount, address token) public nonReentrant {
    // NOTE:
    // Require amount greater than 0
    require(_amount > 0, "amount cannot be 0");
    require(tokenIsAllowed(token), "Token currently isn't allowed");
    require(
      stakingBalance[token][msg.sender] + _amount <= maxStakePerUser,
      "Exceeds max stake per user"
    );
    updateUniqueTokensStaked(msg.sender, token);
    IERC20(token).safeTransferFrom(msg.sender, address(this), _amount);
    stakingBalance[token][msg.sender] =
      stakingBalance[token][msg.sender] +
      _amount;
    if (uniqueTokensStaked[msg.sender] == 1 && !isStaker[msg.sender]) {
      stakers.push(msg.sender);
      isStaker[msg.sender] = true;
      stakerCount++;
    }
    // EVENT
    emit TokenStaked(msg.sender, token, _amount);
  }

  // Unstaking Tokens (Withdraw)
  function unstakeTokens(address token) public nonReentrant {
    // NOTE:
    // Fetch staking balance
    uint256 balance = stakingBalance[token][msg.sender];
    require(balance > 0, "staking balance cannot be 0");
    IERC20(token).safeTransfer(msg.sender, balance);
    stakingBalance[token][msg.sender] = 0;
    uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;

    // The code below fixes a problem where stakers could not appear twice
    // in the stakers array, receiving twice the reward.
    if (uniqueTokensStaked[msg.sender] == 0 && isStaker[msg.sender]) {
      for (
        uint256 stakersIndex = 0;
        stakersIndex < stakers.length;
        stakersIndex++
      ) {
        if (stakers[stakersIndex] == msg.sender) {
          stakers[stakersIndex] = stakers[stakers.length - 1];
          stakers.pop();
          isStaker[msg.sender] = false;
          stakerCount--;
          break;
        }
      }
    }
    // EVENT
    emit TokenUnstaked(msg.sender, token, balance);
  }

  function getUserTotalValue(address user) public view returns (uint256) {
    uint256 totalValue = 0;
    if (uniqueTokensStaked[user] > 0) {
      for (
        uint256 allowedTokensIndex = 0;
        allowedTokensIndex < allowedTokens.length;
        allowedTokensIndex++
      ) {
        totalValue =
          totalValue +
          getUserTokenStakingBalanceEthValue(
            user,
            allowedTokens[allowedTokensIndex]
          );
      }
    }
    return totalValue;
  }

  function tokenIsAllowed(address token) public view returns (bool) {
    return allowedTokensMapping[token];
  }

  // Event pour tracer la suppression

  function removeAllowedToken(address token) public onlyOwner {
    require(allowedTokensMapping[token], "Token not allowed");
    allowedTokensMapping[token] = false;
    for (
      uint256 allowedTokensIndex = 0;
      allowedTokensIndex < allowedTokens.length;
      allowedTokensIndex++
    ) {
      if (allowedTokens[allowedTokensIndex] == token) {
        // swap avec le dernier élement et pop
        allowedTokens[allowedTokensIndex] = allowedTokens[
          allowedTokens.length - 1
        ];
        allowedTokens.pop();
        emit AllowedTokenRemoved(token);
        break; // since mapping ensures uniqueness
      }
    }
  }

  function updateUniqueTokensStaked(address user, address token) internal {
    if (stakingBalance[token][user] <= 0) {
      uniqueTokensStaked[user] = uniqueTokensStaked[user] + 1;
    }
  }

  function getUserTokenStakingBalanceEthValue(
    address user,
    address token
  ) public view returns (uint256) {
    if (uniqueTokensStaked[user] <= 0) {
      return 0;
    }
    (uint256 price, uint8 decimals) = getTokenEthPrice(token);
    return (stakingBalance[token][user] * price) / (10 ** uint256(decimals));
  }

  // Issuing Tokens
  function issueTokens() public onlyOwner {
    // Issue tokens to all stakers
    for (
      uint256 stakersIndex = 0;
      stakersIndex < stakers.length;
      stakersIndex++
    ) {
      address recipient = stakers[stakersIndex];
      uint256 totalStakedValue = getUserTotalValue(recipient);
      goldenToken.safeTransfer(recipient, totalStakedValue);
    }
  }


  function getTokenEthPrice(
    address token
  ) public view returns (uint256, uint8) {
    address priceFeedAddress = tokenPriceFeedMapping[token];
    require(priceFeedAddress != address(0), "Price feed not set");
    AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
    (
      uint80 roundID,
      int256 price,
      uint256 startedAt,
      uint256 timeStamp,
      uint80 answeredInRound
    ) = priceFeed.latestRoundData();

    require(price > 0, "Invalid price");
    require(timeStamp > 0, "Round not complete");
    require(answeredInRound >= roundID, "Stale price feed");

    return (uint256(price), priceFeed.decimals());
  }

  function getStakers() public view returns(address [] memory){
    return stakers;
  }

  receive() external payable {
    require(authorizedLoans[msg.sender], "Unauthorized loan");
    require(msg.value > 0, "No funds sent");

    pendingReturns[msg.sender] += msg.value;
    emit LoanReturnsReceived(msg.sender, msg.value);
  }

  
  // ===== LOAN MANAGEMENT =====
  function createProjectLoan(
    address borrower,
    uint256 amount,
    uint256 interest,
    uint256 duration
  ) external onlyOwner returns (uint256) {
    require(borrower != address(0), "Invalid borrower");
    require(amount > 0, "Amount must be > 0");

    uint256 loanId = loanFactory.createLoan(
      amount,
      interest,
      duration,
      payable(borrower)
    );

    address loanAddress = loanFactory.getLoanAddress(loanId);
    authorizeLoan(loanAddress);

    emit LoanCreated(loanId, amount, interest, duration);
    return loanId;
  }

  function investInLoan(uint256 loanId, uint256 amount)
    external
    onlyOwner
    nonReentrant
  {
    require(amount > 0, "Amount must be > 0");
    require(address(this).balance >= amount, "Insufficient funds");

    loanFactory.fundLoan{ value: amount }(loanId);

    emit LoanFunded(loanId, amount);
  }

  function closeLoan(uint256 loanId) external onlyOwner nonReentrant {
    loanFactory.closeLoan(loanId);
    emit LoanClosed(loanId);
  }

  // ===== LOAN RETURNS MANAGEMENT =====
  function authorizeLoan(address loan) public onlyOwner {
    require(loan != address(0), "Invalid loan address");
    if (!authorizedLoans[loan]) {
      authorizedLoans[loan] = true;
      authorizedLoansArray.push(loan);
    }
  }

  /**
    * @dev Reçoit les retours d'un prêt (appelé par le contrat StateMachine)
    * Utilise le pattern pull-over-push
    */
  function receiveLoanReturns() external payable onlyAuthorizedLoan nonReentrant {
    require(msg.value > 0, "No funds sent");
    
    pendingReturns[msg.sender] += msg.value;
    
    emit LoanReturnsReceived(msg.sender, msg.value);
  }

  /**
    * @dev Distribue les retours des prêts proportionnellement aux stakers
    */
  function distributeLoanReturns() 
    external 
    onlyOwner 
    nonReentrant
  {
    require(stakers.length > 0, "No stakers");

    // 1. Calculer le total des retours disponibles
    uint256 totalReturns = 0;
    for (uint256 i = 0; i < authorizedLoansArray.length; i++) {
      totalReturns += pendingReturns[authorizedLoansArray[i]];
    }

    require(totalReturns > 0, "No loan returns to distribute");

    // 2. Calculer la valeur totale stakée
    uint256 totalStakedValue = 0;
    for (uint256 i = 0; i < stakers.length; i++) {
      uint256 userValue = getUserTotalValue(stakers[i]);
      totalStakedValue += userValue;
    }

    require(totalStakedValue > 0, "No staking value to distribute");

    // 3. Distribuer proportionnellement
    for (uint256 i = 0; i < stakers.length; i++) {
      address recipient = stakers[i];
      uint256 userValue = getUserTotalValue(recipient);

      uint256 userShare = (totalReturns * userValue) / totalStakedValue;

      if (userShare > 0) {
        goldenToken.safeTransfer(recipient, userShare);
      }
    }

    // 4. Reset tous les pendingReturns
    for (uint256 i = 0; i < authorizedLoansArray.length; i++) {
      pendingReturns[authorizedLoansArray[i]] = 0;
    }

    emit LoanReturnsDistributed(totalReturns, stakers.length, block.timestamp);
  }

  // ===== ADMIN FUNCTIONS =====
  function setMaxStakePerUser(uint256 _maxStake) external onlyOwner {
    require(_maxStake > 0, "Max stake must be > 0");
    maxStakePerUser = _maxStake;
  }

  function setLoanFactory(address _loanFactory) external onlyOwner {
    require(_loanFactory != address(0), "Invalid factory address");
    loanFactory = LoanFactory(payable(_loanFactory));
  }


}
