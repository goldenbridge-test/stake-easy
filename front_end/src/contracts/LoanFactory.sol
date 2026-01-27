// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./StateMachine.sol";

contract LoanFactory is Ownable, ReentrancyGuard {
  // ===== STRUCT =====
  struct LoanInfo {
    address loanAddress;
    address borrower;
    uint256 amount;
    uint256 interest;
    uint256 duration;
    bool funded;
    bool closed;
  }

  constructor(address  payable _tokenFarm) {
    tokenFarm = _tokenFarm;
  }

  // ===== STORAGE =====
  LoanInfo[] public loans; // Array to store all loans
  mapping(address => uint256[]) public borrowerLoans; // Maps borrower address to their loan IDs
  mapping(address => bool) public isLoan;
  address payable public tokenFarm;

  // ===== EVENTS =====
  event LoanCreated(
    uint256 indexed loanId,
    address indexed loanAddress,
    address indexed borrower,
    uint256 amount,
    uint256 interest,
    uint256 duration
  );

  event LoanFunded(uint256 indexed loanId, address loanAddress);

  event LoanClosed(uint256 indexed loanId, address loanAddress);

  event ReturnsTransferred(uint256 amount);

  // ===== CREATE LOAN =====
  function createLoan(
    uint256 _amount,
    uint256 _interest,
    uint256 _duration,
    address payable _borrower
  ) external onlyOwner returns (uint256) {
    StateMachine loan = new StateMachine(
      _amount,
      _interest,
      _duration,
      _borrower,
      tokenFarm // lender = TokenFarm // Updated to payable(address(this)
    );

    loans.push(
      LoanInfo({
        loanAddress: address(loan),
        borrower: _borrower,
        amount: _amount,
        interest: _interest,
        duration: _duration,
        funded: false,
        closed: false
      })
    );

    uint256 loanId = loans.length - 1; // Get the newly created loan's ID
    borrowerLoans[_borrower].push(loanId); // Map borrower to their loan ID
    isLoan[address(loan)] = true;

    emit LoanCreated(
      loanId,
      address(loan),
      _borrower,
      _amount,
      _interest,
      _duration
    );

    return loanId;
  }

  // ===== FUND LOAN ===== FUND LOAN (appelé par TokenFarm)
  function fundLoan(uint256 loanId) external payable onlyTokenFarm nonReentrant{
    LoanInfo storage loanInfo = loans[loanId]; // Access the loan info
    require(!loanInfo.funded, "Loan already funded");
    require(msg.value == loanInfo.amount, "Incorrect funding amount");

    StateMachine loan = StateMachine(payable(loanInfo.loanAddress)); // Cast to StateMachine
    loan.fund{ value: msg.value }();

    loanInfo.funded = true;

    emit LoanFunded(loanId, loanInfo.loanAddress);
  }

  // ===== CLOSE LOAN =====
  function closeLoan(uint256 loanId) external onlyOwner nonReentrant {
    LoanInfo storage loanInfo = loans[loanId];
    require(loanInfo.funded, "Loan not funded yet");
    require(!loanInfo.closed, "Loan already closed");

    loanInfo.closed = true;

    emit LoanClosed(loanId, loanInfo.loanAddress);
  }

  // ===== VIEW HELPERS =====
  function getLoansCount() external view returns (uint256) {
    return loans.length;
  }

  function getBorrowerLoans(
    address borrower
  ) external view returns (uint256[] memory) {
    return borrowerLoans[borrower];
  }

  function setTokenFarm(address payable _tokenFarm) external onlyOwner {
    tokenFarm = _tokenFarm;
  }

  function transferReturnsToTokenFarm() external onlyOwner nonReentrant {
    uint256 balance = address(this).balance;
    (bool success, ) = tokenFarm.call{ value: balance }("");
    require(success, "Transfer to TokenFarm failed");

    emit ReturnsTransferred(balance);
  }


  modifier onlyTokenFarm() {
    require(msg.sender == address(tokenFarm), "Not TokenFarm");
    _;
  }

}
