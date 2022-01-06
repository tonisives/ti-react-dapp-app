import pytest
from scripts.deploy import DAPP_TOKEN_KEPT_BALANCE, deploy_token_farm_and_dapp_token
from scripts.utils import (
    DECIMALS,
    MOCK_PRICE_FEED_VALUE,
    get_account,
    get_contract,
    only_local,
)
from brownie import exceptions, RandomERC20


def test_setPriceFeedContract():
    only_local()
    # test that only onwer can set the price feed contract
    account = get_account()
    non_owner = get_account(index=1)

    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    price_feed_address = get_contract("eth_usd_price_feed")
    token_farm.setPriceFeedContract(
        dapp_token.address, price_feed_address, {"from": account}
    )

    # assert owner can set the price feed mapping
    assert token_farm.tokenPriceFeedMapping(dapp_token.address) == price_feed_address

    # assert that non-owner cannot set the price feed contract
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.setPriceFeedContract(
            dapp_token.address, price_feed_address, {"from": non_owner}
        )


def test_stake_tokens(amount_staked):
    only_local()
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    # approve dapp tokens for the token farm
    dapp_token.approve(token_farm.address, amount_staked, {"from": account})
    token_farm.stakeTokens(amount_staked, dapp_token.address, {"from": account})

    assert (
        # get value from a mapping of a mapping (stakingBalance)
        token_farm.stakingBalance(dapp_token.address, account.address)
        == amount_staked
    )

    assert token_farm.uniqueTokensStaked(account.address) == 1
    assert token_farm.stakers(0) == account.address

    return token_farm, dapp_token


def test_issue_tokens(amount_staked):
    only_local()
    account = get_account()

    # need to stake tokens before can issue rewards
    token_farm, dapp_token = test_stake_tokens(amount_staked)
    starting_balance = dapp_token.balanceOf(account.address)

    # issue rewards
    token_farm.issueTokens({"from": account}).wait(1)
    # we are staking 1 dapp token which is equal to price of 1 ETH
    # since mock eth price is 2000 ($INITIAL_VALUE), we should get 2000 dapp tokens in return
    assert (
        dapp_token.balanceOf(account.address)
        == starting_balance + MOCK_PRICE_FEED_VALUE
    )


def test_unstake_tokens(amount_staked):
    only_local()
    account = get_account()

    # test cannot unstake if no tokens staked
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.unstakeTokens(dapp_token.address, {"from": account})

    token_farm, dapp_token = test_stake_tokens(amount_staked)

    # unstake tokens
    token_farm.unstakeTokens(dapp_token.address, {"from": account})
    assert token_farm.stakingBalance(dapp_token.address, account.address) == 0

    assert token_farm.uniqueTokensStaked(account.address) == 0
    assert dapp_token.balanceOf(account.address) == DAPP_TOKEN_KEPT_BALANCE


def test_get_user_total_value(amount_staked, random_erc20):
    only_local()
    account = get_account()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()

    with pytest.raises(exceptions.VirtualMachineError):
        token_farm.getUserTotalValue(account.address, {"from": account})

    token_farm, dapp_token = test_stake_tokens(amount_staked)

    # we stake 1 eth, getUserTotalValue is in $
    assert token_farm.getUserTotalValue(
        account.address, {"from": account}
    ) == amount_staked * (MOCK_PRICE_FEED_VALUE / 10 ** 18)

    # also stake another 1 DAI, verify value increased by 1 dollar

    # add new allowed token
    token_farm.addAllowedToken(random_erc20.address, {"from": account})
    token_farm.setPriceFeedContract(
        random_erc20.address, get_contract("dai_usd_price_feed"), {"from": account}
    )
    assert token_farm.tokenIsAllowed(random_erc20.address)

    # verify that adding this new token increases the total value
    random_erc20.approve(token_farm.address, 2 * 10 ** 18, {"from": account})
    token_farm.stakeTokens(2 * 10 ** 18, random_erc20.address, {"from": account})

    expected_value = (amount_staked * (MOCK_PRICE_FEED_VALUE / 10 ** 18)) + (
        2 * 10 ** 18 * (MOCK_PRICE_FEED_VALUE / 10 ** 18)
    )

    assert (
        token_farm.getUserTotalValue(account.address, {"from": account})
        == expected_value  # all of the price feed mocks return 2000
    )


def test_get_token_value():
    only_local()
    token_farm, dapp_token = deploy_token_farm_and_dapp_token()
    # Act / Assert
    assert token_farm.getTokenValue(dapp_token.address) == (
        MOCK_PRICE_FEED_VALUE,
        DECIMALS,
    )