from scripts.deploy import deploy_token_farm_and_golden_token, KEPT_BALANCE
from scripts.helpful_scripts import (
    LOCAL_BLOCKCHAIN_ENVIRONMENTS,
    INITIAL_PRICE_FEED_VALUE,
    DECIMALS,
    get_account,
    get_contract,
)
from brownie import network, exceptions
import pytest
from web3 import Web3


def test_add_allowed_tokens():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    # Act
    token_farm.addAllowedTokens(golden_token.address, {"from": account})
    # Assert
    assert token_farm.allowedTokens(0) == golden_token.address
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.addAllowedTokens(golden_token.address, {"from": non_owner})

def test_token_is_allowed():
    # Arrange.
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing!")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    # Act.
    test_add_allowed_tokens()
    token_is_allowed = token_farm.tokenIsAllowed(golden_token, {"from": account})
    # Assert.
    assert token_is_allowed is True

def test_set_price_feed_contract():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    non_owner = get_account(index=1)
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    # Act
    token_farm.setPriceFeedContract(
        golden_token.address, get_contract("eth_usd_price_feed"), {"from": account}
    )
    # Assert
    assert token_farm.tokenPriceFeedMapping(golden_token.address) == get_contract(
        "eth_usd_price_feed"
    )
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            golden_token.address, get_contract("eth_usd_price_feed"), {"from": non_owner}
        )

def test_remove_allowed_token(random_erc20):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()

    # Add the token first
    token_farm.addAllowedTokens(golden_token.address, {"from": account})

    # Assert token is allowed
    assert token_farm.tokenIsAllowed(golden_token.address) is True

    # Act: remove the token
    token_farm.removeAllowedToken(golden_token.address, {"from": account})

    # Assert token is no longer allowed
    assert token_farm.tokenIsAllowed(golden_token.address) is False
    # Alternatively, using your !tokenIsAllowed style
    assert not token_farm.tokenIsAllowed(golden_token.address)

    # Optional: test that non-owner cannot remove
    non_owner = get_account(index=1)
    token_farm.addAllowedTokens(golden_token.address, {"from": account})
    with pytest.raises(Exception):
        token_farm.removeAllowedToken(golden_token.address, {"from": non_owner})

def test_stake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    # Act
    golden_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, golden_token.address, {"from": account})
    # Assert
    assert (
        token_farm.stakingBalance(golden_token.address, account.address) == amount_staked
    )
    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address
    return token_farm, golden_token


def test_stake_unapproved_tokens(random_erc20, amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    # Act
    random_erc20.approve(token_farm.address, amount_staked, {"from": account})
    # Assert
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.stakeTokens(amount_staked, random_erc20.address, {"from": account})


def test_unstake_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = test_stake_tokens(amount_staked)
    # Act
    token_farm.unstakeTokens(golden_token.address, {"from": account})
    # Assert
    assert golden_token.balanceOf(account.address) == KEPT_BALANCE
    assert token_farm.stakingBalance(golden_token.address, account.address) == 0
    assert token_farm.uniqueTokensStaked(account.address) == 0


def test_get_user_total_balance_with_different_tokens_and_amounts(
    amount_staked, random_erc20
):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = test_stake_tokens(amount_staked)
    # Act
    token_farm.addAllowedTokens(random_erc20.address, {"from": account})
    # The random_erc20 is going to represent DAI
    # Since the other mocks auto deploy
    token_farm.setPriceFeedContract(
        random_erc20.address, get_contract("eth_usd_price_feed"), {"from": account}
    )
    random_erc20_stake_amount = amount_staked * 2
    random_erc20.approve(
        token_farm.address, random_erc20_stake_amount, {"from": account}
    )
    token_farm.stakeTokens(
        random_erc20_stake_amount, random_erc20.address, {"from": account}
    )
    # Act
    total_eth_balance = token_farm.getUserTotalValue(account.address)
    assert total_eth_balance == INITIAL_PRICE_FEED_VALUE * 3
    # Improve by adding different mock price feed default values


def test_get_token_eth_price():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    # Act / Assert
    assert token_farm.getTokenEthPrice(golden_token.address) == (
        INITIAL_PRICE_FEED_VALUE,
        DECIMALS,
    )


def test_get_user_token_staking_balance_eth_value(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    # Act
    golden_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, golden_token.address, {"from": account})
    # Assert
    eth_balance_token = token_farm.getUserTokenStakingBalanceEthValue(
        account.address, golden_token.address
    )
    assert eth_balance_token == Web3.toWei(2000, "ether")


def test_issue_tokens(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = test_stake_tokens(amount_staked)
    starting_balance = golden_token.balanceOf(account.address)
    # Act
    token_farm.issueTokens({"from": account})
    # Assert
    assert (
        golden_token.balanceOf(account.address)
        == starting_balance + INITIAL_PRICE_FEED_VALUE
    )



def test_issue_tokens_with_max_supply(amount_staked):
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = test_stake_tokens(amount_staked)
    
    # Simule un circulatingSupply proche du max
    golden_token.mint(token_farm.address, golden_token.MAX_SUPPLY() - golden_token.circulatingSupply(), {"from": account})

    starting_circulating = golden_token.circulatingSupply()
    
    # Act: Issue tokens via TokenFarm
    token_farm.issueTokens({"from": account})
    
    # Assert: Circulating supply ne dépasse pas MAX_SUPPLY
    assert golden_token.circulatingSupply() <= golden_token.MAX_SUPPLY()


def test_burn_tokens():
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()

    # Arrange: balance initiale
    initial_balance = golden_token.balanceOf(account.address)
    
    burn_amount = 1_000 * 10**18
    golden_token.burn(burn_amount, {"from": account})
    
    # Assert: balance diminue et circulatingSupply aussi
    assert golden_token.balanceOf(account.address) == initial_balance - burn_amount
    assert golden_token.circulatingSupply() == golden_token.circulatingSupply() - burn_amount



def test_transfer_ownership_to_token_farm():
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    
    # Avant transfert, le propriétaire doit être le deployer
    assert golden_token.owner() == account.address
    
    # Act: transférer la propriété du token à TokenFarm
    golden_token.transferOwnership(token_farm.address, {"from": account})
    
    # Assert: le nouveau propriétaire est bien TokenFarm
    assert golden_token.owner() == token_farm.address
    
    # Vérification que l'ancien owner ne peut plus mint
    with pytest.raises(Exception):
        golden_token.mint(account.address, 1_000 * 10**18, {"from": account})
    
    # Vérification que le nouveau propriétaire peut mint via TokenFarm
    # Ici on simule un mint direct depuis TokenFarm pour test
    token_farm_address = token_farm.address
    golden_token.mint(token_farm_address, 1_000 * 10**18, {"from": token_farm_address})
    
    # Circulating supply augmente
    assert golden_token.circulatingSupply() >= 10_000_000 * 10**18 + 1_000 * 10**18


def test_distribute_loan_returns(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    
    # Stake some tokens
    golden_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, golden_token.address, {"from": account})
    
    # Authorize a mock loan (use account as loan for testing)
    token_farm.authorizeLoan(account.address, {"from": account})
    
    # Simulate receiving loan returns
    return_amount = 100 * 10**18  # 100 tokens
    token_farm.receiveLoanReturns({"from": account, "value": return_amount})
    
    # Check pendingReturns is set
    assert token_farm.pendingReturns(account.address) == return_amount
    
    # Get initial balance
    initial_balance = golden_token.balanceOf(account.address)
    
    # Act: Distribute loan returns
    token_farm.distributeLoanReturns({"from": account})
    
    # Assert: pendingReturns reset to 0
    assert token_farm.pendingReturns(account.address) == 0
    
    # Assert: User received the returns (since only one staker, gets all)
    final_balance = golden_token.balanceOf(account.address)
    assert final_balance == initial_balance + return_amount


def test_allowed_tokens_mapping(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()
    random_erc20 = get_contract("fau_token")  # Assuming FAU is available

    # Act: Add token
    token_farm.addAllowedTokens(random_erc20.address, {"from": account})

    # Assert: Mapping is true
    assert token_farm.allowedTokensMapping(random_erc20.address) == True
    assert token_farm.tokenIsAllowed(random_erc20.address) == True

    # Act: Remove token
    token_farm.removeAllowedToken(random_erc20.address, {"from": account})

    # Assert: Mapping is false
    assert token_farm.allowedTokensMapping(random_erc20.address) == False
    assert token_farm.tokenIsAllowed(random_erc20.address) == False


def test_staker_mapping_and_count(amount_staked):
    # Arrange
    if network.show_active() not in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Only for local testing")
    account = get_account()
    token_farm, golden_token = deploy_token_farm_and_golden_token()

    # Initial state
    assert token_farm.stakerCount() == 0
    assert token_farm.isStaker(account.address) == False

    # Act: Stake tokens
    golden_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, golden_token.address, {"from": account})

    # Assert: Staker added
    assert token_farm.stakerCount() == 1
    assert token_farm.isStaker(account.address) == True

    # Act: Unstake all
    token_farm.unstakeTokens(golden_token.address, {"from": account})

    # Assert: Staker removed
    assert token_farm.stakerCount() == 0
    assert token_farm.isStaker(account.address) == False
