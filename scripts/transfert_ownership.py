from brownie import GoldenToken, TokenFarm, accounts

# Compte deployer
deployer = accounts[0]

# Contrats déjà deployés
golden_token = GoldenToken[-1]   # dernier deploy
token_farm = TokenFarm[-1]

# Transférer ownership
tx = golden_token.transferOwnership(token_farm.address, {"from": deployer})
tx.wait(1)  # attendre la confirmation
print(f"Ownership transféré à TokenFarm : {token_farm.address}")
