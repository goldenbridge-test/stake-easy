# Documentation Complète de l'Architecture - Goldenbridge

**Dernière mise à jour:** Mai 4, 2026  
**Version:** 1.0  
**Chaîne de déploiement:** Ethereum Sepolia (11155111)

---

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture Générale](#architecture-générale)
3. [Contrats Détaillés](#contrats-détaillés)
4. [Flux d'Interaction](#flux-dinteraction)
5. [Variables d'État](#variables-détat)
6. [Événements](#événements)
7. [Considérations de Sécurité](#considérations-de-sécurité)
8. [Déploiement](#déploiement)
9. [Tests](#tests)
10. [API Publique](#api-publique)

---

## Vue d'ensemble

Goldenbridge est un écosystème DeFi complet composé de:

- **GoldenToken (GOLD)**: Token ERC20 principal du protocole
- **TokenFarm**: Plateforme de staking et gestion des prêts
- **LoanFactory**: Factory pour créer et gérer les contrats de prêt
- **StateMachine**: Machine à états pour la gestion du cycle de vie des prêts
- **GoldenPEFund**: Fonds d'investissement privé

### Cas d'Usage Principal

```
Utilisateurs stakent des tokens
        ↓
Reçoivent des récompenses du TokenFarm
        ↓
Les fonds stakés servent à financer des prêts
        ↓
Les prêts génèrent des intérêts
        ↓
Les intérêts sont distribués aux stakers
```

---

## Architecture Générale

### Diagramme des Dépendances

```
┌─────────────────────────────────────────────────────────┐
│                   GOLDEN BRIDGE                         │
└─────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    ┌────▼─────┐   ┌─────▼────┐   ┌──────▼──────┐
    │GoldenToken│   │TokenFarm │   │GoldenPEFund│
    └────┬──────┘   └─────┬────┘   └──────┬──────┘
         │                │               │
         └────────────────┼───────────────┘
                          │
                   ┌──────▼──────┐
                   │LoanFactory  │
                   └──────┬──────┘
                          │
         ┌────────────────┴────────────────┐
         │                                 │
    ┌────▼──────┐               ┌─────────▼──┐
    │StateMachine│               │LoanContract│
    └───────────┘               └────────────┘
    (Prêt Individuel)          (1 par prêt)
```

### Stack Technologique

| Couche | Technologies |
|--------|-------------|
| **Blockchain** | Ethereum (Sepolia) |
| **Langage** | Solidity 0.8.19 |
| **Standards** | ERC20, Ownable, ReentrancyGuard |
| **Oracles** | Chainlink (AggregatorV3Interface) |
| **Framework** | Brownie (py) |
| **Dépendances** | OpenZeppelin, Chainlink |

---

## Contrats Détaillés

### 1. GoldenToken

#### Objectif
Token ERC20 principal du protocole Goldenbridge

#### Propriétés
```solidity
- Nom: Golden Token
- Symbole: GOLD
- Decimals: 18
- Supply: Déterminé à la création
```

#### Responsabilités Principales
- Représenter la valeur du protocole
- Servir de medium de récompense pour les stakers
- Être transférable entre adresses

#### Hiérarchie de Propriété
```
Owner (Deployer)
  ├─ Peut: Transférer, Approuver
  ├─ Peut: Brûler (optionnel)
  └─ Contrôle: Supply totale
```

#### Interactions
```
GoldenToken
    ↑
    ├─ approveFrom(TokenFarm)
    ├─ transferFrom(TokenFarm → Staker)
    └─ balanceOf(queries)
```

---

### 2. TokenFarm (Cœur du protocole)

#### Objectif
**Plateforme centralisée** pour:
- Gérer le staking de tokens
- Financer les prêts
- Distribuer les récompenses
- Tracker les dépôts ETH natifs

#### Architecture Interne

```
┌──────────────────────────────────┐
│        TOKEN FARM                │
├──────────────────────────────────┤
│ Staking Management               │
│  ├─ stakeTokens()                │
│  ├─ unstakeTokens()              │
│  └─ issueTokens()                │
├──────────────────────────────────┤
│ Loan Management                  │
│  ├─ createProjectLoan()          │
│  ├─ investInLoan()               │
│  └─ closeLoan()                  │
├──────────────────────────────────┤
│ Loan Returns Distribution        │
│  ├─ receiveLoanReturns()         │
│  └─ distributeLoanReturns()      │
├──────────────────────────────────┤
│ Native ETH Management            │
│  ├─ depositNative()              │
│  ├─ withdrawNative()             │
│  └─ getNativeBalance()           │
├──────────────────────────────────┤
│ Price Feed Integration           │
│  └─ getTokenEthPrice()           │
└──────────────────────────────────┘
```

#### État Critique (State Variables)

```solidity
// Staking Data
mapping(address => mapping(address => uint256)) stakingBalance
  └─ Solde de chaque token staké par chaque utilisateur

mapping(address => uint256) uniqueTokensStaked
  └─ Nombre de tokens distincts stakés par utilisateur

address[] stakers
  └─ Liste de tous les stakers actifs

// Token Configuration
address[] allowedTokens
  └─ Tokens acceptés pour le staking

mapping(address => address) tokenPriceFeedMapping
  └─ Chainlink price feed pour chaque token

// Loan Management
mapping(address => uint256) pendingReturns
  └─ Fonds en attente de distribution par prêt

mapping(address => bool) authorizedLoans
  └─ Prêts autorisés à envoyer des fonds

// ETH Native Tracking
mapping(address => uint256) nativeDepositsByAddress
  └─ Dépôts ETH par adresse

uint256 totalNativeDeposited
  └─ Total historique des dépôts ETH

uint256 nativeDepositCount
  └─ Nombre de dépositaires distincts
```

#### Fonction Principale: Flux de Staking

```
1. stakeTokens(amount, token)
   ├─ Valider: amount > 0 et token allowed
   ├─ TransferFrom user → TokenFarm
   ├─ Mettre à jour: stakingBalance[token][user] += amount
   ├─ Si 1er token: ajouter user à stakers[]
   └─ Émettre: TokenStaked event

2. issueTokens() [onlyOwner]
   ├─ Pour chaque staker:
   │  ├─ Calculer: userValue = getUserTotalValue(staker)
   │  └─ Transférer: GOLD tokens = userValue
   └─ Émettre: RewardsIssued event

3. unstakeTokens(token)
   ├─ Récupérer: balance = stakingBalance[token][user]
   ├─ TransferTo user
   ├─ Mettre à jour: stakingBalance[token][user] = 0
   ├─ Si plus de tokens: retirer de stakers[]
   └─ Émettre: TokenUnstaked event
```

#### Fonction Principale: Cycle de Prêt

```
1. Owner crée un prêt
   createProjectLoan(borrower, amount, interest, duration)
   ├─ LoanFactory.createLoan() → loanId
   ├─ Récupérer: loanAddress
   ├─ authorizeLoan(loanAddress)
   └─ return loanId

2. Owner finance le prêt
   investInLoan(loanId, amount)
   ├─ Valider: address(this).balance >= amount
   ├─ LoanFactory.fundLoan{value: amount}(loanId)
   └─ Émettre: LoanFunded event

3. Prêt retourne les fonds + intérêts
   receive() externe payable
   ├─ Valider: msg.sender in authorizedLoans
   ├─ pendingReturns[msg.sender] += msg.value
   └─ Émettre: LoanReturnsReceived event

4. Distribuer les retours aux stakers
   distributeLoanReturns()
   ├─ Calculer: totalReturns = sum(pendingReturns)
   ├─ Calculer: totalStakedValue = sum(userValues)
   ├─ Pour chaque staker:
   │  ├─ userShare = (totalReturns * userValue) / totalStakedValue
   │  └─ Transfer GOLD = userShare
   ├─ Reset tous les pendingReturns à 0
   └─ Émettre: LoanReturnsDistributed event
```

#### Fonction Principale: Gestion ETH Natif

```
1. depositNative() [onlyOwner] payable
   ├─ Valider: msg.value > 0
   ├─ nativeDepositsByAddress[msg.sender] += msg.value
   ├─ totalNativeDeposited += msg.value
   ├─ Si 1er dépôt: nativeDepositCount++
   └─ Émettre: NativeTokenDeposited event

2. withdrawNative(amount) [onlyOwner] nonReentrant
   ├─ Valider: amount > 0 et balance suffisant
   ├─ (bool success, ) = msg.sender.call{value: amount}("")
   ├─ Valider: success
   └─ Émettre: NativeTokenWithdrawn event

3. getNativeDepositStats()
   └─ return (totalNativeDeposited, address(this).balance, nativeDepositCount)
```

#### Intégration Chainlink

```solidity
function getTokenEthPrice(address token) 
  → returns (uint256 price, uint8 decimals)

Processus:
1. Récupérer priceFeed = tokenPriceFeedMapping[token]
2. AggregatorV3Interface priceFeed = AggregatorV3Interface(address)
3. priceFeed.latestRoundData()
   ├─ Valider: price > 0
   ├─ Valider: timestamp > 0
   └─ Valider: answeredInRound >= roundID (pas de stale price)
4. return (uint256(price), priceFeed.decimals())

Utilisation:
getUserTokenStakingBalanceEthValue(user, token)
  = (stakingBalance[token][user] * price) / 10^decimals
```

---

### 3. LoanFactory

#### Objectif
Factory pattern pour créer et gérer les instances de prêt

#### Responsabilités

```
┌──────────────────────────────┐
│     LOAN FACTORY             │
├──────────────────────────────┤
│ • Créer des contrats StateMachine
│ • Tracker les prêts créés
│ • Fournir les adresses des prêts
│ • Gérer le financement des prêts
└──────────────────────────────┘
```

#### State Variables

```solidity
mapping(uint256 => address) public loans
  └─ Mapper loanId → adresse du contrat

uint256 public loanIdCounter
  └─ Compteur pour générer les IDs

address public tokenFarm
  └─ Référence au TokenFarm (seul caller autorisé)
```

#### Méthodes Principales

```solidity
createLoan(amount, interest, duration, borrower)
  ├─ Créer: new StateMachine(...)
  ├─ loans[loanIdCounter] = address
  ├─ loanIdCounter++
  └─ return loanIdCounter - 1

fundLoan(loanId) [payable]
  ├─ StateMachine(loans[loanId]).fund{value: msg.value}()

closeLoan(loanId)
  ├─ StateMachine(loans[loanId]).close()

getLoanAddress(loanId)
  └─ return loans[loanId]
```

---

### 4. StateMachine (Contrat de Prêt)

#### Objectif
Représenter et gérer l'**état du prêt** tout au long de son cycle de vie

#### États du Prêt

```
┌─────────────────────────────────────────────────┐
│              STATE MACHINE                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  UNINITIALIZED  ──┐                            │
│                  ├──→ ACTIVE ──→ REPAID       │
│                  │         └──→ DEFAULTED     │
│                  │                 │          │
│                  └─────────→ CLOSED ←──────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
```

#### Propriétés du Prêt

```solidity
struct LoanData {
    address borrower;           // Emprunteur
    uint256 amount;            // Montant en wei
    uint256 interest;          // Taux d'intérêt %
    uint256 duration;          // Durée en jours
    uint256 fundedAmount;      // Montant financé
    uint256 repaidAmount;      // Montant remboursé
    uint256 createdAt;         // Timestamp création
    uint256 fundedAt;          // Timestamp financement
    LoanState currentState;    // État actuel
}
```

#### Transitions d'État

```
UNINITIALIZED → ACTIVE
  ├─ Condition: fund(msg.value > 0)
  ├─ Action: enregistrer fundedAt = now
  └─ Émettre: LoanFunded

ACTIVE → REPAID
  ├─ Condition: borrower envoie montant + intérêts
  ├─ Action: Notifier TokenFarm via receiveLoanReturns()
  └─ Émettre: LoanRepaid

ACTIVE → DEFAULTED
  ├─ Condition: duration expirée sans remboursement
  ├─ Action: closeLoan() appelé
  └─ Émettre: LoanDefaulted

ACTIVE/REPAID/DEFAULTED → CLOSED
  ├─ Condition: closeLoan() appelé par TokenFarm
  └─ Émettre: LoanClosed
```

---

### 5. GoldenPEFund

#### Objectif
Fonds d'investissement privé pour les investisseurs accrédités

#### Caractéristiques

```
• Gestion des investissements privés
• Distribution proportionnelle des rendements
• Vérification de l'accréditation
• Limites de dépôt et de retrait
```

#### Interaction avec TokenFarm

```
GoldenPEFund
    ├─ Partage l'infrastructure de staking
    ├─ Reçoit des retours via distributeLoanReturns()
    └─ Distribue aux investisseurs
```

---

## Flux d'Interaction

### Flux Complet: De l'Utilisateur au Rendement

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX COMPLET                             │
└─────────────────────────────────────────────────────────────┘

Jour 1: Utilisateur décide de staker
────────────────────────────────────
User → TokenFarm.stakeTokens(100 USDC, USDC_ADDRESS)
  ├─ Valide: USDC est allowed
  ├─ TransferFrom(User → TokenFarm, 100 USDC)
  ├─ stakingBalance[USDC][User] = 100
  ├─ Staker ajouté à stakers[]
  └─ Émettre: TokenStaked(User, USDC, 100)

Jour 2: Owner crée un prêt
───────────────────────────
Owner → TokenFarm.createProjectLoan(
  Borrower, 50 ETH, 10% intérêt, 365 jours
)
  ├─ LoanFactory.createLoan(...)
  ├─ StateMachine créé
  ├─ authorizeLoan(StateMachine_Address)
  └─ return loanId = 0

Jour 3: Owner finance le prêt (utilise dépôts ETH)
──────────────────────────────────────────────────
Owner → TokenFarm.depositNative{value: 50 ETH}()
  ├─ nativeDepositsByAddress[Owner] = 50 ETH
  ├─ totalNativeDeposited = 50 ETH
  └─ Émettre: NativeTokenDeposited(Owner, 50 ETH)

Owner → TokenFarm.investInLoan(0, 50 ETH)
  ├─ Valide: address(this).balance >= 50 ETH
  ├─ LoanFactory.fundLoan{value: 50 ETH}(0)
  │  └─ StateMachine.fund{50 ETH}()
  │     ├─ currentState = ACTIVE
  │     ├─ fundedAt = block.timestamp
  │     └─ 50 ETH envoyé à Borrower
  └─ Émettre: LoanFunded(0, 50 ETH)

Jour 4: Owner distribue les récompenses
────────────────────────────────────────
Owner → TokenFarm.issueTokens()
  Pour chaque Staker:
    ├─ userValue = getUserTotalValue(User)
    │  = (100 USDC * price_USDC_in_ETH) / 10^6
    ├─ goldenToken.safeTransfer(User, userValue)
    └─ Émettre: TokenStaked event

Jour 100: Borrower rembourse le prêt
─────────────────────────────────────
Borrower → StateMachine.repay{value: 55 ETH}()
  │ (50 ETH principal + 5 ETH intérêts)
  ├─ currentState = REPAID
  ├─ repaidAmount = 55 ETH
  └─ StateMachine → TokenFarm.receiveLoanReturns{55 ETH}()
    ├─ Valide: authorizedLoans[StateMachine_Address] = true
    ├─ pendingReturns[StateMachine_Address] += 55 ETH
    └─ Émettre: LoanReturnsReceived(StateMachine, 55 ETH)

Jour 101: Owner distribue les intérêts
──────────────────────────────────────
Owner → TokenFarm.distributeLoanReturns()
  ├─ totalReturns = 55 ETH
  ├─ totalStakedValue = sum(all userValues) = X ETH
  │
  └─ Pour User (qui a staké):
    ├─ userValue = 0.1 X (hypothèse)
    ├─ userShare = (55 * 0.1X) / X = 5.5 ETH en GOLD
    ├─ goldenToken.safeTransfer(User, 5.5 GOLD)
    └─ Reset: pendingReturns[StateMachine] = 0
    
    └─ Émettre: LoanReturnsDistributed(55 ETH, 1 staker, T)

Résultat Final:
───────────────
User a:
  ├─ 100 USDC (original)
  ├─ GOLD tokens de jour 4 (rewards issuing)
  └─ GOLD tokens de jour 101 (loan returns distributing)
```

---

## Variables d'État

### TokenFarm - État Critique

| Variable | Type | Rôle | Protection |
|----------|------|------|-----------|
| `stakingBalance` | mapping | Balances par token | nonReentrant |
| `uniqueTokensStaked` | mapping | Nombre de tokens uniques | Privé |
| `stakers` | array | Liste des stakers | Publique |
| `allowedTokens` | array | Tokens autorisés | onlyOwner |
| `pendingReturns` | mapping | Fonds en attente | onlyOwner |
| `authorizedLoans` | mapping | Prêts autorisés | onlyOwner |
| `nativeDepositsByAddress` | mapping | Dépôts ETH | onlyOwner |
| `totalNativeDeposited` | uint256 | Total historique | Lecture seule |
| `nativeDepositCount` | uint256 | Nombre dépositaires | Lecture seule |

### Limitations Importantes

```solidity
maxStakePerUser = 100,000 * 10^18 tokens
  └─ Limite par utilisateur pour éviter la concentration
```

---

## Événements

### TokenFarm Events

```solidity
// Staking Events
event TokenStaked(
    address indexed user,
    address indexed token,
    uint256 amount
);

event TokenUnstaked(
    address indexed user,
    address indexed token,
    uint256 amount
);

// Loan Management Events
event LoanCreated(
    uint256 indexed loanId,
    uint256 amount,
    uint256 interest,
    uint256 duration
);

event LoanFunded(uint256 indexed loanId, uint256 amount);
event LoanClosed(uint256 indexed loanId);

event LoanReturnsReceived(address indexed loanAddress, uint256 amount);
event LoanReturnsDistributed(
    uint256 totalAmount,
    uint256 stakerCount,
    uint256 timestamp
);

// Native ETH Events
event NativeTokenDeposited(
    address indexed depositor,
    uint256 amount,
    uint256 timestamp
);

event NativeTokenWithdrawn(
    address indexed recipient,
    uint256 amount,
    uint256 timestamp
);

// Token Management Events
event AllowedTokenAdded(address indexed token);
event AllowedTokenRemoved(address indexed token);
```

### Utilité des Events

```
Events → Indexation Etherscan
   ├─ Traçabilité complète
   ├─ Audit trail
   ├─ Graphing off-chain
   └─ Webhooks/Notifications
```

---

## Considérations de Sécurité

### Protections Implémentées

#### 1. Access Control

```solidity
onlyOwner
  ├─ Limitées à: addAllowedTokens, createProjectLoan, etc.
  └─ Vérification: require(msg.sender == owner)

onlyAuthorizedLoan
  ├─ Limitées à: receiveLoanReturns
  └─ Vérification: require(authorizedLoans[msg.sender])
```

#### 2. Reentrancy Protection

```solidity
nonReentrant
  ├─ Appliquée à: withdrawNative, investInLoan, distributeLoanReturns
  └─ Pattern: Guard contre les appels circulaires
```

#### 3. Input Validation

```solidity
require(msg.value > 0, "Must send ETH")
require(amount > 0, "Amount must be > 0")
require(token != address(0), "Invalid token address")
require(stakingBalance[token][user] + amount <= maxStakePerUser)
```

#### 4. Safe Token Transfers

```solidity
using SafeERC20 for IERC20
  ├─ safeTransferFrom() - gère les tokens non-standard
  ├─ safeTransfer() - avec revert messages
  └─ Prévient les silent failures
```

#### 5. Price Feed Validation

```solidity
require(price > 0, "Invalid price")
require(timeStamp > 0, "Round not complete")
require(answeredInRound >= roundID, "Stale price feed")
```

### Risques Identifiés et Mitigations

| Risque | Sévérité | Mitigation |
|--------|----------|-----------|
| Flash Loan Attack | MEDIUM | Staking délai, nonReentrant |
| Price Manipulation | HIGH | Chainlink + validation |
| Reentrancy | MEDIUM | nonReentrant guard |
| DOS sur Distribution | MEDIUM | Boucles limitées |
| Token Non-Standard | MEDIUM | SafeERC20 |

### Audit Recommandations

```
□ Audit externe pour StateMachine
□ Vérifier math (intérêts, ratios)
□ Tester tous les edge cases
□ Vérifier les états de transition
□ Tester la distribution avec 1000+ stakers
```

---

## Déploiement

### Ordre de Déploiement

```
1. GoldenToken.deploy()
   ├─ Constructor: Owner défini
   ├─ Supply: Déterminé à la création
   └─ Return: goldenToken address

2. TokenFarm.deploy(goldenTokenAddress, "0x0...0")
   ├─ Constructor: Défini avec GOLD et LoanFactory null
   ├─ Approvals: Définir pour GOLD transfers
   └─ Return: tokenFarm address

3. LoanFactory.deploy(tokenFarmAddress)
   ├─ Constructor: Référence TokenFarm
   └─ Return: loanFactory address

4. TokenFarm.setLoanFactory(loanFactoryAddress)
   ├─ Initialiser la référence circulaire
   └─ Transactions: 1 approve call
```

### Configuration Post-Déploiement

```python
# Ajouter les tokens autorisés
tokenFarm.addAllowedTokens(USDC_ADDRESS)
tokenFarm.addAllowedTokens(USDT_ADDRESS)
tokenFarm.addAllowedTokens(ETH_ADDRESS)

# Configurer les price feeds
tokenFarm.setPriceFeedContract(USDC_ADDRESS, USDC_USD_FEED)
tokenFarm.setPriceFeedContract(USDT_ADDRESS, USDT_USD_FEED)
tokenFarm.setPriceFeedContract(ETH_ADDRESS, ETH_USD_FEED)

# Financer le TokenFarm en GOLD
goldenToken.transfer(tokenFarm.address, amount)
```

### Contrats Déployés (Sepolia)

```
GoldenToken:  0x6E70776DB5e1d0df4b07Cef37A1aef10F8e39A3b
TokenFarm:    0x00307df619c9A812bD934ecf22225386b606BAF1
LoanFactory:  0x74bE86929824Ec2511455f6705A1B77Ee943e743
GoldenPEFund: 0x8D5bf21C78cFa7971f6FE9D480B8e5Ff33d4C772
```

---

## Tests

### Couverture de Tests

```
├─ test_token_farm.py (Tests d'intégration)
│  ├─ Staking/Unstaking
│  ├─ Reward distribution
│  ├─ Price calculations
│  └─ Loan integration

├─ test_token_farm_native.py (ETH management) ✅ 22/22 PASSING
│  ├─ depositNative (6 tests)
│  ├─ withdrawNative (6 tests)
│  ├─ getNativeBalance (3 tests)
│  ├─ getNativeDepositBalance (2 tests)
│  ├─ getNativeDepositStats (3 tests)
│  └─ Integration tests (2 tests)

├─ test_loan_factory.py
│  ├─ Loan creation
│  ├─ Loan lifecycle
│  └─ State transitions

└─ test_golden_pe_fund.py
   ├─ Investment management
   └─ PE-specific rules
```

### Exécution des Tests

```bash
# Tests du TokenFarm native ETH
brownie test tests/unit/test_token_farm_native.py -v

# Tous les tests
brownie test tests/unit/ -v

# Tests d'intégration
brownie test tests/integration/ -v
```

---

## API Publique

### TokenFarm - Fonctions Publiques

#### Staking

```solidity
function stakeTokens(uint256 _amount, address token) public nonReentrant
  └─ Stake des tokens ERC20
  
function unstakeTokens(address token) public nonReentrant
  └─ Unstake et retrait des tokens

function getUserTotalValue(address user) public view returns (uint256)
  └─ Valeur totale stakée en ETH

function issueTokens() public onlyOwner
  └─ Distribuer les récompenses GOLD
```

#### Loan Management

```solidity
function createProjectLoan(
  address borrower,
  uint256 amount,
  uint256 interest,
  uint256 duration
) external onlyOwner returns (uint256)
  └─ Créer un prêt avec StateMachine

function investInLoan(uint256 loanId, uint256 amount)
  external onlyOwner nonReentrant
  └─ Financer un prêt

function closeLoan(uint256 loanId) external onlyOwner nonReentrant
  └─ Fermer un prêt complètement

function authorizeLoan(address loan) public onlyOwner
  └─ Autoriser une adresse de prêt
```

#### Returns Management

```solidity
function receiveLoanReturns() external payable onlyAuthorizedLoan nonReentrant
  └─ Recevoir les remboursements des prêts (appelé par StateMachine)

function distributeLoanReturns() external onlyOwner nonReentrant
  └─ Distribuer proportionnellement aux stakers
```

#### Native ETH

```solidity
function depositNative() external payable onlyOwner
  └─ Déposer des ETH natifs pour financer les prêts

function withdrawNative(uint256 amount) external onlyOwner nonReentrant
  └─ Retirer des ETH du contrat

function getNativeBalance() external view returns (uint256)
  └─ Solde ETH actuel du contrat

function getNativeDepositBalance(address depositor) 
  external view returns (uint256)
  └─ Total déposé par une adresse

function getNativeDepositStats() external view returns (
  uint256 totalDeposited,
  uint256 currentBalance,
  uint256 depositCount
)
  └─ Statistiques complètes des dépôts
```

#### Configuration

```solidity
function addAllowedTokens(address token) public onlyOwner
  └─ Ajouter un token autorisé pour le staking

function removeAllowedToken(address token) public onlyOwner
  └─ Retirer un token des tokens autorisés

function setPriceFeedContract(address token, address priceFeed) 
  public onlyOwner
  └─ Configurer un Chainlink price feed

function setMaxStakePerUser(uint256 _maxStake) external onlyOwner
  └─ Mettre à jour la limite de stake par utilisateur

function setLoanFactory(address _loanFactory) external onlyOwner
  └─ Mettre à jour la référence au LoanFactory
```

#### Queries

```solidity
function tokenIsAllowed(address token) public view returns (bool)
  └─ Vérifier si un token est autorisé

function getTokenEthPrice(address token) 
  public view returns (uint256, uint8)
  └─ Récupérer le prix d'un token via Chainlink

function getUserTokenStakingBalanceEthValue(address user, address token)
  public view returns (uint256)
  └─ Valeur en ETH d'un staking d'un token spécifique

function getStakers() public view returns(address [] memory)
  └─ Liste de tous les stakers actifs
```

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| **Staking** | Verrouiller des tokens pour recevoir des récompenses |
| **Slashing** | Pénalité appliquée aux stakers (non implémenté) |
| **Loan Factory** | Pattern de création de contrats de prêt |
| **State Machine** | Contrat gérant le cycle de vie d'un prêt |
| **Oracle (Chainlink)** | Service décentralisé pour les prix |
| **nonReentrant** | Protection contre les attaques de réentrance |
| **SafeERC20** | Wrapper pour les transferts de tokens sécurisés |
| **Pull-over-Push** | Pattern: demandeur tire plutôt que contrat envoie |

---

## Ressources et Références

### Documentation Externe
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Chainlink VRF & Price Feeds](https://docs.chain.link/)
- [Brownie Documentation](https://eth-brownie.readthedocs.io/)
- [Ethereum Sepolia Faucet](https://sepolia-faucet.pk910.de/)

### Fichiers Importants du Repo
```
├─ contracts/
│  ├─ GoldenToken.sol         (ERC20 principal)
│  ├─ TokenFarm.sol           (Cœur du protocole) ← CRITIQUE
│  ├─ LoanFactory.sol         (Factory pattern)
│  ├─ StateMachine.sol        (État du prêt)
│  ├─ GoldenPEFund.sol        (Fonds PE)
│  └─ test/                   (Tokens mock)
│
├─ scripts/
│  ├─ deploy.py               (Déploiement principal)
│  ├─ verify_my_contracts.py  (Etherscan verify)
│  └─ issue_token.py          (Distribuer GOLD)
│
├─ tests/
│  ├─ unit/test_token_farm_native.py      (ETH tests) ✅
│  ├─ unit/test_token_farm.py             (Integration)
│  └─ integration/
│
└─ build/contracts/           (ABI compilées)
```

---

## Améliorations Futures

### Court Terme
- [ ] Ajouter un système de gouvernance (DAO)
- [ ] Implémenter le slashing pour les mauvais comportements
- [ ] Support de multiples prêts simultanés
- [ ] Audit de sécurité externe

### Moyen Terme
- [ ] Migration vers Ethereum Mainnet
- [ ] Pools de liquidité (Uniswap v3)
- [ ] Options de prêt composables
- [ ] Dashboard Web3 complet

### Long Terme
- [ ] Cross-chain via bridges
- [ ] Protocoles de prêt collaboratifs
- [ ] Synthétiques automatisés
- [ ] Expansion vers L2s

---

**Version:** 1.0  
**Date:** 4 May 2026  
**Maintainers:** Goldenbridge Team  
**License:** MIT

Pour questions ou contributions: [GitHub](https://github.com)
