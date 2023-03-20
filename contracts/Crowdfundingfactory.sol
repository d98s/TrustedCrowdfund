// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./Crowdfundingplatform.sol";
import "hardhat/console.sol";

contract Crowdfundingfactory {
    //Owner of the parent contract
    address public owner;
    //Description of the project
    string public description;
    //set of contracts to be created by users who would like ti raise a fund
    // Crowdfundingplatform[] public childrenContracts;
    // mapping(address => Crowdfundingplatform) public map;
    mapping(address => address) public mapp;
    //

    constructor(string memory _description) payable{
        // owner = msg.sender();
        owner = msg.sender;
        description = _description;
        // console.log("Inside the constructor of Factory");
    }

    function createChildContract(string memory _projectName, string memory _token, uint _targetAmount, uint _minimumAmount, uint _tokenRate, uint _deadline) public {
        
        Crowdfundingplatform newContract = new Crowdfundingplatform(msg.sender, _projectName, _token, _targetAmount, _minimumAmount, _tokenRate, _deadline);
        mapp[msg.sender] = newContract.getAddress();
        
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function getMap(address user) public view returns (address) {
        return mapp[user];
    }

    function getDescription() public view returns (string memory) {
        return description;
    }

}