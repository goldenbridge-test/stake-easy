# Guide d'Utilisation Pratique - Goldenbridge

**Dernière mise à jour:** Mai 4, 2026  
**Version:** 1.0

---

## Table des Matières

1. [Démarrage Rapide](#démarrage-rapide)
2. [Scénarios d'Utilisation](#scénarios-dutilisation)
3. [Exemples de Code](#exemples-de-code)
4. [Dépannage](#dépannage)
5. [FAQ](#faq)

---

## Démarrage Rapide

### Prérequis

```bash
# Installation Brownie
pip install eth-brownie

# Cloner le repo
git clone <repo-url>
cd goldenbridge

# Installer les dépendances
pip install -r requirements.txt
```

### Configuration Initiale

```bash
# 1. Configurer Sepolia dans Brownie
brownie networks add Ethereum sepolia host=https://sepolia.infura.io/v3/YOUR-KEY

# 2. Créer un compte
brownie accounts new myaccount

# 3. Configurer le .env
export SEPOLIA_RPC_URL="https://sepolia.infura.io/v3/YOUR-KEY"
export ETHERSCAN_TOKEN="YOUR-ETHERSCAN-KEY"
```

---

## Scénarios d'Utilisation

### Scénario 1: Staker Individuel

#### Objectif
Staker 100 USDC pour générer du revenu passif

#### Étapes

```python
# 1. Approuver le TokenFarm
from brownie import accounts, Contract

user = accounts.load('myaccount')
usdc = Contract('0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238')
token_farm = Contract('0x00307df619c9A812bD934ecf22225386b606BAF1')

usdc.approve(token_farm.address, 100e6, {'from': user})

# 2. Staker les tokens
token_farm.stakeTokens(100e6, usdc.address, {'from': user})

# 3. Attendre les récompenses
# Owner distribuera les récompenses GOLD via issueTokens()
```

#### Résultat
```
Votre Wallet:
├─ USDC: -100 (dans TokenFarm)
├─ GOLD: +X (récompenses de staking)
└─ Historique: Événement TokenStaked
```

---

### Scénario 2: Propriétaire Créant un Prêt

#### Objectif
Créer un prêt de 50 ETH à 10% d'intérêt sur 365 jours

#### Étapes

```python
from brownie import accounts, Contract, web3

owner = accounts.load('myaccount')
token_farm = Contract('0x00307df619c9A812bD934ecf22225386b606BAF1')

borrower_address = "0xBorrowerAddress"

# 1. Déposer les ETH natifs
tx = token_farm.depositNative(
    {'from': owner, 'value': web3.to_wei(50, 'ether')}
)
print(f"✓ Dépôt ETH: {tx.events['NativeTokenDeposited']}")

# 2. Créer le prêt
loan_tx = token_farm.createProjectLoan(
    borrower_address,
    web3.to_wei(50, 'ether'),
    10,      # 10% interest
    365,     # 365 days
    {'from': owner}
)
loan_id = loan_tx.return_value
print(f"✓ Prêt créé: ID={loan_id}")

# 3. Financer le prêt
invest_tx = token_farm.investInLoan(
    loan_id,
    web3.to_wei(50, 'ether'),
    {'from': owner}
)
print(f"✓ Prêt financé: {invest_tx.events['LoanFunded']}")

# 4. Vérifier le bilan
stats = token_farm.getNativeDepositStats()
print(f"Statistiques ETH:")
print(f"  Total déposé: {web3.from_wei(stats[0], 'ether')} ETH")
print(f"  Solde actuel: {web3.from_wei(stats[1], 'ether')} ETH")
print(f"  Nombre dépositaires: {stats[2]}")
```

#### Résultat
```
✓ Dépôt ETH: 50 ETH
✓ Prêt créé: ID=0
✓ Prêt financé: 50 ETH envoyé à Borrower
✓ Statistiques ETH:
  Total déposé: 50 ETH
  Solde actuel: 0 ETH (envoyé au prêt)
  Nombre dépositaires: 1
```

---

### Scénario 3: Distribution des Récompenses

#### Objectif
Distribuer les rendements de prêt aux stakers

#### Étapes

```python
from brownie import accounts, Contract, web3

owner = accounts.load('myaccount')
token_farm = Contract('0x00307df619c9A812bD934ecf22225386b606BAF1')

# 1. Attendre que l'emprunteur rembourse
# Supposons qu'il a remboursé 55 ETH (50 + 5 intérêts)
# via StateMachine.repay{value: 55 ETH}()

# 2. Vérifier les pendingReturns
loan_address = "0xStateMachineAddress"
pending = token_farm.pendingReturns(loan_address)
print(f"Retours en attente: {web3.from_wei(pending, 'ether')} ETH")

# 3. Distribuer aux stakers
dist_tx = token_farm.distributeLoanReturns({'from': owner})

# 4. Vérifier le résultat
event = dist_tx.events['LoanReturnsDistributed']
print(f"✓ Distribution effectuée:")
print(f"  Montant total: {web3.from_wei(event['totalAmount'], 'ether')} ETH")
print(f"  Stakers récompensés: {event['stakerCount']}")
```

#### Résultat
```
✓ Distribution effectuée:
  Montant total: 55 ETH (en GOLD tokens)
  Stakers récompensés: 5
```

---

### Scénario 4: Gérer les Retraits d'ETH

#### Objectif
Retirer les fonds en excès du contrat

#### Étapes

```python
from brownie import accounts, Contract, web3

owner = accounts.load('myaccount')
token_farm = Contract('0x00307df619c9A812bD934ecf22225386b606BAF1')

# 1. Vérifier le solde
balance = token_farm.getNativeBalance()
print(f"Solde disponible: {web3.from_wei(balance, 'ether')} ETH")

# 2. Retirer 10 ETH
withdraw_amount = web3.to_wei(10, 'ether')
withdraw_tx = token_farm.withdrawNative(withdraw_amount, {'from': owner})

print(f"✓ Retrait effectué:")
print(f"  Montant: {web3.from_wei(withdraw_amount, 'ether')} ETH")
print(f"  Destinataire: {owner.address}")

# 3. Vérifier le nouveau solde
new_balance = token_farm.getNativeBalance()
print(f"Nouveau solde: {web3.from_wei(new_balance, 'ether')} ETH")
```

#### Résultat
```
✓ Retrait effectué:
  Montant: 10 ETH
  Destinataire: 0xOwnerAddress
Nouveau solde: X ETH
```

---

## Exemples de Code

### Script Complet: Deploy & Initialize

```python
# scripts/setup_full.py
from brownie import (
    GoldenToken, TokenFarm, LoanFactory, 
    accounts, web3, Contract
)

def main():
    owner = accounts.load('myaccount')
    
    # 1. Deploy GoldenToken
    print("Déploiement de GoldenToken...")
    golden_token = GoldenToken.deploy({'from': owner})
    print(f"✓ GoldenToken: {golden_token.address}")
    
    # 2. Deploy TokenFarm
    print("Déploiement de TokenFarm...")
    token_farm = TokenFarm.deploy(
        golden_token.address,
        "0x0000000000000000000000000000000000000000",
        {'from': owner}
    )
    print(f"✓ TokenFarm: {token_farm.address}")
    
    # 3. Deploy LoanFactory
    print("Déploiement de LoanFactory...")
    loan_factory = LoanFactory.deploy(token_farm.address, {'from': owner})
    print(f"✓ LoanFactory: {loan_factory.address}")
    
    # 4. Set LoanFactory in TokenFarm
    print("Configuration des références...")
    token_farm.setLoanFactory(loan_factory.address, {'from': owner})
    
    # 5. Add allowed tokens (Sepolia testnet)
    print("Configuration des tokens autorisés...")
    usdc_address = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"
    usdc_feed = "0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E"
    
    token_farm.addAllowedTokens(usdc_address, {'from': owner})
    token_farm.setPriceFeedContract(usdc_address, usdc_feed, {'from': owner})
    print(f"✓ USDC configuré")
    
    # 6. Fund TokenFarm with GOLD
    print("Financement de TokenFarm...")
    supply = golden_token.totalSupply()
    golden_token.transfer(token_farm.address, supply // 2, {'from': owner})
    print(f"✓ {supply // 2 / 10**18:.0f} GOLD transférés")
    
    # 7. Initial ETH deposit
    print("Dépôt initial d'ETH...")
    token_farm.depositNative(
        {'from': owner, 'value': web3.to_wei(100, 'ether')}
    )
    print(f"✓ 100 ETH déposés")
    
    print("\n" + "="*50)
    print("DÉPLOIEMENT COMPLET ✓")
    print("="*50)
    print(f"GoldenToken:  {golden_token.address}")
    print(f"TokenFarm:    {token_farm.address}")
    print(f"LoanFactory:  {loan_factory.address}")
```

### Monitoring Script

```python
# scripts/monitor.py
from brownie import Contract, web3
from datetime import datetime

def monitor_protocol():
    """Affiche l'état du protocole"""
    
    token_farm = Contract('0x00307df619c9A812bD934ecf22225386b606BAF1')
    
    # Statistiques ETH
    stats = token_farm.getNativeDepositStats()
    
    print("\n" + "="*60)
    print(f"GOLDEN BRIDGE - MONITORING ({datetime.now()})")
    print("="*60)
    
    print("\n📊 STATISTIQUES ETH NATIVE")
    print(f"  Total déposé (historique): {web3.from_wei(stats[0], 'ether'):.2f} ETH")
    print(f"  Solde actuel:              {web3.from_wei(stats[1], 'ether'):.2f} ETH")
    print(f"  Nombre de dépositaires:    {stats[2]}")
    
    print("\n📈 MÉTRIQUES DE STAKING")
    stakers = token_farm.getStakers()
    print(f"  Nombre de stakers: {len(stakers)}")
    
    if len(stakers) > 0:
        total_value = 0
        for staker in stakers[:5]:  # Top 5
            value = token_farm.getUserTotalValue(staker)
            total_value += value
            print(f"    - {staker[:6]}... : {web3.from_wei(value, 'ether'):.2f} ETH")
        
        if len(stakers) > 5:
            print(f"    ... et {len(stakers) - 5} autres stakers")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    monitor_protocol()
```

---

## Dépannage

### Problème: "Ownable: caller is not the owner"

**Cause**: Vous n'êtes pas le propriétaire du contrat

**Solution**:
```python
# Vérifier qui est le propriétaire
token_farm = Contract('...')
owner = token_farm.owner()
print(f"Propriétaire: {owner}")

# Si c'est vous, transférer la propriété
from brownie import accounts
new_owner = accounts.load('myaccount')
# Demander au propriétaire actuel de transférer
```

---

### Problème: "Insufficient balance"

**Cause**: Le contrat n'a pas assez d'ETH

**Solution**:
```python
# Vérifier le solde
balance = token_farm.getNativeBalance()
print(f"Solde: {balance} wei")

# Déposer plus d'ETH
owner = accounts.load('myaccount')
token_farm.depositNative(
    {'from': owner, 'value': web3.to_wei(50, 'ether')}
)
```

---

### Problème: "Token currently isn't allowed"

**Cause**: Le token n'a pas été ajouté à la whitelist

**Solution**:
```python
# Ajouter le token
owner = accounts.load('myaccount')
token_farm.addAllowedTokens(token_address, {'from': owner})

# Configurer le price feed
feed_address = "0x..."
token_farm.setPriceFeedContract(
    token_address, 
    feed_address, 
    {'from': owner}
)
```

---

### Problème: "Stale price feed"

**Cause**: Le price feed Chainlink n'est pas à jour

**Solution**:
```python
# Vérifier le timestamp du price feed
from brownie import Contract
feed = Contract(feed_address)
(roundId, price, startedAt, timestamp, answeredInRound) = feed.latestRoundData()

import time
current_time = time.time()
age = current_time - timestamp
print(f"Price feed age: {age} seconds")

# Si trop vieux (> 24h), attendre ou changer le feed
if age > 86400:
    print("⚠️ Price feed trop ancien")
```

---

## FAQ

### Q1: Combien de frais pour utiliser Goldenbridge?

**R**: Les frais dépendent du réseau:
- **Sepolia (testnet)**: ~0 frais
- **Mainnet**: ~0.5-2% par transaction (à déterminer)

### Q2: Quel est le rendement attendu?

**R**: Le rendement dépend de:
- Montant total staké
- Montant des retours de prêts
- Durée du staking

Exemple:
```
Si vous stakez 100 USDC et que les prêts génèrent 10 ETH de rendement
Et que vous représentez 1% de la valeur totale stakée
Vous recevrez 0.1 ETH en GOLD tokens
```

### Q3: Comment retirer mes tokens?

**R**:
```python
token_farm.unstakeTokens(token_address, {'from': user})
```

Cela retourne:
1. Vos tokens d'origine
2. Mais PAS les récompenses (vous devez les réclamer séparément)

### Q4: Les prêts sont-ils remboursés?

**R**: Oui, les emprunteurs doivent rembourser via `StateMachine.repay()`:

```python
# Depuis l'adresse de l'emprunteur
loan = Contract(loan_address)
loan.repay({'value': amount_with_interest})
```

### Q5: Puis-je être propriétaire de plusieurs comptes?

**R**: Non, le protocole n'a qu'un seul Owner (Ownable pattern). Pour multi-sig:
```python
# Transférer à un contrat MultiSig
# ou à un DAO
token_farm.transferOwnership(multisig_address)
```

### Q6: Qu'est-ce qui se passe si un prêt n'est pas remboursé?

**R**: Le contrat reste en état `ACTIVE` jusqu'à `closeLoan()`. 
Gestion manuelle requise:
- Contacter l'emprunteur
- Appeler `closeLoan()` pour forcer la clôture
- Pas de liquidation automatique (à implémenter)

### Q7: Comment vérifier mes récompenses?

**R**:
```python
user = "0xYourAddress"
token_farm = Contract('...')

# Valeur totale stakée
total_value = token_farm.getUserTotalValue(user)
print(f"Valeur stakée: {total_value} wei")

# Solde de tokens spécifiques
usdc_balance = token_farm.stakingBalance(usdc_address, user)
print(f"USDC staké: {usdc_balance}")
```

### Q8: Y a-t-il un délai de retrait?

**R**: Non (actuellement). Vous pouvez unstaker à tout moment.
*Futur*: Un délai de déblocage sera probablement ajouté.

### Q9: Comment retirer mes ETH?

**R**: Seul l'Owner peut:
```python
owner = accounts.load('myaccount')
token_farm.withdrawNative(
    web3.to_wei(10, 'ether'),
    {'from': owner}
)
```

### Q10: Quel est le maximum que je peux staker?

**R**: 
```python
max_stake = token_farm.maxStakePerUser()
# Actuellement: 100,000 * 10^18 tokens (1M si décimales=18)

# L'owner peut le changer:
token_farm.setMaxStakePerUser(new_max, {'from': owner})
```

---

## Support

Pour toute question:
- 📚 Consulter [ARCHITECTURE_COMPLETE.md](ARCHITECTURE_COMPLETE.md)
- 🔍 Vérifier les logs Etherscan
- 🧪 Lancer les tests: `brownie test -v`
- 💬 Contacter l'équipe

---

**Version:** 1.0  
**Date:** 4 May 2026  
**Repository:** [GitHub](https://github.com)
