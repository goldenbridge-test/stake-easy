"""
Comprehensive tests for LoanFactory contract
Tests loan creation, funding, closing, and state management
"""
from scripts.deploy import deploy_token_farm_and_golden_token
from scripts.helpful_scripts import (
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    get_account,
)
from brownie import accounts, chain, network, exceptions, LoanFactory, StateMachine
import pytest
from web3 import Web3


def test_loan_factory_initialization():
    """Test LoanFactory is properly initialized with TokenFarm address"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()

    # Assert
    assert loan_factory.tokenFarm() == token_farm.address
    assert loan_factory.getLoansCount() == 0


def test_create_loan_valid():
    """Test creating a valid loan"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7  # 7 days

    # Act
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value

    # Assert
    assert loan_factory.getLoansCount() == 1
    assert loan_factory.loans(loan_id)[1] == borrower.address  # borrower
    assert loan_factory.loans(loan_id)[2] == loan_amount  # amount
    assert loan_factory.loans(loan_id)[3] == interest  # interest
    assert loan_factory.loans(loan_id)[4] == duration  # duration
    assert loan_factory.loans(loan_id)[5] is False  # funded = False
    assert loan_factory.loans(loan_id)[6] is False  # closed = False


def test_create_loan_invalid_borrower():
    """Test creating loan with invalid borrower address fails"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    zero_address = "0x0000000000000000000000000000000000000000"
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Act / Assert
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.createProjectLoan(
            zero_address,
            loan_amount,
            interest,
            duration,
            {"from": account},
        )


def test_create_loan_invalid_amount():
    """Test creating loan with zero amount fails"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Act / Assert
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.createProjectLoan(
            borrower.address,
            0,  # Invalid amount
            interest,
            duration,
            {"from": account},
        )


def test_fund_loan_valid():
    """Test funding a created loan"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Create loan
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value

    # Fund TokenFarm
    token_farm.depositNative({"from": account, "value": loan_amount})

    # Act: Fund the loan
    token_farm.investInLoan(loan_id, loan_amount, {"from": account})

    # Assert
    assert loan_factory.loans(loan_id)[5] is True  # funded = True
    assert loan_factory.loans(loan_id)[6] is False  # closed = False


def test_fund_loan_incorrect_amount():
    """Test funding loan with incorrect amount fails"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Create loan
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value

    # Fund TokenFarm with double the amount
    token_farm.depositNative({"from": account, "value": loan_amount * 2})

    # Act / Assert: Fund with wrong amount
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.investInLoan(loan_id, loan_amount * 2, {"from": account})


def test_fund_loan_already_funded():
    """Test funding same loan twice fails"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Create and fund loan
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value
    token_farm.depositNative({"from": account, "value": loan_amount * 2})
    token_farm.investInLoan(loan_id, loan_amount, {"from": account})

    # Act / Assert: Try to fund again
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.investInLoan(loan_id, loan_amount, {"from": account})


def test_close_loan_valid():
    """Test closing a funded and repaid loan"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 1  # 1 second for testing

    # Create and fund loan
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value
    loan_address = loan_factory.getLoanAddress(loan_id)
    loan_contract = StateMachine.at(loan_address)

    token_farm.depositNative({"from": account, "value": loan_amount})
    token_farm.investInLoan(loan_id, loan_amount, {"from": account})

    # Repay loan
    chain.sleep(duration + 1)
    chain.mine(1)
    loan_contract.reimburse({"from": borrower, "value": loan_amount + interest})

    # Act: Close the loan
    token_farm.closeLoan(loan_id, {"from": account})

    # Assert
    assert loan_factory.loans(loan_id)[5] is True  # funded = True
    assert loan_factory.loans(loan_id)[6] is True  # closed = True


def test_close_loan_not_funded():
    """Test closing unfunded loan fails"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Create but don't fund loan
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value

    # Act / Assert
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.closeLoan(loan_id, {"from": account})


def test_get_borrower_loans():
    """Test retrieving loans by borrower"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Create multiple loans for same borrower
    tx1 = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id_1 = tx1.return_value

    tx2 = token_farm.createProjectLoan(
        borrower.address,
        loan_amount * 2,
        interest,
        duration,
        {"from": account},
    )
    loan_id_2 = tx2.return_value

    # Act
    borrower_loans = loan_factory.getBorrowerLoans(borrower.address)

    # Assert
    assert len(borrower_loans) == 2
    assert borrower_loans[0] == loan_id_1
    assert borrower_loans[1] == loan_id_2


def test_get_loan_address():
    """Test retrieving loan address by ID"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Create loan
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value

    # Act
    loan_address = loan_factory.getLoanAddress(loan_id)

    # Assert
    assert loan_address != "0x0000000000000000000000000000000000000000"
    assert loan_factory.isLoan(loan_address) is True


def test_get_loan_address_invalid_id():
    """Test retrieving loan with invalid ID fails"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()

    # Act / Assert
    with pytest.raises(exceptions.VirtualMachineError):
        loan_factory.getLoanAddress(999)  # Non-existent loan


def test_loan_counter():
    """Test loan counter increments correctly"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Assert initial state
    assert loan_factory.getLoansCount() == 0

    # Create loans
    for i in range(3):
        token_farm.createProjectLoan(
            borrower.address,
            loan_amount,
            interest,
            duration,
            {"from": account},
        )
        assert loan_factory.getLoansCount() == i + 1


def test_multiple_borrowers():
    """Test loans from multiple borrowers are tracked separately"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower1 = accounts[2]
    borrower2 = accounts[3]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Create loans for different borrowers
    tx1 = token_farm.createProjectLoan(
        borrower1.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id_1 = tx1.return_value

    tx2 = token_farm.createProjectLoan(
        borrower2.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id_2 = tx2.return_value

    # Assert
    borrower1_loans = loan_factory.getBorrowerLoans(borrower1.address)
    borrower2_loans = loan_factory.getBorrowerLoans(borrower2.address)

    assert len(borrower1_loans) == 1
    assert len(borrower2_loans) == 1
    assert borrower1_loans[0] == loan_id_1
    assert borrower2_loans[0] == loan_id_2


def test_loan_state_progression():
    """Test complete loan lifecycle: creation -> funding -> closure"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 1

    # Step 1: Create loan
    tx = token_farm.createProjectLoan(
        borrower.address,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    loan_id = tx.return_value
    loan_info_1 = loan_factory.loans(loan_id)
    assert loan_info_1[5] is False  # not funded
    assert loan_info_1[6] is False  # not closed

    # Step 2: Fund loan
    token_farm.depositNative({"from": account, "value": loan_amount})
    token_farm.investInLoan(loan_id, loan_amount, {"from": account})
    loan_info_2 = loan_factory.loans(loan_id)
    assert loan_info_2[5] is True  # funded
    assert loan_info_2[6] is False  # not closed yet

    # Step 3: Repay and close
    loan_address = loan_factory.getLoanAddress(loan_id)
    loan_contract = StateMachine.at(loan_address)
    chain.sleep(duration + 1)
    chain.mine(1)
    loan_contract.reimburse({"from": borrower, "value": loan_amount + interest})
    token_farm.closeLoan(loan_id, {"from": account})
    loan_info_3 = loan_factory.loans(loan_id)
    assert loan_info_3[5] is True  # funded
    assert loan_info_3[6] is True  # closed


def test_only_token_farm_can_create_loan():
    """Test that only TokenFarm can create loans through LoanFactory"""
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    non_owner = accounts[4]
    token_farm, golden_token, loan_factory, _ = deploy_token_farm_and_golden_token()
    borrower = accounts[2]
    loan_amount = Web3.to_wei(1, "ether")
    interest = Web3.to_wei(100, "gwei")
    duration = 7

    # Act / Assert: Non-TokenFarm account cannot call createLoan directly
    with pytest.raises(exceptions.VirtualMachineError):
        loan_factory.createLoan(
            loan_amount,
            interest,
            duration,
            borrower.address,
            {"from": non_owner},
        )
