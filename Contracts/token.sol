// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FITCoin is ERC20 {
    // Step counter for each user
    mapping(address => uint256) public steps;
    
    // Track if user has already been rewarded
    mapping(address => bool) public hasBeenRewarded;
    
    constructor() ERC20("FIT Coin", "FITC") {
        // Mint 1000 tokens to the contract creator
        _mint(msg.sender, 1000 * 10**18);
    }
    
    // Update steps and check for rewards
    function updateSteps(uint256 _steps) public {
        // Save previous step count
        uint256 previousSteps = steps[msg.sender];
        
        // Update step count
        steps[msg.sender] = _steps;
        
        // If steps now exceed 1000 and they didn't before, and user hasn't been rewarded yet
        if (_steps > 1000 && previousSteps <= 1000 && !hasBeenRewarded[msg.sender]) {
            // Mark as rewarded
            hasBeenRewarded[msg.sender] = true;
            
            // Send 2 FITC to the user
            _mint(msg.sender, 2 * 10**18);
        }
    }
}