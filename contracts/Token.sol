// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable {
    // Defined maximum supply constant
    uint256 public constant MAX_SUPPLY = 1000000 * 10**18; 
    
    // Address allowed to mint (the Faucet)
    address public minter;

    constructor() ERC20("PartnerToken", "PTR") Ownable(msg.sender) {
        // Initially, the deployer is the minter so we can test. 
        // We will update this to the Faucet address after deploying the Faucet.
        minter = msg.sender;
    }

    // Function to set the Faucet address after deployment
    function setMinter(address _faucet) external onlyOwner {
        minter = _faucet;
    }

    // Mint function restricted to the minter (Faucet)
    function mint(address to, uint256 amount) external {
        require(msg.sender == minter, "Caller is not the minter");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}