// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Token.sol";

contract TokenFaucet {
    Token public token;
    address public admin;
    bool public isPaused;

    // Constants as required by instructions
    uint256 public constant FAUCET_AMOUNT = 100 * 10**18;
    uint256 public constant COOLDOWN_TIME = 24 hours;
    uint256 public constant MAX_CLAIM_AMOUNT = 1000 * 10**18;

    // State mappings
    mapping(address => uint256) public lastClaimAt;
    mapping(address => uint256) public totalClaimed;

    // Events
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event FaucetPaused(bool paused);

    // Modifier to restrict admin functions
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor(address _tokenAddress) {
        token = Token(_tokenAddress);
        admin = msg.sender;
        isPaused = false;
    }

    function requestTokens() external {
        require(!isPaused, "Faucet is paused");
        require(msg.sender != address(0), "Invalid address");
        
        // Check cooldown
        require(block.timestamp >= lastClaimAt[msg.sender] + COOLDOWN_TIME, "Cooldown active");
        
        // Check lifetime limit
        require(totalClaimed[msg.sender] + FAUCET_AMOUNT <= MAX_CLAIM_AMOUNT, "Lifetime limit reached");

        // Update state
        lastClaimAt[msg.sender] = block.timestamp;
        totalClaimed[msg.sender] += FAUCET_AMOUNT;

        // Mint tokens
        token.mint(msg.sender, FAUCET_AMOUNT);
        
        emit TokensClaimed(msg.sender, FAUCET_AMOUNT, block.timestamp);
    }

    function canClaim(address user) external view returns (bool) {
        if (isPaused) return false;
        if (block.timestamp < lastClaimAt[user] + COOLDOWN_TIME) return false;
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return false;
        return true;
    }

    function remainingAllowance(address user) external view returns (uint256) {
        if (totalClaimed[user] >= MAX_CLAIM_AMOUNT) return 0;
        return MAX_CLAIM_AMOUNT - totalClaimed[user];
    }

    function setPaused(bool _paused) external onlyAdmin {
        isPaused = _paused;
        emit FaucetPaused(_paused);
    }
    
    // Note: 'isPaused' public variable automatically creates the isPaused() getter
}