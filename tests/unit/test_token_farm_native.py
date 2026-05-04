# -*- coding: utf-8 -*-
"""
Tests pour les fonctions de gestion des dépôts ETH natifs dans TokenFarm
Tests: depositNative, withdrawNative, tracking et événements
"""

import pytest
from brownie import accounts, web3, reverts
from brownie.network import web3 as web3_connection


@pytest.fixture
def token_farm_setup(GoldenToken, TokenFarm, LoanFactory):
    """Setup du contrat TokenFarm avec ses dépendances"""
    owner = accounts[0]
    user = accounts[1]
    
    # Déployer GoldenToken
    golden_token = GoldenToken.deploy({"from": owner})
    
    # Déployer TokenFarm avec une adresse null pour LoanFactory (sera setter plus tard)
    token_farm = TokenFarm.deploy(
        golden_token.address,
        "0x0000000000000000000000000000000000000000",  # Null address temporaire
        {"from": owner}
    )
    
    # Déployer LoanFactory avec l'adresse de TokenFarm
    loan_factory = LoanFactory.deploy(token_farm.address, {"from": owner})
    
    # Setter le LoanFactory dans TokenFarm
    token_farm.setLoanFactory(loan_factory.address, {"from": owner})
    
    return {
        "token_farm": token_farm,
        "golden_token": golden_token,
        "loan_factory": loan_factory,
        "owner": owner,
        "user": user,
    }


class TestDepositNative:
    """Tests pour la fonction depositNative()"""
    
    def test_deposit_native_success(self, token_farm_setup):
        """Test d'un dépôt ETH réussi"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        amount = web3.to_wei(1, "ether")
        
        # Vérifier le solde avant
        assert web3_connection.eth.get_balance(tf.address) == 0
        
        # Effectuer le dépôt
        tx = tf.depositNative({"from": owner, "value": amount})
        
        # Vérifier le solde après
        assert web3_connection.eth.get_balance(tf.address) == amount
        assert tf.getNativeBalance() == amount
        
    def test_deposit_native_fails_with_zero(self, token_farm_setup):
        """Test: dépôt échoue si msg.value = 0"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        
        with reverts("Must send ETH"):
            tf.depositNative({"from": owner, "value": 0})
    
    def test_deposit_native_only_owner(self, token_farm_setup):
        """Test: seul le propriétaire peut déposer"""
        tf = token_farm_setup["token_farm"]
        user = token_farm_setup["user"]
        amount = web3.to_wei(1, "ether")
        
        with reverts("Ownable: caller is not the owner"):
            tf.depositNative({"from": user, "value": amount})
    
    def test_deposit_native_tracking(self, token_farm_setup):
        """Test: vérifier le tracking des dépôts par adresse"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        
        amount1 = web3.to_wei(1, "ether")
        amount2 = web3.to_wei(2, "ether")
        
        # Premier dépôt
        tf.depositNative({"from": owner, "value": amount1})
        assert tf.getNativeDepositBalance(owner) == amount1
        assert tf.totalNativeDeposited() == amount1
        assert tf.nativeDepositCount() == 1
        
        # Deuxième dépôt du même owner
        tf.depositNative({"from": owner, "value": amount2})
        assert tf.getNativeDepositBalance(owner) == amount1 + amount2
        assert tf.totalNativeDeposited() == amount1 + amount2
        assert tf.nativeDepositCount() == 1  # Pas d'incrémentation (même owner)
    
    def test_deposit_native_multiple_owners(self, token_farm_setup, accounts):
        """Test: plusieurs propriétaires peuvent déposer"""
        tf = token_farm_setup["token_farm"]
        owner1 = token_farm_setup["owner"]
        owner2 = accounts[9]  # Ajouter comme propriétaire
        
        # Transférer la propriété temporairement
        from brownie import Contract
        amount1 = web3.to_wei(1, "ether")
        amount2 = web3.to_wei(0.5, "ether")
        
        tf.depositNative({"from": owner1, "value": amount1})
        
        # Changer de propriétaire
        tf.transferOwnership(owner2, {"from": owner1})
        
        tf.depositNative({"from": owner2, "value": amount2})
        assert tf.nativeDepositCount() == 2
        assert tf.totalNativeDeposited() == amount1 + amount2
    
    def test_deposit_native_event(self, token_farm_setup):
        """Test: vérifier que l'événement NativeTokenDeposited est émis"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        amount = web3.to_wei(1.5, "ether")
        
        tx = tf.depositNative({"from": owner, "value": amount})
        
        # Vérifier l'événement
        assert "NativeTokenDeposited" in tx.events
        event = tx.events["NativeTokenDeposited"]
        assert event["depositor"] == owner
        assert event["amount"] == amount
        assert event["timestamp"] > 0


class TestWithdrawNative:
    """Tests pour la fonction withdrawNative()"""
    
    def test_withdraw_native_success(self, token_farm_setup):
        """Test d'un retrait ETH réussi"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        deposit_amount = web3.to_wei(5, "ether")
        withdraw_amount = web3.to_wei(2, "ether")
        
        # Dépôt d'abord
        tf.depositNative({"from": owner, "value": deposit_amount})
        owner_addr = owner.address  # Convertir en string
        balance_before = web3_connection.eth.get_balance(owner_addr)
        
        # Retrait
        tx = tf.withdrawNative(withdraw_amount, {"from": owner})
        
        # Vérifier les soldes
        assert web3_connection.eth.get_balance(tf.address) == deposit_amount - withdraw_amount
        assert tf.getNativeBalance() == deposit_amount - withdraw_amount
    
    def test_withdraw_native_fails_with_zero(self, token_farm_setup):
        """Test: retrait échoue si amount = 0"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        deposit_amount = web3.to_wei(1, "ether")
        
        tf.depositNative({"from": owner, "value": deposit_amount})
        
        with reverts("Amount must be > 0"):
            tf.withdrawNative(0, {"from": owner})
    
    def test_withdraw_native_insufficient_balance(self, token_farm_setup):
        """Test: retrait échoue si solde insuffisant"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        deposit_amount = web3.to_wei(1, "ether")
        
        tf.depositNative({"from": owner, "value": deposit_amount})
        
        with reverts("Insufficient balance"):
            tf.withdrawNative(web3.to_wei(2, "ether"), {"from": owner})
    
    def test_withdraw_native_only_owner(self, token_farm_setup):
        """Test: seul le propriétaire peut retirer"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        user = token_farm_setup["user"]
        deposit_amount = web3.to_wei(1, "ether")
        
        tf.depositNative({"from": owner, "value": deposit_amount})
        
        with reverts("Ownable: caller is not the owner"):
            tf.withdrawNative(deposit_amount, {"from": user})
    
    def test_withdraw_native_event(self, token_farm_setup):
        """Test: vérifier que l'événement NativeTokenWithdrawn est émis"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        deposit_amount = web3.to_wei(3, "ether")
        withdraw_amount = web3.to_wei(1, "ether")
        
        tf.depositNative({"from": owner, "value": deposit_amount})
        tx = tf.withdrawNative(withdraw_amount, {"from": owner})
        
        # Vérifier l'événement
        assert "NativeTokenWithdrawn" in tx.events
        event = tx.events["NativeTokenWithdrawn"]
        assert event["recipient"] == owner
        assert event["amount"] == withdraw_amount
        assert event["timestamp"] > 0
    
    def test_withdraw_native_protection_reentrancy(self, token_farm_setup):
        """Test: la protection nonReentrant fonctionne"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        amount = web3.to_wei(1, "ether")
        
        tf.depositNative({"from": owner, "value": amount})
        
        # Les deux retraits successifs doivent fonctionner
        tf.withdrawNative(web3.to_wei(0.5, "ether"), {"from": owner})
        tf.withdrawNative(web3.to_wei(0.5, "ether"), {"from": owner})
        
        assert tf.getNativeBalance() == 0


class TestNativeBalance:
    """Tests pour getNativeBalance()"""
    
    def test_get_native_balance_empty(self, token_farm_setup):
        """Test: solde initial = 0"""
        tf = token_farm_setup["token_farm"]
        assert tf.getNativeBalance() == 0
    
    def test_get_native_balance_after_deposit(self, token_farm_setup):
        """Test: solde après dépôt"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        amount = web3.to_wei(2.5, "ether")
        
        tf.depositNative({"from": owner, "value": amount})
        assert tf.getNativeBalance() == amount
    
    def test_get_native_balance_after_withdraw(self, token_farm_setup):
        """Test: solde après retrait"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        deposit = web3.to_wei(5, "ether")
        withdraw = web3.to_wei(1.5, "ether")
        
        tf.depositNative({"from": owner, "value": deposit})
        tf.withdrawNative(withdraw, {"from": owner})
        
        assert tf.getNativeBalance() == deposit - withdraw


class TestNativeDepositBalance:
    """Tests pour getNativeDepositBalance()"""
    
    def test_get_native_deposit_balance_zero(self, token_farm_setup):
        """Test: balance = 0 si pas de dépôt"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        assert tf.getNativeDepositBalance(owner) == 0
    
    def test_get_native_deposit_balance_tracking(self, token_farm_setup):
        """Test: tracking des dépôts par adresse"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        
        amount1 = web3.to_wei(1, "ether")
        amount2 = web3.to_wei(1.5, "ether")
        
        tf.depositNative({"from": owner, "value": amount1})
        assert tf.getNativeDepositBalance(owner) == amount1
        
        tf.depositNative({"from": owner, "value": amount2})
        assert tf.getNativeDepositBalance(owner) == amount1 + amount2


class TestNativeDepositStats:
    """Tests pour getNativeDepositStats()"""
    
    def test_get_native_deposit_stats_empty(self, token_farm_setup):
        """Test: stats initiales"""
        tf = token_farm_setup["token_farm"]
        
        total, current, count = tf.getNativeDepositStats()
        assert total == 0
        assert current == 0
        assert count == 0
    
    def test_get_native_deposit_stats_after_deposits(self, token_farm_setup):
        """Test: stats après dépôts"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        
        amount1 = web3.to_wei(2, "ether")
        amount2 = web3.to_wei(3, "ether")
        
        # Premier dépôt
        tf.depositNative({"from": owner, "value": amount1})
        total, current, count = tf.getNativeDepositStats()
        assert total == amount1
        assert current == amount1
        assert count == 1
        
        # Deuxième dépôt
        tf.depositNative({"from": owner, "value": amount2})
        total, current, count = tf.getNativeDepositStats()
        assert total == amount1 + amount2
        assert current == amount1 + amount2
        assert count == 1  # Même owner
    
    def test_get_native_deposit_stats_after_withdraw(self, token_farm_setup):
        """Test: stats après retrait"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        
        deposit = web3.to_wei(5, "ether")
        withdraw = web3.to_wei(2, "ether")
        
        tf.depositNative({"from": owner, "value": deposit})
        tf.withdrawNative(withdraw, {"from": owner})
        
        total, current, count = tf.getNativeDepositStats()
        assert total == deposit  # Total historique ne change pas
        assert current == deposit - withdraw  # Balance actuelle baisse
        assert count == 1


class TestIntegration:
    """Tests d'intégration pour les dépôts natifs"""
    
    def test_deposit_and_invest_in_loan(self, token_farm_setup):
        """Test: dépôt ETH puis investissement dans un prêt"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        lf = token_farm_setup["loan_factory"]
        
        # Dépôt ETH
        deposit = web3.to_wei(10, "ether")
        tf.depositNative({"from": owner, "value": deposit})
        
        # Créer un prêt
        borrower = token_farm_setup["user"]
        loan_amount = web3.to_wei(5, "ether")
        
        loan_tx = tf.createProjectLoan(
            borrower,
            loan_amount,
            10,  # 10% intérêt
            365,  # 365 jours
            {"from": owner}
        )
        
        # Investir dans le prêt
        tf.investInLoan(0, loan_amount, {"from": owner})
        
        # Vérifier que le solde a baissé
        assert tf.getNativeBalance() == deposit - loan_amount
    
    def test_multiple_deposits_and_withdrawals(self, token_farm_setup):
        """Test: cycle complet de dépôts et retraits"""
        tf = token_farm_setup["token_farm"]
        owner = token_farm_setup["owner"]
        
        # Séquence de opérations
        operations = [
            ("deposit", web3.to_wei(5, "ether")),
            ("deposit", web3.to_wei(3, "ether")),
            ("withdraw", web3.to_wei(2, "ether")),
            ("deposit", web3.to_wei(1, "ether")),
            ("withdraw", web3.to_wei(3, "ether")),
        ]
        
        expected_balance = 0
        
        for op_type, amount in operations:
            if op_type == "deposit":
                tf.depositNative({"from": owner, "value": amount})
                expected_balance += amount
            else:  # withdraw
                tf.withdrawNative(amount, {"from": owner})
                expected_balance -= amount
            
            assert tf.getNativeBalance() == expected_balance
        
        # Vérifier les stats finales
        total, current, count = tf.getNativeDepositStats()
        assert current == expected_balance
        assert count == 1  # Toujours 1 car un seul owner


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
