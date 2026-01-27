from brownie import (
    LoanFactory,
    TokenFarm,
    StateMachine,
    network,
    config,
    accounts,
)
from scripts.helpful_scripts import get_account
from web3 import Web3
import time

def create_loan():
    account = accounts[1]
    print(f"Network active: {network.show_active()}")
    print(f"Admin account: {account}")

    # ============================
    # 1️⃣ Récupérer les contrats déployés
    # ============================
    token_farm = TokenFarm[-1]
    loan_factory = LoanFactory[-1]

    print(f"TokenFarm: {token_farm.address}")
    print(f"LoanFactory: {loan_factory.address}")

    # ============================
    # 2️⃣ Paramètres du prêt
    # ============================
    loan_amount = Web3.to_wei(5, "ether")      # capital
    interest = Web3.to_wei(1, "ether")         # intérêts
    duration = 60                              # 60 secondes pour test
    borrower = account[2]                       # pour test local

    # ============================
    # 3️⃣ Créer le prêt via TokenFarm
    # ============================
    print("Création du prêt...")
    tx = token_farm.createProjectLoan(
        borrower,
        loan_amount,
        interest,
        duration,
        {"from": account},
    )
    tx.wait(1)

    loan_id = loan_factory.getLoansCount() - 1
    loan_info = loan_factory.loans(loan_id)
    loan_address = loan_info[0]  # loanAddress = index 0 dans LoanInfo
    loan = StateMachine.at(loan_address)

    print(f"Loan created | ID: {loan_id}")
    print(f"Loan contract: {loan_address}")

    
def main():
    create_loan()