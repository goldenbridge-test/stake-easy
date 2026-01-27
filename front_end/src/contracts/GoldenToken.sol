// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoldenToken is ERC20, Ownable {
    constructor() ERC20("Golden Token", "GLD") {
        _mint(msg.sender, 1000000000000000000000000);
    }
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
