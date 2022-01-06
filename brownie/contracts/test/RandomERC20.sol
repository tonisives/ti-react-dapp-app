// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RandomERC20 is ERC20 {
    constructor() public ERC20("RandomERC20", "RND2") {
        _mint(msg.sender, 1000000000000000000000);
    }
}
