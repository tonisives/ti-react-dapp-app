from brownie import network
import pytest
from scripts.deploy import deploy_token_farm_and_dapp_token

from scripts.utils import LOCAL_BLOCKCHAIN_ENVIRONMENTS, get_account, get_contract


def test_stake_and_issue_correct_amount(amount_staked):
    only_remote()
    # deploy contract, stake 1 dapp token, issue rewards, assert get 1 dapp tokens back
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    # price_feed_address = get_contract("eth_usd_price_feed")
    # token_farm.setPriceFeedContract(
    #     dapp_token.address, price_feed_address, {"from": account}
    # )

    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})

    starting_balance = dapp_token.balanceOf(account.address)

    price_feed_contract = get_contract("dai_usd_price_feed")
    (_, price, _, _, _) = price_feed_contract.latestRoundData()

    # Stake 1 token
    # 1 Token = $1
    # We should be issued, 1 tokens
    amount_token_to_issue = (
        price / 10 ** price_feed_contract.decimals()
    ) * amount_staked
    print(f"amount_token_to_issue: {amount_token_to_issue}")

    token_farm.issueTokens({"from": account}).wait(1)

    assert (
        dapp_token.balanceOf(account.address)
        == starting_balance + amount_token_to_issue
    )

    pass


def only_remote():
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        pytest.skip("Can only test on remote networks")
