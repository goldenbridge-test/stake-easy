from brownie import GoldenToken, TokenFarm, LoanFactory, GoldenPEFund, network, config
from scripts.helpful_scripts import get_account, get_contract
import shutil
import os
import yaml
import json
from web3 import Web3

KEPT_BALANCE = Web3.to_wei(1000000, "ether")  # CORRIGÉ


def deploy_token_farm_and_golden_token(update_front_end_flag=False):
    account = get_account()

    # ===== Deploy GoldenToken =====
    golden_token = GoldenToken.deploy({"from": account})
    print(f"ldenToken deployed at: {golden_token.address}")

    # ===== Deploy TokenFarm =====
    token_farm = TokenFarm.deploy(
        golden_token.address,
        "0x0000000000000000000000000000000000000000",
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify"),
    )
    print(f"kenFarm deployed at: {token_farm.address}")

    # ===== Fund TokenFarm =====
    tx = golden_token.transfer(
        token_farm.address,
        golden_token.totalSupply() - KEPT_BALANCE,
        {"from": account},
    )
    tx.wait(1)
    print(f"TokenFarm funded with {golden_token.totalSupply() - KEPT_BALANCE} tokens")

    # ===== Get mock tokens =====
    usdc_token = get_contract("usdc_token")
    eth_token = get_contract("eth_token")
    usdt_token = get_contract("usdt_token")

    # ===== Add allowed tokens + price feeds =====
    add_allowed_tokens(
        token_farm,
        {
            golden_token: get_contract("usdc_usd_price_feed"),
            usdc_token: get_contract("usdc_usd_price_feed"),
            eth_token: get_contract("eth_usd_price_feed"),
            usdt_token: get_contract("usdt_usd_price_feed"),
        },
        account,
    )

    # ===== Deploy LoanFactory =====
    loan_factory = LoanFactory.deploy(
        token_farm.address,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify"),
    )
    print(f"Done LoanFactory deployed at: {loan_factory.address}")

    # ===== Link TokenFarm <-> LoanFactory =====
    tx = token_farm.setLoanFactory(
        loan_factory.address,
        {"from": account},
    )
    tx.wait(1)
    print(f"TokenFarm linked with LoanFactory")

    # ===== Deploy GoldenPEFund =====
    fund = deploy_golden_pe_fund(account)

    # ===== Update Frontend =====
    if update_front_end_flag:
        update_front_end()

    return token_farm, golden_token, loan_factory, fund


def deploy_golden_pe_fund(account, update_front_end_flag=False):
    """
    Déploie le contrat GoldenPEFund avec les nouvelles fonctionnalités
    - Whitelist de stablecoins
    - Limite de dépôt maximum
    - Sécurités renforcées
    """
    
    # Stablecoin principal (USDC par défaut)
    stablecoin = get_contract("usdc_token")
    
    # Adresse du gestionnaire de fonds
    fund_manager = "0xD2e1EF32fE5D065c8470a41eA2f5817d55231cfA"
    
    # Configuration des frais
    entry_fee_bp = 200      # 2%
    exit_fee_bp = 100       # 1%
    performance_fee_bp = 2000  # 20%
    
    # Limite de dépôt maximum: 10,000,000 USDC (6 décimales)
    max_deposit_limit = Web3.to_wei(10_000_000, "mwei")  # 10M USDC
    
    print(f"\nDeployingenPEFund...")
    print(f"   Stablecoin: {stablecoin.address}")
    print(f"   Fund Manager: {fund_manager}")
    print(f"   Entry Fee: {entry_fee_bp / 100}%")
    print(f"   Exit Fee: {exit_fee_bp / 100}%")
    print(f"   Performance Fee: {performance_fee_bp / 100}%")
    print(f"   Max Deposit: {max_deposit_limit / 1e6} USDC")

    # Deployment of GoldenPEFund
    fund = GoldenPEFund.deploy(
        stablecoin.address,
        fund_manager,
        entry_fee_bp,
        exit_fee_bp,
        performance_fee_bp,
        max_deposit_limit,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify")
    )
    
    print(f"Done GoldenPEFund deployed at: {fund.address}")

    # ===== Configuration initiale =====
    
    # 1. Whitelist des stablecoins acceptés
    print("\nConfiguring whitelisted stablecoin")

    usdc_token = get_contract("usdc_token")
    usdt_token = get_contract("usdt_token")

    try:
        # USDC est déjà whitelisté par défaut, mais on peut confirmer
        tx = fund.addWhitelistedStablecoin(usdt_token.address, {"from": account})
        tx.wait(1)
        print(f"   Done USDT whitelisted: {usdt_token.address}")
    except Exception as e:
        print(f"   Warning: USDT whitelisting failed: {e}")

    # Vous pouvez ajouter d'autres stablecoins selon vos besoins
    # try:
    #     busd_token = get_contract("busd_token")
    #     tx = fund.addWhitelistedStablecoin(busd_token.address, {"from": account})
    #     tx.wait(1)
    #     print(f"   Done BUSD whitelisted: {busd_token.address}")
    # except:
    #     print(f"   Warning  BUSD non disponible")
    
    # 2. Verify deposit limit
    print("\nChecking max deposit limit")
    current_max = fund.maxDepositLimit()
    print(f"   Max Deposit Limit: {current_max / 1e6} USDC")
    
    # 3. Verify the fund manager
    print("\nVerifying fund manager")
    current_manager = fund.fundManager()
    print(f"   Fund Manager: {current_manager}")
    
    # 4. Vérifier les frais
    print(f"\nConfiguring fees...")
    print(f"   Entry Fee: {fund.entryFeeBasisPoints() / 100}%")
    print(f"   Exit Fee: {fund.exitFeeBasisPoints() / 100}%")
    print(f"   Performance Fee: {fund.performanceFeeBasisPoints() / 100}%")
    
    # 5. Vérifier l'état initial du vault
    print(f"\nInitial vault state...")
    print(f"   Total Assets: {fund.totalAssets() / 1e6} USDC")
    print(f"   Total Supply: {fund.totalSupply() / 1e18} shares")
    print(f"   High Water Mark: {fund.highWaterMark() / 1e6} USDC")
    print(f"   Assets In Strategy: {fund.assetsInStrategy() / 1e6} USDC")
    
    if update_front_end_flag:
        update_front_end()
    
    return fund


def add_allowed_tokens(token_farm, dict_of_allowed_token, account):
    """Ajoute les tokens acceptés au TokenFarm avec leurs price feeds"""
    print("\nInfo Ajout des tokens acceptés...")
    
    for token in dict_of_allowed_token:
        try:
            token_farm.addAllowedTokens(token.address, {"from": account})
            tx = token_farm.setPriceFeedContract(
                token.address, dict_of_allowed_token[token], {"from": account}
            )
            tx.wait(1)
            print(f"   Done Token ajouté: {token.address}")
        except Exception as e:
            print(f"   Warning  Erreur lors de l'ajout du token: {e}")
    
    return token_farm


def copy_folders_to_front_end(src, dest):
    """Copie les dossiers vers le front-end"""
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def copy_files_to_front_end(src, dest):
    """Copie les fichiers vers le front-end"""
    # Crée le dossier parent si nécessaire
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    
    if os.path.exists(dest):
        if os.path.isdir(dest):
            shutil.rmtree(dest)
        else:
            os.remove(dest)
    
    shutil.copyfile(src, dest)


def update_front_end():
    """Met à jour les fichiers du front-end avec les contrats compilés"""
    print("\n Mise à jour du front-end...")
    
    # Crée le dossier chain-info s'il n'existe pas
    os.makedirs("./front_end/src/chain-info", exist_ok=True)

    # The Build
    try:
        copy_folders_to_front_end("./build/contracts", "./front_end/src/chain-info")
        print("   Done Contrats ABIs copiés")
    except Exception as e:
        print(f"   Warning  Erreur lors de la copie des ABIs: {e}")

    # The Contracts
    try:
        copy_folders_to_front_end("./contracts", "./front_end/src/contracts")
        print("   Done Code source des contrats copié")
    except Exception as e:
        print(f"   Warning  Erreur lors de la copie du code source: {e}")

    # The ERC20
    try:
        copy_files_to_front_end(
            "./build/contracts/dependencies/OpenZeppelin/openzeppelin-contracts@4.3.2/ERC20.json",
            "./front_end/src/chain-info/ERC20.json",
        )
        print("   Done ERC20 ABI copié")
    except Exception as e:
        print(f"   Warning  Erreur lors de la copie d'ERC20: {e}")
    
    # The Map - Vérifie d'abord s'il existe
    map_src = "./build/deployments/map.json"
    try:
        if os.path.exists(map_src):
            copy_files_to_front_end(map_src, "./front_end/src/chain-info/map.json")
            print("   Done Deployment map copié")
        else:
            print("   Warning  map.json non trouvé, création d'un fichier vide...")
            basic_map = {
                "1337": {
                    "GoldenToken": ["0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87"],
                    "TokenFarm": ["0x602C71e4DAC47a042Ee7f46E0aee17F94A3bA0B6"],
                    "GoldenPEFund": ["0x0000000000000000000000000000000000000000"]
                }
            }
            os.makedirs("./front_end/src/chain-info", exist_ok=True)
            with open("./front_end/src/chain-info/map.json", "w") as f:
                json.dump(basic_map, f, indent=2)
            print("   Done Deployment map créé")
    except Exception as e:
        print(f"   Warning  Erreur lors du traitement de la map: {e}")

    # The Config
    try:
        with open("brownie-config.yaml", "r") as brownie_config:
            config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)
            with open("./front_end/src/brownie-config-json.json", "w") as brownie_config_json:
                json.dump(config_dict, brownie_config_json, indent=2)
        print("   Done Configuration Brownie copiée")
    except Exception as e:
        print(f"   Warning  Erreur lors de la copie de la configuration: {e}")
    
    print("Done Front-end mis à jour avec succès!")


def main():
    """Fonction principale - Déploie tous les contrats"""
    print("\n" + "="*60)
    print("Start DÉBUT DU DÉPLOIEMENT")
    print("="*60)
    
    try:
        deploy_token_farm_and_golden_token(update_front_end_flag=True)
        print("\n" + "="*60)
        print("Done DÉPLOIEMENT TERMINÉ AVEC SUCCÈS!")
        print("="*60 + "\n")
    except Exception as e:
        print("\n" + "="*60)
        print(f"ERROR ERREUR LORS DU DÉPLOIEMENT: {e}")
        print("="*60 + "\n")
        raise