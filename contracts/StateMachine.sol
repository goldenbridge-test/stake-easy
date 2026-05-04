// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ITokenFarm {
  function receiveLoanReturns() external payable;
}

contract StateMachine {
  enum State {
    PENDING,
    ACTIVE,
    CLOSED
  } // Define possible states

  State public state = State.PENDING; // Initial state is PENDING
  uint256 public amount; // Loan amount to be borrowed
  uint256 public interest; // Interest amount to be paid by the borrower
  uint256 public end; // Timestamp when the loan term ends
  uint256 public duration; // Declare duration as a state variable
  address payable public borrower; // Updated to address payable
  address payable public loanFactory; // LoanFactory that funds the loan
  address payable public tokenFarm; // TokenFarm = lender logique

  constructor(
    uint256 _amount,
    uint256 _interest,
    uint256 _duration,
    address payable _borrower,
    address payable _loanFactory,
    address payable _tokenFarm
  ) {
    amount = _amount; // Assign the amount to the state variable
    interest = _interest; // Assign the interest to the state variable
    duration = _duration; // Assign the duration to the state variable
    end = block.timestamp + _duration; // Initialize the end time
    borrower = _borrower; // Updated to address payable
    loanFactory = _loanFactory;
    tokenFarm = _tokenFarm;
  }


  // ===== FUND (appel UNIQUEMENT par LoanFactory)

  function fund() external payable onlyLoanFactory {
    require(
      address(this).balance == amount,
      "Funding must match the loan amount exactly."
    );
    _transitionTo(State.ACTIVE);
    borrower.transfer(amount);
  } // Transfer the loan amount to the borrower


  // ===== REPAY (borrower rembourse, fonds retournent TokenFarm)

  function reimburse() external payable onlyBorrower {
    require(
      msg.value == amount + interest,
      "Reimbursement must match the loan amount plus interest."
    );
    _transitionTo(State.CLOSED); // Transition to CLOSED state
    ITokenFarm(tokenFarm).receiveLoanReturns{ value: msg.value }();
  }

  function _transitionTo(State to) internal {
    require(to != State.PENDING, "Cannot revert to PENDING state."); // Prevent reverting to PENDING state
    require(to != state, "Cannot transition to the same state."); // Prevent transitioning to the same state

    if (to == State.ACTIVE) {
      require(state == State.PENDING, "Can only activate from PENDING state.");
      state = State.ACTIVE;
      end = block.timestamp + duration; // Use the duration state variable
    } // Transition to ACTIVE state

    if (to == State.CLOSED) {
      require(state == State.ACTIVE, "Can only close from ACTIVE state.");
      require(block.timestamp >= end, "Loan term has not ended yet.");
      state = State.CLOSED;
    } // Transition to CLOSED state
  }

  modifier onlyBorrower() {
    require(msg.sender == borrower, "Only borrower");
    _;
  }

  modifier onlyLoanFactory() {
    require(msg.sender == loanFactory, "Only LoanFactory");
    _;
  }

}
