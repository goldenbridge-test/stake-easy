// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./LoanFactory.sol";

contract TokenFarm is ChainlinkClient, Ownable, ReentrancyGuard {
  string public name = "Golden Token Farm";
  IERC20 public goldenToken;

  address[] public stakers;
  // token > address
  mapping(address => mapping(address => uint256)) public stakingBalance;
  mapping(address => uint256) public uniqueTokensStaked;
  mapping(address => address) public tokenPriceFeedMapping;
  address[] public allowedTokens;
  LoanFactory public loanFactory;
  
  // Pull-over-push : stocke les retours de chaque StateMachine
  mapping(address => uint256) public pendingReturns;
  mapping(address => bool) public authorizedLoans;

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

  event LoanInvestment(uint256 loanId, uint256 amount);
  event LoanReturnsReceived(address indexed sender, uint256 amount);
  event AllowedTokenRemoved(address token);
  // 🔔 Événement pour tracer la distribution
  event LoanReturnsDistributed(uint256 totalAmount);

  constructor(address _goldenTokenAddress, address _loanFactory) {
    goldenToken = IERC20(_goldenTokenAddress);
    loanFactory = LoanFactory(_loanFactory);
  }

  function addAllowedTokens(address token) public onlyOwner {
    allowedTokens.push(token);
  }

  function setPriceFeedContract(
    address token,
    address priceFeed
  ) public onlyOwner {
    tokenPriceFeedMapping[token] = priceFeed;
  }

  function stakeTokens(uint256 _amount, address token) public nonReentrant {
    // NOTE:
    // Require amount greater than 0
    require(_amount > 0, "amount cannot be 0");
    require(tokenIsAllowed(token), "Token currently isn't allowed");
    updateUniqueTokensStaked(msg.sender, token);
    IERC20(token).transferFrom(msg.sender, address(this), _amount);
    stakingBalance[token][msg.sender] =
      stakingBalance[token][msg.sender] +
      _amount;
    if (uniqueTokensStaked[msg.sender] == 1) {
      stakers.push(msg.sender);
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
    IERC20(token).transfer(msg.sender, balance);
    stakingBalance[token][msg.sender] = 0;
    uniqueTokensStaked[msg.sender] = uniqueTokensStaked[msg.sender] - 1;

    // The code below fixes a problem where stakers could not appear twice
    // in the stakers array, receiving twice the reward.
    if (uniqueTokensStaked[msg.sender] == 0) {
      for (
        uint256 stakersIndex = 0;
        stakersIndex < stakers.length;
        stakersIndex++
      ) {
        if (stakers[stakersIndex] == msg.sender) {
          stakers[stakersIndex] = stakers[stakers.length - 1];
          stakers.pop();
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
    for (
      uint256 allowedTokensIndex = 0;
      allowedTokensIndex < allowedTokens.length;
      allowedTokensIndex++
    ) {
      if (allowedTokens[allowedTokensIndex] == token) {
        return true;
      }
    }
    return false;
  }

  // Event pour tracer la suppression

  function removeAllowedToken(address token) public onlyOwner {
    for (
      uint256 allowedTokensIndex = 0;
      allowedTokensIndex < allowedTokens.length;
      allowedTokensIndex++
    ) {
      if (allowedTokens[allowedTokensIndex] == token) {
        // swap avec le dernier élément et pop
        allowedTokens[allowedTokensIndex] = allowedTokens[
          allowedTokens.length - 1
        ];
        allowedTokens.pop();
        require(!tokenIsAllowed(token), "Token removal failed");
        emit AllowedTokenRemoved(token);
        return; // on sort de la boucle dès qu'on supprime
      }
    }

    revert("Token not found in allowedTokens");
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
      goldenToken.transfer(recipient, getUserTotalValue(recipient));
    }
  }


  function getTokenEthPrice(
    address token
  ) public view returns (uint256, uint8) {
    address priceFeedAddress = tokenPriceFeedMapping[token];
    AggregatorV3Interface priceFeed = AggregatorV3Interface(priceFeedAddress);
    (
      uint80 roundID,
      int256 price,
      uint256 startedAt,
      uint256 timeStamp,
      uint80 answeredInRound
    ) = priceFeed.latestRoundData();
    return (uint256(price), priceFeed.decimals());
  }

  function setLoanFactory(address _loanFactory) external onlyOwner {
    loanFactory = LoanFactory(_loanFactory);
  }


  function createProjectLoan(
    address borrower,
    uint256 amount,
    uint256 interest,
    uint256 duration
  ) external onlyOwner {
    loanFactory.createLoan(amount, interest, duration, payable(borrower));
  }

  function investInLoan(
    uint256 loanId,
    uint256 amount
  ) external onlyOwner nonReentrant{
    require(address(this).balance >= amount, "Insufficient funds");

    loanFactory.fundLoan{ value: amount }(loanId);
    emit LoanInvestment(loanId, amount);
  }

  
  modifier onlyLoanFactory() {
    require(msg.sender == address(loanFactory), "Not LoanFactory");
    _;
  }


  // =====================================
  // Recevoir les retours d’un loan (pull-over-push)
  // =====================================
  function receiveLoanReturns() external payable onlyOwner {
    require(authorizedLoans[msg.sender], "Unauthorized loan");
    require(msg.value > 0, "No funds sent");
    pendingReturns[msg.sender] += msg.value;
    emit LoanReturnsReceived(msg.sender, msg.value);
  }

  function withdrawLoanReturns() external onlyOwner nonReentrant {
    uint256 amount = pendingReturns[address(this)];
    require(amount > 0, "No returns to withdraw");

    pendingReturns[address(this)] = 0;

    (bool success, ) = payable(owner()).call{ value: amount }("");
    require(success, "Withdraw failed");
  }


  function authorizeLoan(address loan) external onlyOwner {
    authorizedLoans[loan] = true;
  }


  // Redistribuer les retours des loans
  // =====================================
  function distributeLoanReturns() external onlyOwner {
    uint256 totalReturns = 0;

    // 1️⃣ Calculer le total des retours disponibles
    for (uint256 stakersIndex = 0; stakersIndex < stakers.length; stakersIndex++) {
      totalReturns += pendingReturns[stakers[stakersIndex]];
    }

    require(totalReturns > 0, "No loan returns to distribute");

    // 2️⃣ Calculer la valeur totale de tous les stakers pour le ratio
    uint256 totalStakedValue = 0;
    for (uint256 stakersIndex = 0; stakersIndex < stakers.length; stakersIndex++) {
      totalStakedValue += getUserTotalValue(stakers[stakersIndex]);
    }

    require(totalStakedValue > 0, "No staking value to distribute against");

    // 3️⃣ Redistribuer les retours proportionnellement
    for (uint256 stakersIndex = 0; stakersIndex < stakers.length; stakersIndex++) {
      address recipient = stakers[stakersIndex];
        uint256 userValue = getUserTotalValue(recipient);

        // Part proportionnelle
        uint256 userShare = (totalReturns * userValue) / totalStakedValue;

        if (userShare > 0) {
          goldenToken.transfer(recipient, userShare);
        }

      // Reset pendingReturns pour cet utilisateur
      pendingReturns[recipient] = 0;
    }

    emit LoanReturnsDistributed(totalReturns);
  }

}
