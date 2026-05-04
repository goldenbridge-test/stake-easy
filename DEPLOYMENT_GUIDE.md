# Guide de Déploiement et Vérification Etherscan

**Dernière mise à jour:** Mai 4, 2026  
**Version:** 1.0  
**Statut:** Production Ready

---

## Table des Matières

1. [Configuration Pré-Déploiement](#configuration-pré-déploiement)
2. [Déploiement sur Sepolia](#déploiement-sur-sepolia)
3. [Vérification Etherscan](#vérification-etherscan)
4. [Déploiement sur Mainnet](#déploiement-sur-mainnet)
5. [Post-Déploiement](#post-déploiement)
6. [Troubleshooting](#troubleshooting)

---

## Configuration Pré-Déploiement

### 1. Préparer l'Environnement

```bash
# 1. Cloner et installer
git clone <repo-url>
cd goldenbridge
pip install -r requirements.txt

# 2. Vérifier Brownie
brownie --version
# Vous devriez voir: Brownie v1.20.6+

# 3. Configurer les réseaux
brownie networks list
```

### 2. Configuration des Clés Privées

```bash
# Créer un compte Brownie sécurisé
brownie accounts new sepolia-account
# Entrez votre clé privée (sans 0x)
# Entrez un mot de passe

# Pour Mainnet, créez un deuxième compte
brownie accounts new mainnet-account

# Lister les comptes
brownie accounts list
```

### 3. Variables d'Environnement

```bash
# Créer .env dans la racine du projet
cat > .env << 'EOF'
# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID

# Etherscan API (pour la vérification)
ETHERSCAN_TOKEN=YOUR-ETHERSCAN-API-KEY

# Gas settings (optionnel)
GAS_LIMIT=12000000
GAS_PRICE_STRATEGY=medium

# Network timeouts
NETWORK_TIMEOUT=600
EOF

# Charger les variables
source .env  # Linux/Mac
# ou sur Windows PowerShell: Get-Content .env | foreach { $name, $value = $_ -split '='; [Environment]::SetEnvironmentVariable($name, $value) }
```

---

## Déploiement sur Sepolia

### 1. Vérifier les Contrats

```bash
# Compiler les contrats
brownie compile --all

# Affichage attendu:
# Solc version: 0.8.31, 0.8.19, 0.6.12, 0.6.6, 0.4.26
# Compiling contracts...
# ✓ All contracts compiled successfully
```

### 2. Vérifier Votre Balance

```bash
# Vérifier que vous avez des ETH (pour les gas fees)
brownie accounts show sepolia-account
# Affichage attendu:
# sepolia-account
# ├─Balance: X.XX ETH
# └─Address: 0x...

# Si vous n'avez pas d'ETH, obtenir depuis Sepolia Faucet:
# https://www.sepoliafaucet.com/
```

### 3. Script de Déploiement

```python
# scripts/deploy_sepolia.py
from brownie import (
    GoldenToken, TokenFarm, LoanFactory, GoldenPEFund,
    accounts, network, web3, Contract
)
from pathlib import Path
import json

def get_or_create_deployment_file():
    """Créer ou charger le fichier de déploiement"""
    file = Path("deployments_sepolia.json")
    if file.exists():
        with open(file) as f:
            return json.load(f)
    return {}

def save_deployment(data):
    """Sauvegarder les adresses déployées"""
    with open("deployments_sepolia.json", "w") as f:
        json.dump(data, f, indent=2)

def main():
    # Charge le compte
    account = accounts.load('sepolia-account')
    print(f"Déploiement depuis: {account.address}")
    print(f"Balance: {account.balance() / 10**18:.2f} ETH")
    
    # Charger les déploiements existants
    deployments = get_or_create_deployment_file()
    
    # 1. Déployer GoldenToken (si pas déjà fait)
    if 'GoldenToken' not in deployments:
        print("\n📦 Déploiement de GoldenToken...")
        golden_token = GoldenToken.deploy(
            {'from': account, 'gas_limit': 5000000}
        )
        deployments['GoldenToken'] = golden_token.address
        print(f"✓ GoldenToken: {golden_token.address}")
        save_deployment(deployments)
    else:
        golden_token = Contract.from_abi(
            'GoldenToken',
            deployments['GoldenToken'],
            GoldenToken.abi
        )
        print(f"GoldenToken (existing): {golden_token.address}")
    
    # 2. Déployer TokenFarm
    if 'TokenFarm' not in deployments:
        print("\n📦 Déploiement de TokenFarm...")
        token_farm = TokenFarm.deploy(
            golden_token.address,
            "0x0000000000000000000000000000000000000000",  # vrfCoordinator (null pour mainnet)
            {'from': account, 'gas_limit': 8000000}
        )
        deployments['TokenFarm'] = token_farm.address
        print(f"✓ TokenFarm: {token_farm.address}")
        save_deployment(deployments)
    else:
        token_farm = Contract.from_abi(
            'TokenFarm',
            deployments['TokenFarm'],
            TokenFarm.abi
        )
        print(f"TokenFarm (existing): {token_farm.address}")
    
    # 3. Déployer LoanFactory
    if 'LoanFactory' not in deployments:
        print("\n📦 Déploiement de LoanFactory...")
        loan_factory = LoanFactory.deploy(
            token_farm.address,
            {'from': account, 'gas_limit': 6000000}
        )
        deployments['LoanFactory'] = loan_factory.address
        print(f"✓ LoanFactory: {loan_factory.address}")
        save_deployment(deployments)
    else:
        loan_factory = Contract.from_abi(
            'LoanFactory',
            deployments['LoanFactory'],
            LoanFactory.abi
        )
        print(f"LoanFactory (existing): {loan_factory.address}")
    
    # 4. Déployer GoldenPEFund
    if 'GoldenPEFund' not in deployments:
        print("\n📦 Déploiement de GoldenPEFund...")
        pe_fund = GoldenPEFund.deploy(
            token_farm.address,
            loan_factory.address,
            {'from': account, 'gas_limit': 7000000}
        )
        deployments['GoldenPEFund'] = pe_fund.address
        print(f"✓ GoldenPEFund: {pe_fund.address}")
        save_deployment(deployments)
    else:
        pe_fund = Contract.from_abi(
            'GoldenPEFund',
            deployments['GoldenPEFund'],
            GoldenPEFund.abi
        )
        print(f"GoldenPEFund (existing): {pe_fund.address}")
    
    # 5. Configuration croisée
    print("\n⚙️  Configuration des références...")
    if token_farm.loanFactory() == "0x0000000000000000000000000000000000000000":
        tx = token_farm.setLoanFactory(loan_factory.address, {'from': account})
        print(f"✓ LoanFactory configuré dans TokenFarm")
    
    # 6. Ajouter les tokens autorisés
    print("\n🔐 Configuration des tokens autorisés...")
    
    # USDC Sepolia
    usdc_address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
    usdc_feed = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E"
    
    if not token_farm.allowedTokens(usdc_address):
        token_farm.addAllowedTokens(usdc_address, {'from': account})
        token_farm.setPriceFeedContract(usdc_address, usdc_feed, {'from': account})
        print(f"✓ USDC configuré (price feed: {usdc_feed})")
    
    # 7. Dépôt initial d'ETH
    print("\n💰 Dépôt initial d'ETH...")
    initial_eth = web3.to_wei(50, 'ether')  # 50 ETH for Sepolia testing
    tx = token_farm.depositNative({'from': account, 'value': initial_eth})
    print(f"✓ {web3.from_wei(initial_eth, 'ether'):.0f} ETH déposés")
    
    # 8. Statistiques finales
    print("\n" + "="*60)
    print("DÉPLOIEMENT SEPOLIA COMPLET ✓")
    print("="*60)
    print(f"\nAdresses Déployées:")
    print(f"  GoldenToken:  {deployments['GoldenToken']}")
    print(f"  TokenFarm:    {deployments['TokenFarm']}")
    print(f"  LoanFactory:  {deployments['LoanFactory']}")
    print(f"  GoldenPEFund: {deployments['GoldenPEFund']}")
    
    stats = token_farm.getNativeDepositStats()
    print(f"\nÉtat Actuel:")
    print(f"  ETH Total:    {web3.from_wei(stats[0], 'ether'):.2f}")
    print(f"  ETH Balance:  {web3.from_wei(stats[1], 'ether'):.2f}")
    print(f"  Dépositaires: {stats[2]}")
    
    print(f"\nProchaine étape: brownie run scripts/verify_my_contracts.py")

if __name__ == "__main__":
    main()
```

### 4. Exécuter le Déploiement

```bash
# Déployer sur Sepolia
brownie run scripts/deploy_sepolia.py --network sepolia

# Affichage attendu:
# Deployments sepolia.json created
# Déploiement depuis: 0xYourAddress
# Balance: X.XX ETH
#
# 📦 Déploiement de GoldenToken...
# ✓ GoldenToken: 0x...
#
# [... plus de messages ...]
#
# DÉPLOIEMENT SEPOLIA COMPLET ✓
```

---

## Vérification Etherscan

### Important: Procédure Recommandée

En raison d'un mismatch de version du compilateur (déployé avec 0.8.19, mais Brownie peut seulement installer 0.8.31), nous recommandons la **vérification manuelle via GUI Etherscan** plutôt que la script automation.

### Méthode 1: Vérification GUI (Recommandée)

#### Étape 1: Préparer le Code Source

```bash
# Créer un fichier avec tous les contrats
cd contracts

# 1. Copier TokenFarm.sol
# 2. Copier GoldenToken.sol
# 3. Copier LoanFactory.sol
# 4. Copier GoldenPEFund.sol
# 5. Pour les dépendances OpenZeppelin, insérer inline:

# Exemple pour TokenFarm.sol avec dépendances inline:
cat > TokenFarm_flattened.sol << 'EOF'
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OpenZeppelin imports (copier le contenu)
import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-contracts-upgradeable/contracts/security/ReentrancyGuard.sol";
// ... etc
EOF
```

#### Étape 2: Accéder à Etherscan

1. Aller sur [https://sepolia.etherscan.io/](https://sepolia.etherscan.io/)
2. Rechercher votre adresse de contrat: `0x00307df619c9A812bD934ecf22225386b606BAF1`
3. Cliquer sur l'onglet **"Contract"**
4. Cliquer sur **"Verify and Publish"**

#### Étape 3: Remplir le Formulaire

```
1. Contract Address: 0x00307df619c9A812bD934ecf22225386b606BAF1
2. Compiler Type: Solidity (Single file)
3. Compiler Version: v0.8.19+commit.7dd6d404 (ou votre version exacte)
4. Open Source License: MIT
```

#### Étape 4: Coller le Code Source

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Coller le contenu complet de TokenFarm.sol
// + toutes les dépendances OpenZeppelin
```

#### Étape 5: Compiler Settings

```
Constructor Arguments: (if any)
  Exemple pour TokenFarm:
  0000000000000000000000001a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d (address du GoldenToken)
  0000000000000000000000000000000000000000000000000000000000000000 (VRF Coordinator)

Optimization: Yes
Optimization Runs: 200
```

#### Étape 6: Soumettre

- Cocher "I am not a robot"
- Cliquer **"Verify and Publish"**
- Attendre 30-60 secondes
- Vous verrez ✓ "Successfully generated ByteCode and ABI"

### Méthode 2: Vérification Script (Alternative)

Si vous avez le bon compilateur (0.8.19), vous pouvez utiliser:

```python
# scripts/verify_contracts_manual.py
from brownie import accounts, network, web3
import os
import requests
import json
import time

def verify_contract(contract_address, contract_name, compiler_version="v0.8.19"):
    """Vérifier un contrat sur Etherscan"""
    
    etherscan_token = os.getenv('ETHERSCAN_TOKEN')
    
    # Lire le code source
    source_file = f"contracts/{contract_name}.sol"
    with open(source_file, 'r') as f:
        source_code = f.read()
    
    # Préparer les paramètres
    params = {
        "apikey": etherscan_token,
        "module": "contract",
        "action": "verifysourcecode",
        "contractaddress": contract_address,
        "sourceCode": source_code,
        "codeformat": "solidity-single-file",
        "contractname": contract_name,
        "compilerversion": compiler_version,
        "optimizationUsed": 1,
        "runs": 200,
        "chainid": 11155111  # Sepolia
    }
    
    # URL Etherscan V2
    url = "https://api-sepolia.etherscan.io/api"
    
    # Soumettre
    print(f"Vérification de {contract_name} ({contract_address})...")
    response = requests.post(url, data=params)
    result = response.json()
    
    if result['status'] == '1':
        guid = result['result']
        print(f"✓ Soumis (GUID: {guid})")
        
        # Attendre la vérification
        for i in range(60):  # Max 5 minutes
            time.sleep(5)
            check_params = {
                "apikey": etherscan_token,
                "module": "contract",
                "action": "checkverifystatus",
                "guid": guid,
                "chainid": 11155111
            }
            check_response = requests.get(url, params=check_params)
            check_result = check_response.json()
            
            if check_result['status'] == '1':
                print(f"✓ Vérifié: {contract_name}")
                return True
            elif check_result['result'] == 'Fail - Unable to match Constructor Arguments':
                print(f"✗ Erreur: Constructor Arguments mismatch")
                return False
            elif 'Pending in queue' in check_result['result']:
                print(f"⏳ En attente... ({i+1}/60)")
            else:
                print(f"⏳ Status: {check_result['result']}")
        
        return False
    else:
        print(f"✗ Erreur: {result['message']}")
        return False

def main():
    # Vérifier les contrats
    contracts = {
        '0x00307df619c9A812bD934ecf22225386b606BAF1': 'TokenFarm',
        '0x1E80FA92066E96d7B2D1776A065165Cb8e7Ad300': 'GoldenToken',
        '0x2AEbc856b27E8565035f386e77D3Aab931e5d694': 'LoanFactory',
    }
    
    for address, name in contracts.items():
        verify_contract(address, name)
        time.sleep(5)  # Rate limiting

if __name__ == "__main__":
    main()
```

```bash
# Exécuter la vérification
brownie run scripts/verify_contracts_manual.py --network sepolia
```

---

## Déploiement sur Mainnet

### ⚠️ ATTENTION: Points Critiques

```python
# Ne pas oublier:
# 1. Vérifier les adresses des tokens (mainnet vs sepolia)
# 2. Utiliser des adresses de price feeds mainnet
# 3. Augmenter les montants de test (vrais ETH/tokens)
# 4. Tester à nouveau sur testnet avant mainnet
# 5. Avoir suffisamment d'ETH pour les gas fees
```

### Script de Déploiement Mainnet

```python
# scripts/deploy_mainnet.py
from brownie import (
    GoldenToken, TokenFarm, LoanFactory, GoldenPEFund,
    accounts, network, web3, Contract
)
from pathlib import Path
import json

# ADRESSES MAINNET
MAINNET_ADDRESSES = {
    'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    'USDC_FEED': '0x8fFfFfd4AfB6115b954Bd29BFd33Aeea2ced7e5',  # Chainlink USDC/USD
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    'DAI_FEED': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1235',  # Chainlink DAI/USD
}

def main():
    # ⚠️  CONFIRMATION
    print("="*60)
    print("DÉPLOIEMENT MAINNET")
    print("="*60)
    print("\n⚠️  ATTENTION:")
    print("- Ceci déploiera sur MAINNET avec de vrais ETH/tokens")
    print("- Les frais de gas seront importants")
    print("- Les contrats seront permanents et immuables")
    print("\nContinuer? (oui/non): ", end="")
    
    response = input()
    if response.lower() != 'oui':
        print("Déploiement annulé.")
        return
    
    # Charger le compte mainnet
    account = accounts.load('mainnet-account')
    print(f"\nDéploiement depuis: {account.address}")
    print(f"Balance: {account.balance() / 10**18:.2f} ETH")
    
    # Même processus que Sepolia
    # ... (code similaire à deploy_sepolia.py)
    
    print("\n✓ Déploiement Mainnet Complet")

if __name__ == "__main__":
    main()
```

---

## Post-Déploiement

### 1. Vérifications

```bash
# Vérifier les adresses stockées
cat deployments_sepolia.json

# Affichage:
# {
#   "GoldenToken": "0x1E80FA92066E96d7B2D1776A065165Cb8e7Ad300",
#   "TokenFarm": "0x00307df619c9A812bD934ecf22225386b606BAF1",
#   "LoanFactory": "0x2AEbc856b27E8565035f386e77D3Aab931e5d694",
#   "GoldenPEFund": "0x35843c4B5836883093350653617b4983D33f8A2B"
# }
```

### 2. Tester les Interactions

```python
# scripts/test_deployment.py
from brownie import Contract, web3, accounts

def main():
    # Charger les contrats
    token_farm = Contract('0x00307df619c9A812bD934ecf22225386b606BAF1')
    
    # Test 1: ETH native deposits
    stats = token_farm.getNativeDepositStats()
    print(f"ETH Deposits: {web3.from_wei(stats[0], 'ether')} ETH")
    
    # Test 2: Stakers
    stakers = token_farm.getStakers()
    print(f"Stakers: {len(stakers)}")
    
    # Test 3: Allowed tokens
    usdc = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
    allowed = token_farm.allowedTokens(usdc)
    print(f"USDC allowed: {allowed}")
    
    print("\n✓ Tous les tests passent")

if __name__ == "__main__":
    main()
```

```bash
brownie run scripts/test_deployment.py --network sepolia
```

### 3. Mise à Jour du Front-End

```typescript
// front_end/src/helper-config.json
{
  "sepolia": {
    "GoldenToken": "0x1E80FA92066E96d7B2D1776A065165Cb8e7Ad300",
    "TokenFarm": "0x00307df619c9A812bD934ecf22225386b606BAF1",
    "LoanFactory": "0x2AEbc856b27E8565035f386e77D3Aab931e5d694",
    "GoldenPEFund": "0x35843c4B5836883093350653617b4983D33f8A2B",
    "blockExplorerUrl": "https://sepolia.etherscan.io"
  },
  "mainnet": {
    "GoldenToken": "0x...",
    "TokenFarm": "0x...",
    "LoanFactory": "0x...",
    "GoldenPEFund": "0x...",
    "blockExplorerUrl": "https://etherscan.io"
  }
}
```

---

## Troubleshooting

### Erreur: "No matching compiler version"

```
Solution:
- Vérifier quelle version exacte a été utilisée pour la compilation initiale
- Si 0.8.19, utiliser Docker:
  docker pull ethereum/solc:0.8.19
  
- Ou installer manuellement:
  brownie pm install OpenZeppelin/openzeppelin-contracts@4.9.3
  
- Ensuite compiler:
  brownie compile --all
```

### Erreur: "Insufficient gas"

```python
# Augmenter les gas limits
tx = token_farm.depositNative(
    {'from': account, 'value': web3.to_wei(10, 'ether'), 'gas': 500000}
)

# Ou configurer globalement dans brownie-config.yaml
gas_limit: 8000000
gas_price: web3.to_wei(20, 'gwei')
```

### Erreur: "Transaction reverted"

```bash
# Obtenir plus de détails
brownie run scripts/deploy.py --network sepolia -v
# Affiche les revert messages

# Vérifier les events logs
tx = token_farm.depositNative({'from': account, 'value': web3.to_wei(1, 'ether')})
for log in tx.logs:
    print(log)
```

### Vérification échouée: "Constructor Arguments mismatch"

```python
# Obtenir les constructor arguments encodés:
from brownie import GoldenToken, web3

# Si deployed avec: GoldenToken.deploy({'from': account})
# Les arguments sont: ()

# Si deployed avec paramètres:
# Les arguments doivent être en format ABI encodé
encoded_args = web3.codec.encode_abi(
    ['address', 'uint256'],
    ['0x...', 1000]
)
print("Constructor args:", encoded_args.hex())
```

---

## Checklist Déploiement

- [ ] Installer Brownie et dépendances
- [ ] Créer comptes (sepolia-account, mainnet-account)
- [ ] Configurer .env avec RPC URLs et API keys
- [ ] Vérifier les versions du compilateur
- [ ] Tester sur Sepolia d'abord
- [ ] Compiler les contrats
- [ ] Exécuter le script de déploiement
- [ ] Vérifier les adresses déployées
- [ ] Vérifier les contrats sur Etherscan
- [ ] Mettre à jour le front-end avec les nouvelles adresses
- [ ] Tester les interactions de base
- [ ] Si satisfait, déployer sur Mainnet
- [ ] Maintenir une copie de deployments.json en sécurité

---

**Version:** 1.0  
**Date:** 4 May 2026  
**Prochaine Review:** Après premier déploiement mainnet
