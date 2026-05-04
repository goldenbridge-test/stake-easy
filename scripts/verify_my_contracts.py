# -*- coding: utf-8 -*-
"""
Script pour vérifier les contrats déployés sur Etherscan - Modes hybride
- Mode 1: Vérification AUTOMATIQUE depuis build/deployments/map.json
- Mode 2: Vérification MANUELLE avec des adresses spécifiques

Utilisation:
  # Mode automatique (par défaut):
  brownie run scripts/verify_my_contracts.py --network sepolia

  # Mode manuel avec adresses spécifiques:
  brownie run scripts/verify_my_contracts.py --network sepolia verify_manual
"""

from brownie import network, accounts
import json
import time
import os
import sys
import requests
from pathlib import Path

# =============================================================================
# CONFIGURATION MANUELLE - Mode 2: À customiser avec vos adresses
# =============================================================================

MANUAL_ADDRESSES = {
    "GoldenToken":  "0xeb96cdE89Bf8999caec60690ECF0a8DbA5f11c36",
    "TokenFarm":    "0x2AEbc856b27E8565035f386e77D3Aab931e5d694",
    "LoanFactory":  "0x39fc8B7F0472f3b0A0529c848BA2e66d3D145C0f",
    "GoldenPEFund": "0x386845686Ec6AEBc71A44EDe1aF70E5e3E6201f0",
}

# =============================================================================
# CONFIGURATION ETHERSCAN
# Clé : chainid ajouté pour chaque réseau (requis par l'API V2)
# =============================================================================

ETHERSCAN_CONFIG = {
    "sepolia": {
        "api_url":      "https://api.etherscan.io/v2/api",
        "explorer_url": "https://sepolia.etherscan.io",
        "chain_id":     "11155111",
    },
    "goerli": {
        "api_url":      "https://api.etherscan.io/v2/api",
        "explorer_url": "https://goerli.etherscan.io",
        "chain_id":     "5",
    },
    "mainnet": {
        "api_url":      "https://api.etherscan.io/v2/api",
        "explorer_url": "https://etherscan.io",
        "chain_id":     "1",
    },
    "bsc-test": {
        "api_url":      "https://api.etherscan.io/v2/api",
        "explorer_url": "https://testnet.bscscan.com",
        "chain_id":     "97",
    },
    "mumbai": {
        "api_url":      "https://api.etherscan.io/v2/api",
        "explorer_url": "https://mumbai.polygonscan.com",
        "chain_id":     "80001",
    },
}

# Ordre de déploiement des contrats
CONTRACT_ORDER = ["GoldenToken", "TokenFarm", "LoanFactory", "GoldenPEFund"]

# =============================================================================
# FONCTIONS UTILITAIRES
# =============================================================================

def get_etherscan_api_key():
    """Récupère la clé API Etherscan depuis l'environnement"""
    key = os.getenv("ETHERSCAN_TOKEN") or os.getenv("ETHERSCAN_API_KEY", "")
    if not key:
        print("Clé API Etherscan introuvable. Définissez ETHERSCAN_TOKEN ou ETHERSCAN_API_KEY dans votre .env")
    return key


def get_etherscan_config():
    """Récupère la configuration Etherscan pour le réseau actif"""
    active_network = network.show_active()
    config = ETHERSCAN_CONFIG.get(active_network)
    if not config:
        print(f"✗ Réseau '{active_network}' non supporté dans ETHERSCAN_CONFIG")
    return config or {}


def get_network_id():
    """Récupère l'ID du réseau actif"""
    config = get_etherscan_config()
    return config.get("chain_id")


def load_addresses_from_map(map_file="build/deployments/map.json"):
    """Charge les adresses des contrats depuis le fichier map.json"""
    try:
        if not os.path.exists(map_file):
            print(f"✗ Fichier {map_file} non trouvé")
            return {}

        with open(map_file, "r") as f:
            deployment_map = json.load(f)

        network_id = get_network_id()
        if not network_id:
            return {}

        if network_id not in deployment_map:
            print(f"✗ Aucun déploiement trouvé pour le réseau {network.show_active()} (ID: {network_id})")
            return {}

        network_deployments = deployment_map[network_id]

        # Prendre la dernière adresse déployée pour chaque contrat
        addresses = {}
        for contract_name, address_list in network_deployments.items():
            if address_list:
                addresses[contract_name] = address_list[-1]

        return addresses

    except Exception as e:
        print(f"✗ Erreur lors de la lecture de {map_file}: {str(e)}")
        return {}


def load_contract_source(contract_name):
    """Charge le code source du contrat depuis build/contracts"""
    try:
        json_file = Path("build/contracts") / f"{contract_name}.json"

        if not json_file.exists():
            print(f"⚠ Fichier {json_file} non trouvé")
            return None, None

        with open(json_file, "r") as f:
            contract_data = json.load(f)

        source_code = contract_data.get("source", contract_data.get("sourcecode", ""))
        abi = contract_data.get("abi", [])

        if not source_code:
            print(f"⚠ Source code vide pour {contract_name}")
            return None, None

        return source_code, abi

    except Exception as e:
        print(f"✗ Erreur lors du chargement du source code de {contract_name}: {str(e)}")
        return None, None


# =============================================================================
# VÉRIFICATION ETHERSCAN (API V2)
# =============================================================================

def verify_contract_etherscan(contract_address, contract_name):
    """
    Vérifie un contrat sur Etherscan via l'API V2.
    Correction principale : ajout du paramètre 'chainid' dans chaque requête.
    """
    print(f"\n{'='*60}")
    print(f"Vérification de {contract_name}")
    print(f"Adresse : {contract_address}")
    print(f"{'='*60}")

    try:
        # --- Pré-requis ---
        api_key = get_etherscan_api_key()
        if not api_key:
            return False

        etherscan_config = get_etherscan_config()
        if not etherscan_config:
            return False

        api_url      = etherscan_config["api_url"]
        explorer_url = etherscan_config["explorer_url"]
        chain_id     = etherscan_config["chain_id"]   # ← CORRECTION PRINCIPALE

        source_code, _ = load_contract_source(contract_name)
        if not source_code:
            print(f"Impossible de charger le source code de {contract_name}")
            return False

        # --- Paramètres de la requête (format V2) ---
        verify_params = {
            "apikey":            api_key,
            "module":            "contract",
            "action":            "verifysourcecode",
            "contractaddress":   contract_address,
            "sourceCode":        source_code,
            "codeformat":        "solidity-single-file",
            "contractname":      contract_name,
            "compilerversion":   "v0.8.19",  # Use exact Etherscan supported version
            "optimizationUsed":  "1",
            "runs":              "200",
            "evmversion":        "paris",            # adaptez si besoin (london, paris…)
            "licenseType":       "3",                # 1=No License, 3=MIT
        }

        headers = {
            "User-Agent":      "Mozilla/5.0",
            "Accept":          "application/json",
            "Referer":         explorer_url,
            "Content-Type":    "application/x-www-form-urlencoded",
        }

        print("Envoi de la requête de vérification à Etherscan V2...")
        print(f"  Parameters: chainid={chain_id}, action=verifysourcecode")
        # chainid doit être en paramètre d'URL pour l'API V2
        url_with_chainid = f"{api_url}?chainid={chain_id}"
        response = requests.post(url_with_chainid, data=verify_params, headers=headers, timeout=30)

        # --- Vérification HTTP ---
        if response.status_code != 200:
            print(f"✗ Erreur HTTP {response.status_code}")
            if response.status_code == 403:
                print(f"  Votre IP est peut-être limitée. Vérifiez manuellement :")
                print(f"  {explorer_url}/address/{contract_address}#code")
            return False

        # --- Parse JSON ---
        try:
            result = response.json()
        except json.JSONDecodeError:
            if "already verified" in response.text.lower():
                print(f"⚠ {contract_name} est déjà vérifiée sur Etherscan")
                print(f"  Lien : {explorer_url}/address/{contract_address}#code")
                return True
            print(f"✗ Réponse non-JSON : {response.text[:300]}")
            return False

        status     = result.get("status")
        message    = result.get("message", "")
        result_msg = result.get("result", "")

        print(f"  Status: {status} | Message: {message} | Result: {result_msg}")

        # --- Soumission acceptée : GUID renvoyé, on interroge le statut ---
        if status == "1" and result_msg and len(result_msg) == 50:
            guid = result_msg
            print(f"  ✓ Soumission acceptée (GUID: {guid}). Vérification en cours...")
            return poll_verification_status(guid, contract_name, api_key, api_url,
                                            chain_id, explorer_url, contract_address)

        # --- Déjà vérifiée ---
        already = (
            "already verified" in str(result_msg).lower()
            or "already verified" in str(message).lower()
        )
        if already:
            print(f"⚠ {contract_name} est déjà vérifiée sur Etherscan")
            print(f"  Lien : {explorer_url}/address/{contract_address}#code")
            return True

        # --- Succès direct ---
        if status == "1":
            print(f"✓ {contract_name} vérifiée avec succès !")
            print(f"  Lien : {explorer_url}/address/{contract_address}#code")
            return True

        # --- Échec ---
        print(f"✗ Erreur Etherscan : {result_msg or message or 'Erreur inconnue'}")
        return False

    except Exception as e:
        print(f"✗ Exception lors de la vérification de {contract_name}: {str(e)}")
        return False


def poll_verification_status(guid, contract_name, api_key, api_url,
                              chain_id, explorer_url, contract_address,
                              max_attempts=10, delay=15):
    """
    Interroge Etherscan toutes les `delay` secondes pour connaître
    le résultat de la vérification identifiée par son GUID.
    """
    check_params = {
        "apikey":  api_key,
        "module":  "contract",
        "action":  "checkverifystatus",
        "guid":    guid,
    }

    for attempt in range(1, max_attempts + 1):
        print(f"  Tentative {attempt}/{max_attempts} dans {delay}s...")
        time.sleep(delay)

        try:
            # chainid doit être en paramètre d'URL pour l'API V2
            url_with_chainid = f"{api_url}?chainid={chain_id}"
            resp = requests.get(url_with_chainid, params=check_params, timeout=30)
            data = resp.json()
            status  = data.get("status")
            message = data.get("message", "")
            result  = data.get("result", "")

            print(f"    → Status: {status} | Result: {result}")

            if result.lower() == "pass - verified":
                print(f"  ✓ {contract_name} vérifiée avec succès !")
                print(f"    Lien : {explorer_url}/address/{contract_address}#code")
                return True

            if "already verified" in result.lower():
                print(f"  ⚠ {contract_name} était déjà vérifiée.")
                print(f"    Lien : {explorer_url}/address/{contract_address}#code")
                return True

            if "pending" in result.lower() or "in progress" in result.lower():
                continue  # On attend encore

            # Tout autre statut négatif
            print(f"  Vérification échouée : {result or message}")
            return False

        except Exception as e:
            print(f"  ✗ Erreur lors du polling : {str(e)}")

    print(f"  Délai maximum atteint pour {contract_name}. Vérifiez manuellement :")
    print(f"    {explorer_url}/address/{contract_address}#code")
    return False


# =============================================================================
# MODE 1 : VÉRIFICATION AUTOMATIQUE DEPUIS map.json
# =============================================================================

def verify_all_contracts_from_map():
    """Vérifie tous les contrats déployés (Mode automatique)"""
    print(f"\n{'='*60}")
    print("MODE 1: Vérification AUTOMATIQUE depuis map.json")
    print(f"{'='*60}")
    print(f"Réseau : {network.show_active()}")
    print(f"{'='*60}")

    addresses = load_addresses_from_map()
    if not addresses:
        print("Aucune adresse trouvée pour vérifier")
        return {}

    _print_addresses(addresses)
    results = _run_verifications(addresses)
    print_summary(results)
    return results


# =============================================================================
# MODE 2 : VÉRIFICATION MANUELLE AVEC ADRESSES SPÉCIFIQUES
# =============================================================================

def verify_all_contracts_manual():
    """Vérifie les contrats avec les adresses manuelles (Mode manuel)"""
    print(f"\n{'='*60}")
    print("MODE 2: Vérification MANUELLE avec adresses spécifiques")
    print(f"{'='*60}")
    print(f"Réseau : {network.show_active()}")
    print(f"{'='*60}")

    if not MANUAL_ADDRESSES:
        print("✗ Aucune adresse manuelle configurée dans MANUAL_ADDRESSES")
        return {}

    _print_addresses(MANUAL_ADDRESSES)
    results = _run_verifications(MANUAL_ADDRESSES)
    print_summary(results)
    return results


# =============================================================================
# HELPERS PARTAGÉS
# =============================================================================

def _print_addresses(addresses):
    print(f"\n✓ Contrats trouvés : {len(addresses)}")
    for name, addr in addresses.items():
        print(f"   - {name}: {addr}")


def _run_verifications(addresses):
    """Itère sur CONTRACT_ORDER et lance la vérification avec pause anti-rate-limit."""
    results = {}
    for contract_name in CONTRACT_ORDER:
        if contract_name in addresses:
            results[contract_name] = verify_contract_etherscan(
                addresses[contract_name], contract_name
            )
            time.sleep(5)  # Pause pour éviter le rate-limiting Etherscan
    return results


def print_summary(results):
    """Affiche le résumé de la vérification"""
    print(f"\n{'='*60}")
    print("RÉSUMÉ DE LA VÉRIFICATION")
    print(f"{'='*60}")

    success_count = sum(1 for v in results.values() if v)
    for name, ok in results.items():
        print(f"  {'✓ VERIFIED  ' if ok else 'FAILED'} — {name}")

    print(f"\nTotal : {success_count}/{len(results)} contrats vérifiés")
    print(f"{'='*60}\n")


# =============================================================================
# FONCTION PRINCIPALE
# =============================================================================

def main():
    """Sélectionne le mode de vérification selon les arguments CLI"""
    if "verify_manual" in sys.argv:
        verify_all_contracts_manual()
    else:
        verify_all_contracts_from_map()


if __name__ == "__main__":
    main()