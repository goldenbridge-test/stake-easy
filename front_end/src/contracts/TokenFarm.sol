// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TokenFarm is ChainlinkClient, Ownable, ReentrancyGuard {
  string public name = "Golden Token Farm";
  IERC20 public goldenToken;

  address[] public stakers;
  // token > address
  mapping(address => mapping(address => uint256)) public stakingBalance;
  mapping(address => uint256) public uniqueTokensStaked;
  mapping(address => address) public tokenPriceFeedMapping;
  address[] public allowedTokens;

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

  constructor(address _goldenTokenAddress) public {
    goldenToken = IERC20(_goldenTokenAddress);
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

  event AllowedTokenRemoved(address token);

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
}
