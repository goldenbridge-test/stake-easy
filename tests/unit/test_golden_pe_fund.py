from brownie import accounts, exceptions, network, GoldenPEFund, MockERC20
from scripts.helpful_scripts import LOCAL_BLOCKCHAIN_ENVIRONMENTS, get_account
from web3 import Web3
import pytest

ENTRY_FEE_BP = 100
EXIT_FEE_BP = 100
PERF_FEE_BP = 200
MAX_DEPOSIT_LIMIT = Web3.to_wei(1000, "ether")
INITIAL_DEPOSIT = 1_000_000


def fee_on_raw(assets, fee_bp):
    return (assets * fee_bp + 10000 - 1) // 10000


def fee_on_total(assets, fee_bp):
    return (assets * fee_bp + (fee_bp + 10000) - 1) // (fee_bp + 10000)


def deploy_golden_pe_fund(owner, fund_manager, asset, entry_bp=ENTRY_FEE_BP, exit_bp=EXIT_FEE_BP, perf_bp=PERF_FEE_BP, max_limit=MAX_DEPOSIT_LIMIT):
    return GoldenPEFund.deploy(
        asset.address,
        fund_manager.address,
        entry_bp,
        exit_bp,
        perf_bp,
        max_limit,
        {"from": owner},
    )


def skip_if_not_local():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")


def test_constructor_sets_expected_parameters():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})

    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    assert fund.fundManager() == manager.address
    assert fund.entryFeeBasisPoints() == ENTRY_FEE_BP
    assert fund.exitFeeBasisPoints() == EXIT_FEE_BP
    assert fund.performanceFeeBasisPoints() == PERF_FEE_BP
    assert fund.maxDepositLimit() == MAX_DEPOSIT_LIMIT
    assert fund.isStablecoinWhitelisted(stablecoin.address) is True


def test_initialize_fund_after_constructor_without_allowance():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    assert fund.totalAssets() == 0

    stablecoin.approve(fund.address, INITIAL_DEPOSIT, {"from": owner})
    fund.initializeFund({"from": owner})

    assert fund.totalAssets() == INITIAL_DEPOSIT
    with pytest.raises(exceptions.VirtualMachineError):
        fund.initializeFund({"from": owner})

    with pytest.raises(exceptions.VirtualMachineError):
        fund.initializeFund({"from": accounts[2]})


def test_deposit_charges_entry_fee_and_mints_shares():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    amount = Web3.to_wei(10, "ether")
    stablecoin.approve(fund.address, amount, {"from": owner})

    expected_shares = fund.previewDeposit(amount)
    fund.deposit(amount, owner.address, {"from": owner})

    assert fund.balanceOf(owner.address) == expected_shares
    assert stablecoin.balanceOf(manager.address) == fee_on_total(amount, ENTRY_FEE_BP)


def test_withdraw_charges_exit_fee_and_pays_manager():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    deposit_amount = Web3.to_wei(10, "ether")
    withdraw_amount = Web3.to_wei(1, "ether")

    stablecoin.approve(fund.address, deposit_amount, {"from": owner})
    fund.deposit(deposit_amount, owner.address, {"from": owner})

    pre_withdraw_balance = stablecoin.balanceOf(owner.address)
    manager_balance_before = stablecoin.balanceOf(manager.address)

    fund.withdraw(withdraw_amount, owner.address, owner.address, {"from": owner})

    assert stablecoin.balanceOf(owner.address) == pre_withdraw_balance + withdraw_amount
    assert stablecoin.balanceOf(manager.address) == manager_balance_before + fee_on_raw(withdraw_amount, EXIT_FEE_BP)


def test_pause_blocks_deposit_and_allows_withdraw():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    deposit_amount = Web3.to_wei(2, "ether")
    stablecoin.approve(fund.address, deposit_amount, {"from": owner})
    fund.deposit(deposit_amount, owner.address, {"from": owner})

    fund.pause({"from": owner})
    with pytest.raises(exceptions.VirtualMachineError):
        fund.deposit(Web3.to_wei(1, "ether"), owner.address, {"from": owner})

    fund.withdraw(Web3.to_wei(1, "ether"), owner.address, owner.address, {"from": owner})


def test_max_deposit_limit_restriction():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    small_max_limit = Web3.to_wei(5, "ether")
    fund = deploy_golden_pe_fund(owner, manager, stablecoin, max_limit=small_max_limit)

    stablecoin.approve(fund.address, Web3.to_wei(10, "ether"), {"from": owner})
    fund.deposit(Web3.to_wei(4, "ether"), owner.address, {"from": owner})

    with pytest.raises(exceptions.VirtualMachineError):
        fund.deposit(Web3.to_wei(2, "ether"), owner.address, {"from": owner})


def test_strategy_withdraw_and_return_updates_assets_in_strategy():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    # Provide liquidity for strategy operations
    stablecoin.approve(fund.address, Web3.to_wei(10, "ether"), {"from": owner})
    fund.deposit(Web3.to_wei(10, "ether"), owner.address, {"from": owner})

    amount = Web3.to_wei(1, "ether")
    stablecoin.transfer(manager.address, amount, {"from": owner})

    fund.withdrawForStrategy(amount, {"from": manager})
    assert fund.assetsInStrategy() == amount
    assert fund.totalAssets() == Web3.to_wei(10, "ether") - fee_on_total(Web3.to_wei(10, "ether"), ENTRY_FEE_BP)

    stablecoin.approve(fund.address, amount, {"from": manager})
    fund.returnFromStrategy(amount, {"from": manager})
    assert fund.assetsInStrategy() == 0
    assert stablecoin.balanceOf(fund.address) == Web3.to_wei(10, "ether") - fee_on_total(Web3.to_wei(10, "ether"), ENTRY_FEE_BP)


def test_crystallize_performance_pays_fee_on_profit():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    deposit_amount = Web3.to_wei(10, "ether")
    profit_amount = Web3.to_wei(1, "ether")

    stablecoin.approve(fund.address, deposit_amount, {"from": owner})
    fund.deposit(deposit_amount, owner.address, {"from": owner})

    stablecoin.transfer(fund.address, profit_amount, {"from": owner})
    previous_manager_balance = stablecoin.balanceOf(manager.address)

    fund.crystallizePerformance({"from": manager})

    expected_fee = fee_on_raw(profit_amount, PERF_FEE_BP)
    assert stablecoin.balanceOf(manager.address) == previous_manager_balance + expected_fee
    assert fund.highWaterMark() == fund.totalAssets()


def test_set_fund_manager_only_owner():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")

    owner = get_account()
    manager = accounts[1]
    stablecoin = MockERC20.deploy({"from": owner})
    fund = deploy_golden_pe_fund(owner, manager, stablecoin)

    new_manager = accounts[2]
    fund.setFundManager(new_manager.address, {"from": owner})
    assert fund.fundManager() == new_manager.address
    with pytest.raises(exceptions.VirtualMachineError):
        fund.setFundManager(accounts[3].address, {"from": accounts[3]})
