// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoldenToken is ERC20, Ownable {

    uint256 public constant MAX_SUPPLY = 100_000_000 * 10**18; // Max Supply sur un réseau
    uint256 public circulatingSupply;
    uint256 public maxPercentageMint = 5;  // 5% max per mint

    constructor() ERC20("Golden Token", "GLD") {
        uint256 initialSupply = 10_000_000 * 10**18;

        _mint(msg.sender, initialSupply);
        circulatingSupply = initialSupply;
    }

    /**
     * @dev Mint de nouveaux tokens (staking rewards, incentives, etc.)
     * circulatingSupply = initial supply + tous les mints
     */
    function mint(address to, uint256 amount) external onlyOwner {
        require(
            circulatingSupply + amount <= MAX_SUPPLY,
            "Max supply exceeded"
        );
        require( amount <= (MAX_SUPPLY * maxPercentageMint)/100);

        _mint(to, amount);
        circulatingSupply += amount;
    }

    /**
     * @dev Burn par le owner (ex: régulation, correction, tokenomics)
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
        circulatingSupply -= amount;
    }

    /**
     * @dev Burn volontaire par l'utilisateur
     */
    function burnMyTokens(uint256 amount) external {
        _burn(msg.sender, amount);
        circulatingSupply -= amount;
    }

    /**
     * @dev Supply restant à  mint
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - circulatingSupply;
    }
}
