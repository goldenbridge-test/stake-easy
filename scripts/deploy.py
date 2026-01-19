from brownie import GoldenToken, TokenFarm, network, config
from scripts.helpful_scripts import get_account, get_contract
import shutil
import os
import yaml
import json
from web3 import Web3

KEPT_BALANCE = Web3.to_wei(100, "ether")  # CORRIGÉ


def deploy_token_farm_and_golden_token(update_front_end_flag=False):
    account = get_account()
    golden_token = GoldenToken.deploy({"from": account})
    token_farm = TokenFarm.deploy(
        golden_token.address,
        {"from": account},
        publish_source=config["networks"][network.show_active()].get("verify"),
    )
    tx = golden_token.transfer(
        token_farm.address,
        golden_token.totalSupply() - KEPT_BALANCE,
        {"from": account},
    )
    tx.wait(1)
    fau_token = get_contract("fau_token")
    weth_token = get_contract("weth_token")
    link_token = get_contract("link_token")
    

    add_allowed_tokens(
        token_farm,
        {
            golden_token: get_contract("dai_usd_price_feed"),
            fau_token: get_contract("dai_usd_price_feed"),
            weth_token: get_contract("eth_usd_price_feed"),
            link_token: get_contract("link_usd_price_feed"),
        },
        account,
    )
    if update_front_end_flag:
        update_front_end()
    return token_farm, golden_token


def add_allowed_tokens(token_farm, dict_of_allowed_token, account):
    for token in dict_of_allowed_token:
        token_farm.addAllowedTokens(token.address, {"from": account})
        tx = token_farm.setPriceFeedContract(
            token.address, dict_of_allowed_token[token], {"from": account}
        )
        tx.wait(1)
    return token_farm


def copy_folders_to_front_end(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def copy_files_to_front_end(src, dest):
    # Crée le dossier parent si nécessaire
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    
    if os.path.exists(dest):
        if os.path.isdir(dest):
            shutil.rmtree(dest)
        else:
            os.remove(dest)
    
    shutil.copyfile(src, dest)


def update_front_end():
    print("Updating front end...")
    
    # Crée le dossier chain-info s'il n'existe pas
    os.makedirs("./front_end/src/chain-info", exist_ok=True)
    
    # The Build
    copy_folders_to_front_end("./build/contracts", "./front_end/src/chain-info")

    # The Contracts
    copy_folders_to_front_end("./contracts", "./front_end/src/contracts")

    # The ERC20
    copy_files_to_front_end(
        "./build/contracts/dependencies/OpenZeppelin/openzeppelin-contracts@4.3.2/ERC20.json",
        "./front_end/src/chain-info/ERC20.json",
    )
    
    # The Map - Vérifie d'abord s'il existe
    map_src = "./build/deployments/map.json"
    if os.path.exists(map_src):
        copy_files_to_front_end(map_src, "./front_end/src/chain-info/map.json")
    else:
        print("⚠️ map.json non trouvé, création d'un fichier vide...")
        basic_map = {
            "1337": {
                "GoldenToken": ["0x3194cBDC3dbcd3E11a07892e7bA5c3394048Cc87"],
                "TokenFarm": ["0x602C71e4DAC47a042Ee7f46E0aee17F94A3bA0B6"]
            }
        }
        with open("./front_end/src/chain-info/map.json", "w") as f:
            json.dump(basic_map, f, indent=2)

    # The Config
    with open("brownie-config.yaml", "r") as brownie_config:
        config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)
        with open("./front_end/src/brownie-config-json.json", "w") as brownie_config_json:
            json.dump(config_dict, brownie_config_json)
    
    print("Front end updated!")


def main():
    deploy_token_farm_and_golden_token(update_front_end_flag=True)