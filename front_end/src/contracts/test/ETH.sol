// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ETH is ERC20 {
    constructor() public ERC20("ETH", "ETH") {
    }
}
