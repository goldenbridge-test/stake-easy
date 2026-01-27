# ============================
    # 4️⃣ Financer le prêt via TokenFarm/LoanFactory
    # ============================
    print("Financement du prêt...")
    tx = token_farm.investInLoan(
        loan_id,
        loan_amount,
        {"from": account},  # owner = LoanFactory et TokenFarm
    )
    tx.wait(1)
    print("Prêt financé")
    print(f"Loan state: {loan.state()} (1 = ACTIVE)")