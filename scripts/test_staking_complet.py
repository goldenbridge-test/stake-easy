#!/usr/bin/python3
from brownie import GoldenToken, TokenFarm, accounts, network, MockV3Aggregator
from web3 import Web3

def main():
    print("🚀 TEST COMPLET DE STAKING")
    
    # 1. Comptes
    admin = accounts[0]
    user = accounts[1]
    
    print(f"Admin: {admin.address}")
    print(f"User: {user.address}")
    
    # 2. Déploie les contrats
    print("\n📦 Déploiement des contrats...")
    golden_token = GoldenToken.deploy({"from": admin})
    token_farm = TokenFarm.deploy(
        golden_token.address,
        {"from": admin}
    )
    
    print(f"GoldenToken: {golden_token.address}")
    print(f"TokenFarm: {token_farm.address}")
    
    # 3. DÉPLOYER UN PRICE FEED MOCK (nécessaire)
    print("\n📊 Déploiement du Price Feed...")
    mock_price_feed = MockV3Aggregator.deploy(
        8,  # decimals
        2000 * 10**8,  # initial price (2000$)
        {"from": admin}
    )
    
    # 4. AJOUTER LE TOKEN AUTORISÉ
    print("\n✅ Ajout du token autorisé...")
    add_tx = token_farm.addAllowedTokens(
        golden_token.address,
        {"from": admin}
    )
    add_tx.wait(1)
    
    # 5. CONFIGURER LE PRICE FEED
    print("📈 Configuration du Price Feed...")
    price_feed_tx = token_farm.setPriceFeedContract(
        golden_token.address,
        mock_price_feed.address,
        {"from": admin}
    )
    price_feed_tx.wait(1)
    
    # 6. Donne des tokens à l'utilisateur
    print("\n💰 Transfert de tokens à l'utilisateur...")
    tokens_amount = Web3.to_wei(1000, "ether")
    
    tx_transfer = golden_token.transfer(
        user.address,
        tokens_amount,
        {"from": admin}
    )
    tx_transfer.wait(1)
    
    user_balance = golden_token.balanceOf(user.address)
    print(f"✅ Solde utilisateur: {Web3.from_wei(user_balance, 'ether')} GLD")
    
    # 7. Teste le staking
    print("\n🎯 Test du staking...")
    
    # L'utilisateur approve les tokens
    approve_tx = golden_token.approve(
        token_farm.address,
        tokens_amount,
        {"from": user}
    )
    approve_tx.wait(1)
    
    # L'utilisateur stake
    stake_amount = Web3.to_wei(100, "ether")
    stake_tx = token_farm.stakeTokens(
        stake_amount,
        golden_token.address,
        {"from": user}
    )
    stake_tx.wait(1)
    
    print(f"✅ Staking de {Web3.from_wei(stake_amount, 'ether')} GLD réussi!")
    
    # 8. Vérifie le staking
    staked = token_farm.stakingBalance(
        golden_token.address,
        user.address
    )
    print(f"📊 Tokens stakés: {Web3.from_wei(staked, 'ether')} GLD")
    
    # 9. Teste unstaking
    print("\n🔄 Test du unstaking...")
    unstake_tx = token_farm.unstakeTokens(
        golden_token.address,
        {"from": user}
    )
    unstake_tx.wait(1)
    
    final_balance = golden_token.balanceOf(user.address)
    print(f"🏁 Solde final: {Web3.from_wei(final_balance, 'ether')} GLD")
    
    print("\n🎉 TEST COMPLET RÉUSSI!")

if __name__ == "__main__":
    main()
