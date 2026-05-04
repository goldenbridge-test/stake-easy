> Option A — StateMachine = Escrow intelligent (prêt on-chain)

# 📘 GoldenBridge — Loan-Based Investment Architecture

_(StateMachine as Smart Escrow)_

## 1️⃣ Objectif du module

Ce module introduit un système d’investissement basé sur des prêts on-chain, où :

- les investisseurs stakent dans TokenFarm
- GoldenBridge agit comme lender
- les projets financés sont des borrowers( specialements nos diffents fonds d'investiissements)
- chaque investissement est un contrat StateMachine isolé
- le ROI provient des intérêts remboursés

👉 Ici, le prêt EST l’investissement.

---

## 2️⃣ Pourquoi remplacer notre contrat d’Escrow classique

### Limites d’un escrow simple

- Pas de logique financière native
- Pas d’intérêt
- Pas de notion de durée
- Libération manuelle uniquement

### Avantages du StateMachine

- Logique financière intégrée
- États verrouillés
- Prêt traçable on-chain
- ROI déterministe
- Adapté aux fonds d’investissement

---

## 3️⃣ Mapping fonctionnel (Escrow → StateMachine)

| Concept          | Escrow classique | StateMachine               |
| ---------------- | ---------------- | -------------------------- |
| Dépôt des fonds  | deposit()        | fund()                     |
| Fonds bloqués    | balance escrow   | state == ACTIVE            |
| Libération       | release()        | transfert auto au borrower |
| Retour des fonds | manuel           | reimburse()                |
| ROI              | off-chain        | interest on-chain          |
| Sécurité         | logique simple   | machine à états            |

---

## 4️⃣ Vue d’ensemble de l’architecture

Investisseurs
│
▼
TokenFarm (staking)
│
│ droits & capital
▼
GoldenBridge Treasury / Contract
│
│ création de prêts
▼
StateMachine (1 prêt = 1 contrat)
│
├── borrower reçoit les fonds
└── remboursement + intérêt

---

## 5️⃣ Description du contrat StateMachine

### États possibles

enum State {
PENDING, // prêt créé, non financé
ACTIVE, // prêt financé, fonds débloqués
CLOSED // prêt remboursé
}

➡️ Les transitions sont strictement contrôlées
➡️ Aucun retour arrière possible

---

### Acteurs

| Rôle      | Description                    |
| --------- | ------------------------------ |
| lender    | GoldenBridge (ou son contract) |
| borrower  | Projet / startup financée      |
| investors | Indirects via staking          |
| protocol  | Garant de la logique           |

---

## 6️⃣ Cycle de vie d’un investissement (step-by-step)

### ✅ Étape 1 — Staking (hors prêt)

Les investisseurs déposent leurs fonds dans TokenFarm.

stakeTokens(amount, token);

➡️ Aucun prêt n’est encore créé
➡️ Les fonds constituent la capacité d’investissement

---

### ✅ Étape 2 — Sélection du projet

- Analyse off-chain
- Due diligence
- Validation interne / DAO (future)

➡️ Les paramètres du prêt sont définis :

- montant
- durée
- intérêt
- borrower

---

### ✅ Étape 3 — Création du prêt

Un nouveau contrat StateMachine est déployé.

new StateMachine(
amount,
interest,
duration,
borrower,
lender
);

➡️ Le prêt est en état PENDING
➡️ Aucun ETH transféré à ce stade

---

### ✅ Étape 4 — Funding du prêt

GoldenBridge finance le prêt :

fund{value: amount}();

Conditions :

- seul le lender peut financer
- montant exact requis

Effets :

- état → ACTIVE
- fonds envoyés au borrower
- début du compteur de durée

---

### ✅ Étape 5 — Exploitation du capital

- le projet utilise les fonds
- le prêt est actif
- aucun remboursement anticipé possible

---

### ✅ Étape 6 — Remboursement

À échéance :

reimburse{value: amount + interest}();

Conditions :

- seul le borrower
- après la date end
- montant exact

Effets :

- état → CLOSED
- fonds transférés au lender
- ROI réalisé

---

## 7️⃣ Redistribution du ROI

Une fois le remboursement reçu :

- GoldenBridge récupère :

  - capital
  - intérêts

- les intérêts sont redistribués aux stakers
- via TokenFarm.issueTokens() ou mécanisme dédié

➡️ Les investisseurs gagnent via les intérêts du prêt

---

## 8️⃣ Sécurité & garanties

### Garanties on-chain

✔️ États verrouillés
✔️ Impossible de doubler un funding
✔️ Impossible de rembourser partiellement
✔️ Impossible de fermer avant échéance

### Isolation des risques

- 1 prêt = 1 contrat
- un défaut n’impacte pas les autres investissements

---

## 9️⃣ Cas d’usage ciblés

- financement de startups
- bridge loans
- revenue-based financing
- microfinance structurée
- lending institutionnel

---

## 🔮 Extensions prévues

- LoanFactory (gestion centralisée)
- Events pour indexation
- DAO vote avant fund
- Pénalités de retard
- Remboursement partiel
- Multisig lender
- Escrow hybride (garanties)

---

## 10️⃣ Conclusion technique

Cette approche permet à GoldenBridge de devenir :

- un fonds de prêts on-chain
- avec des règles claires
- une traçabilité parfaite
- une logique financière native
- une architecture prête pour DAO & audit


TokenFarm
 ├── gère la liquidité
 ├── finance les loans
 ├── reçoit les remboursements
 └── redistribue le ROI

LoanFactory
 ├── déploie les loans
 └── registre des prêts

StateMachine (Loan)
 ├── logique du prêt
 └── états


---
