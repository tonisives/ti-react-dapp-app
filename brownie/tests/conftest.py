import eth_account
import pytest
from brownie import RandomERC20

from scripts.utils import get_account


@pytest.fixture
def amount_staked():
    return 1 * 10 ** 18


@pytest.fixture
def random_erc20():
    account = get_account()
    erc20 = RandomERC20.deploy({"from": account})
    return erc20
