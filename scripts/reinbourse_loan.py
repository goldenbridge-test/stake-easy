# ============================
    # 5️⃣ Attendre la fin du prêt (pour test)
    # ============================
    print("Attente de la maturité du prêt...")
    time.sleep(duration + 1)

    # ============================
    # 6️⃣ Remboursement du prêt
    # ============================
    repay_amount = loan_amount + interest
    print("Remboursement du prêt...")
    tx = loan.reimburse({"from": borrower, "value": repay_amount})
    tx.wait(1)

    print("Prêt remboursé")
    print(f"Loan state: {loan.state()} (2 = CLOSED)")