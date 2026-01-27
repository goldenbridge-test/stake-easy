// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface ILoanFactory {
  function createLoan(
    address borrower,
    uint256 amount,
    uint256 interest,
    uint256 duration
  ) external;

  function fundLoan(uint256 loanId) external payable;
}
