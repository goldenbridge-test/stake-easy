"""
Script pour ajouter un token autorisé sur le TokenFarm déjà déployé sur Sepolia.

Usage :
    brownie run scripts/add_allowed_token.py --network sepolia

Prérequis dans brownie-config.yaml :
    wallets:
      from_key: ${PRIVATE_KEY}
    networks:
      sepolia:
        token_farm: "0x328011A76260088494119a77940DD0C6E4DCdFfD"
        golden_token: "0xD6592daDd49Dd401CD5dF8CC54dFe98cDB922E71"
"""

from brownie import TokenFarm, GoldenToken, Contract, network, config
from scripts.helpful_scripts import get_account

TOKEN_FARM_ADDRESS = "0x328011A76260088494119a77940DD0C6E4DCdFfD"
GLD_TOKEN_ADDRESS = "0xD6592daDd49Dd401CD5dF8CC54dFe98cDB922E71"


def main():
    account = get_account()
    print(f"Network  : {network.show_active()}")
    print(f"Account  : {account}")

    # Charge le contrat déployé via son ABI
    token_farm = Contract.from_abi("TokenFarm", TOKEN_FARM_ADDRESS, TokenFarm.abi)

    # Vérifie si le token est déjà autorisé
    is_allowed = token_farm.tokenIsAllowed(GLD_TOKEN_ADDRESS)
    if is_allowed:
        print(f"✅ {GLD_TOKEN_ADDRESS} est déjà autorisé dans TokenFarm.")
        return

    print(f"Ajout de {GLD_TOKEN_ADDRESS} comme token autorisé...")
    tx = token_farm.addAllowedTokens(GLD_TOKEN_ADDRESS, {"from": account})
    tx.wait(1)
    print(f"✅ Token autorisé ! tx: {tx.txid}")
