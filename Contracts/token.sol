// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FITCoin
 * @dev ERC20 token that rewards users for tracking their steps
 */
contract FITCoin is ERC20, Ownable, Pausable, ReentrancyGuard {
    // Step counter for each user
    mapping(address => uint256) public steps;
    
    // Track if user has already been rewarded for the 1000 steps milestone
    mapping(address => bool) public hasBeenRewarded;
    
    // Whitelist of authorized step data providers
    mapping(address => bool) public authorizedProviders;
    
    // Reward thresholds and amounts
    uint256 public stepRewardThreshold = 1000;
    uint256 public rewardAmount = 2 * 10**18; // 2 tokens with 18 decimals
    
    // Maximum supply cap
    uint256 public immutable MAX_SUPPLY;
    
    // Events
    event StepsUpdated(address indexed user, uint256 oldSteps, uint256 newSteps);
    event RewardPaid(address indexed user, uint256 stepCount, uint256 amount);
    event ProviderAuthorized(address indexed provider);
    event ProviderRevoked(address indexed provider);
    event RewardParametersUpdated(uint256 newThreshold, uint256 newAmount);
    
    // Custom errors
    error InvalidStepCount();
    error Unauthorized();
    error MaxSupplyExceeded();
    error AlreadyAuthorized();
    error NotAuthorized();
    
    /**
     * @dev Initialize the contract, setting name, symbol, and max supply
     * @param initialSupply Amount of tokens to mint to the contract creator
     * @param maxSupply Maximum possible supply of the token
     */
    constructor(
        uint256 initialSupply,
        uint256 maxSupply
    ) ERC20("FIT Coin", "FITC") Ownable(msg.sender) {
        require(maxSupply >= initialSupply, "Max supply must be >= initial supply");
        
        // Set max supply
        MAX_SUPPLY = maxSupply * 10**18;
        
        // Mint initial tokens to the contract creator
        _mint(msg.sender, initialSupply * 10**18);
        
        // Add contract creator as authorized provider
        authorizedProviders[msg.sender] = true;
        emit ProviderAuthorized(msg.sender);
    }
    
    /**
     * @dev Modifier to check if the caller is an authorized provider
     */
    modifier onlyAuthorizedProvider() {
        if (!authorizedProviders[msg.sender]) revert Unauthorized();
        _;
    }
    
    /**
     * @dev Authorize a new step data provider
     * @param provider Address to authorize
     */
    function authorizeProvider(address provider) external onlyOwner {
        require(provider != address(0), "Invalid address");
        if (authorizedProviders[provider]) revert AlreadyAuthorized();
        
        authorizedProviders[provider] = true;
        emit ProviderAuthorized(provider);
    }
    
    /**
     * @dev Revoke authorization from a step data provider
     * @param provider Address to revoke
     */
    function revokeProvider(address provider) external onlyOwner {
        if (!authorizedProviders[provider]) revert NotAuthorized();
        
        authorizedProviders[provider] = false;
        emit ProviderRevoked(provider);
    }
    
    /**
     * @dev Update reward parameters
     * @param newThreshold New step threshold to earn rewards
     * @param newAmount New reward amount in tokens (including decimals)
     */
    function updateRewardParameters(
        uint256 newThreshold,
        uint256 newAmount
    ) external onlyOwner {
        require(newThreshold > 0, "Threshold must be greater than zero");
        require(newAmount > 0, "Amount must be greater than zero");
        
        stepRewardThreshold = newThreshold;
        rewardAmount = newAmount;
        
        emit RewardParametersUpdated(newThreshold, newAmount);
    }
    
    /**
     * @dev Update steps for a user and process any rewards
     * @param user Address of the user
     * @param newSteps New step count
     */
    function updateStepsFor(
        address user,
        uint256 newSteps
    ) external onlyAuthorizedProvider whenNotPaused nonReentrant {
        require(user != address(0), "Invalid user address");
        if (newSteps < steps[user]) revert InvalidStepCount();
        
        _updateSteps(user, newSteps);
    }
    
    /**
     * @dev Update steps for the sender and process any rewards
     * @param newSteps New step count
     */
    function updateSteps(
        uint256 newSteps
    ) external whenNotPaused nonReentrant {
        if (newSteps < steps[msg.sender]) revert InvalidStepCount();
        
        _updateSteps(msg.sender, newSteps);
    }
    
    /**
     * @dev Internal implementation of step update logic
     * @param user User address
     * @param newSteps New step count
     */
    function _updateSteps(address user, uint256 newSteps) private {
        // Save previous step count
        uint256 previousSteps = steps[user];
        
        // Update step count
        steps[user] = newSteps;
        
        // Emit event for the update
        emit StepsUpdated(user, previousSteps, newSteps);
        
        // Process rewards if eligible
        _processRewards(user, previousSteps, newSteps);
    }
    
    /**
     * @dev Process rewards for a user based on step counts
     * @param user User address
     * @param previousSteps Previous step count
     * @param newSteps New step count
     */
    function _processRewards(
        address user,
        uint256 previousSteps,
        uint256 newSteps
    ) private {
        // If steps now exceed threshold and they didn't before, and user hasn't been rewarded yet
        if (newSteps >= stepRewardThreshold && 
            previousSteps < stepRewardThreshold && 
            !hasBeenRewarded[user]) {
                
            // Mark as rewarded
            hasBeenRewarded[user] = true;
            
            // Check if minting would exceed max supply
            if (totalSupply() + rewardAmount > MAX_SUPPLY) {
                revert MaxSupplyExceeded();
            }
            
            // Send tokens to the user
            _mint(user, rewardAmount);
            
            // Emit reward event
            emit RewardPaid(user, newSteps, rewardAmount);
        }
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Reset reward status for a user (in case of errors)
     * @param user Address to reset
     */
    function resetRewardStatus(address user) external onlyOwner {
        hasBeenRewarded[user] = false;
    }
    
    /**
     * @dev Get all user data at once
     * @param user Address to query
     * @return User's step count and reward status
     */
    function getUserData(address user) external view returns (uint256, bool) {
        return (steps[user], hasBeenRewarded[user]);
    }
}
