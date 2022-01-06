import json
import os
import shutil
from scripts.utils import get_account, get_contract, getParent
from brownie import DappToken, TokenFarm, network, config
import yaml

DAPP_TOKEN_KEPT_BALANCE = 100 * 10 ** 18


def deploy_token_farm_and_dapp_token(front_end_update=False):
    account = get_account()
    dapp_token = DappToken.deploy({"from": account})
    token_farm = TokenFarm.deploy(
        dapp_token.address,
        {"from": account},
        publish_source=config["networks"][network.show_active()]["verify"],
    )

    # send in dapp tokens that can be distributed
    tx = dapp_token.transfer(
        token_farm.address,
        dapp_token.totalSupply() - DAPP_TOKEN_KEPT_BALANCE,
        {"from": account},
    ).wait(1)

    # add the allowed tokens and add the price feed contract for them
    # dapp_token, weth_token, fau_token(we pretend this is DAI, because it is easy to get from erv20faucet.com)
    weth_token = get_contract("weth_token")
    fau_token = get_contract("fau_token")
    allowed_tokens = {
        dapp_token: get_contract("dai_usd_price_feed"),  # dai
        fau_token: get_contract("dai_usd_price_feed"),  # dai
        weth_token: get_contract("eth_usd_price_feed"),
    }
    add_allowed_tokens(token_farm, allowed_tokens, account)
    if front_end_update:
        front_end_update()
    return token_farm, dapp_token


def add_allowed_tokens(token_farm, allowed_tokens: dict, account):
    """
    token address:price feed address
    """

    # Loop the allowed tokens and add them to the token farm allowed tokens

    for token in allowed_tokens:
        token_farm.addAllowedToken(token.address, {"from": account}).wait(1)
        token_farm.setPriceFeedContract(
            token.address, allowed_tokens[token], {"from": account}
        ).wait(1)

    return token_farm


def update_front_end():
    # push contract addresses to front end
    # send brownie-config to front-end/src
    # send build forlder (with contract addresses) to front end
    with open("brownie-config.yaml", "r") as brownie_config:
        config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)

        with open(
            getParent("front_end/src/brownie-config.json", 2), "w+"
        ) as brownie_config_json:
            json.dump(config_dict, brownie_config_json)
    
    copy_folders_to_front_end("./build", getParent("front_end/src/chain-info", 2))

    print("front end updated")

def copy_folders_to_front_end(src, dst):
    if os.path.exists(dst):
        # kill everything in the folder
        shutil.rmtree(dst)
    shutil.copytree(src, dst)

def main():
    deploy_token_farm_and_dapp_token(front_end_update=True)
