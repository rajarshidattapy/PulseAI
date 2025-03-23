// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title PrescriptionUpload
 * @dev Contract for storing prescription images, details and patient information
 */
contract PrescriptionUpload {
    // State variables
    mapping(address => string) public presImage;
    mapping(address => string) public presDetails;
    mapping(address => string) public patDetails;
    
    address private owner;
    mapping(address => bool) private authorizedDoctors;
    mapping(address => mapping(address => bool)) private patientAuthorizations;
    
    // Events
    event PrescriptionUploaded(address indexed patient, string ipfsHash, uint256 timestamp);
    event PatientDetailsStored(address indexed patient, uint256 timestamp);
    event DoctorAuthorized(address indexed doctor);
    event DoctorRevoked(address indexed doctor);
    event AccessGranted(address indexed patient, address indexed authorized);
    event AccessRevoked(address indexed patient, address indexed revoked);
    
    // Custom errors
    error Unauthorized();
    error EmptyInput();
    error InvalidAddress();
    
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
    
    modifier validAddress(address addr) {
        if (addr == address(0)) revert InvalidAddress();
        _;
    }
    
    // Access control functions
    function authorizeDoctors(address doctor) public onlyOwner validAddress(doctor) {
        authorizedDoctors[doctor] = true;
        emit DoctorAuthorized(doctor);
    }
    
    function revokeDoctors(address doctor) public onlyOwner validAddress(doctor) {
        require(authorizedDoctors[doctor], "Doctor not authorized");
        authorizedDoctors[doctor] = false;
        emit DoctorRevoked(doctor);
    }
    
    function grantAccess(address authorized) public validAddress(authorized) {
        patientAuthorizations[msg.sender][authorized] = true;
        emit AccessGranted(msg.sender, authorized);
    }
    
    function revokeAccess(address authorized) public validAddress(authorized) {
        patientAuthorizations[msg.sender][authorized] = false;
        emit AccessRevoked(msg.sender, authorized);
    }
    
    // Core functions
    function storePres(string memory _ipfsHash, string memory _presdetails) 
        public 
        onlyAuthorized
        nonEmptyString(_ipfsHash)
        nonEmptyString(_presdetails)
        returns(string memory) 
    {
        presDetails[msg.sender] = _presdetails;
        presImage[msg.sender] = _ipfsHash;
        emit PrescriptionUploaded(msg.sender, _ipfsHash, block.timestamp);
        return presDetails[msg.sender];
    }
    
    function storePatDetails(string memory _patdetails) 
        public 
        nonEmptyString(_patdetails) 
    {
        patDetails[msg.sender] = _patdetails;
        emit PatientDetailsStored(msg.sender, block.timestamp);
    }
    
    // Getter functions with access control
    function getPrescriptionDetails(address patient) 
        public 
        view 
        validAddress(patient)
        returns (string memory, string memory) 
    {
        require(
            patient == msg.sender || 
            patientAuthorizations[patient][msg.sender] || 
            authorizedDoctors[msg.sender] || 
            msg.sender == owner, 
            "Unauthorized access"
        );
        
        return (presImage[patient], presDetails[patient]);
    }
    
    function getPatientDetails(address patient) 
        public 
        view 
        validAddress(patient)
        returns (string memory) 
    {
        require(
            patient == msg.sender || 
            patientAuthorizations[patient][msg.sender] || 
            authorizedDoctors[msg.sender] || 
            msg.sender == owner, 
            "Unauthorized access"
        );
        
        return patDetails[patient];
    }
    
    // Safety functions
    function transferOwnership(address newOwner) public onlyOwner validAddress(newOwner) {
        owner = newOwner;
    }
    
    function isDoctor(address doctor) public view returns (bool) {
        return authorizedDoctors[doctor];
    }
    
    function hasAccess(address patient, address accessor) public view returns (bool) {
        return patient == accessor || 
               patientAuthorizations[patient][accessor] || 
               authorizedDoctors[accessor] || 
               accessor == owner;
    }
}
