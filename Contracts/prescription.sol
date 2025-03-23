// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title PrescriptionUpload
 * @dev Contract for storing prescription and patient details securely
 */
contract PrescriptionUpload {
    // State variables
    mapping(address => string) private presDetails;
    mapping(address => string) private patDetails;
    address private owner;
    mapping(address => bool) private authorizedDoctors;
    
    // Events
    event PrescriptionStored(address indexed user, uint256 timestamp);
    event PatientDetailsStored(address indexed user, uint256 timestamp);
    event DoctorAuthorized(address indexed doctor);
    event DoctorRevoked(address indexed doctor);
    
    // Custom errors
    error Unauthorized();
    error EmptyInput();
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // Modifiers
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    
    modifier onlyAuthorized() {
        if (msg.sender != owner && !authorizedDoctors[msg.sender]) revert Unauthorized();
        _;
    }
    
    modifier nonEmptyString(string memory str) {
        if (bytes(str).length == 0) revert EmptyInput();
        _;
    }
    
    // Owner functions
    function authorizeDoctors(address doctor) public onlyOwner {
        require(doctor != address(0), "Invalid doctor address");
        authorizedDoctors[doctor] = true;
        emit DoctorAuthorized(doctor);
    }
    
    function revokeDoctors(address doctor) public onlyOwner {
        require(authorizedDoctors[doctor], "Doctor not authorized");
        authorizedDoctors[doctor] = false;
        emit DoctorRevoked(doctor);
    }
    
    // Core functions
    function storePres(string memory _prescription) 
        public 
        onlyAuthorized
        nonEmptyString(_prescription) 
        returns(string memory) 
    {
        presDetails[msg.sender] = _prescription;
        emit PrescriptionStored(msg.sender, block.timestamp);
        return presDetails[msg.sender];
    }
    
    function storePatDetails(string memory _patDetails) 
        public 
        nonEmptyString(_patDetails) 
        returns (string memory)
    {
        patDetails[msg.sender] = _patDetails;
        emit PatientDetailsStored(msg.sender, block.timestamp);
        return patDetails[msg.sender];
    }
    
    // Getter functions
    function getPrescription(address patient) 
        public 
        view 
        onlyAuthorized 
        returns (string memory) 
    {
        return presDetails[patient];
    }
    
    function getPatientDetails(address patient) 
        public 
        view 
        onlyAuthorized 
        returns (string memory) 
    {
        return patDetails[patient];
    }
    
    function getOwnPrescription() public view returns (string memory) {
        return presDetails[msg.sender];
    }
    
    function getOwnPatientDetails() public view returns (string memory) {
        return patDetails[msg.sender];
    }
    
    // Safety function
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid new owner address");
        owner = newOwner;
    }
}
