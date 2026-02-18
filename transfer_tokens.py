from brownie import accounts, GoldenToken

def main():
    gt = GoldenToken[-1]
    account = accounts[0]
    ton_adresse = "0xF6b6ee74A275A2e9a2F345550186Bb93780390C8"
    
    print(f"Transfert de 1000 tokens à {ton_adresse}")
    tx = gt.transfer(ton_adresse, 1000 * 10**18, {"from": account})
    tx.wait(1)
    print("✅ Transfert réussi!")

if __name__ == "__main__":
    main()
