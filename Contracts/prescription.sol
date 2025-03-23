// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract PrescriptionUpload {
    mapping(address => string) public presDetails;
    address[] public patDetails;
    
    event PrescriptionUploaded(address indexed patient, string ipfsHash);

    function storePres(string memory _ipfsHash) public returns(string memory) {
        presDetails[msg.sender] = _ipfsHash;
        emit PrescriptionUploaded(msg.sender, _ipfsHash);
        return presDetails[msg.sender];
    }
    
    function storePatDetails() public {
        patDetails.push(msg.sender);
    }
}