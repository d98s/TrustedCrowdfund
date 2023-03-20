// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// import "hardhat/console.log";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "hardhat/console.sol";

contract Crowdfundingplatform {

    TokenERC20 public stakingToken;
    //Owner of the contract
    address payable public owner;
    //Name of the child bussiness
    string public projectName;
    //Name of the token
    string public token;
    //Target to be raised
    uint public targetAmount;
    //Minimum Contribution
    uint public minimumAmount;
    // token per USD 
    uint public tokenRate;
    //Crowdfund deadline
    uint public deadline;
    //Total raised
    uint public totalRaised;
    //Total raised money
    uint public totalAmount;

    //User mapping address => amountOwned
    mapping(address => uint) public amountPerUser;
    //
    event Withdrawal(uint amount, uint when);
    
    constructor(address _owner, string memory _projectName, string memory _token, uint _targetAmount, uint _minimumAmount, uint _tokenRate, uint _deadline) {
        owner = payable(_owner);
        projectName = _projectName;
        token = _token;
        targetAmount = _targetAmount;
        minimumAmount = _minimumAmount;
        tokenRate = _tokenRate;
        deadline = _deadline;
        stakingToken = new TokenERC20(projectName, token);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "not authorized");
        _;
    }

    function contribute() public payable{
        require(block.timestamp < deadline, "Funding is past deadline");
        require(totalAmount < targetAmount, "Enough money is raised");
        require(msg.value >= minimumAmount, "contribution below threshold");

        amountPerUser[msg.sender] += msg.value;

        totalAmount += msg.value;

        stakingToken.transfer(msg.sender, tokenRate * msg.value  / minimumAmount);

        totalRaised += tokenRate * msg.value;
    }



    function getOwner() public view returns (address) {
        return owner;
    }
    function getProjectName() public view returns (string memory) {
        return projectName;
    }

    function getTokenName() public view returns (string memory) {
        return token;
    }

    function getAddress() public view returns (address) {
        return address(this);
    }
    function getMinimumAmount() public view returns (uint) {
        return minimumAmount;
    }

    function getTargetAmount() public view returns (uint) {
        return targetAmount;
    }

    function getTokenRate() public view returns (uint) {
        return tokenRate;
    }

    function getDeadline() public view returns (uint) {
        return deadline;
    }

    function getTokenAddress() public view returns (address) {
        return address(stakingToken);
    }
    
}

contract TokenERC20 is ERC20 {

    constructor(string memory name, string memory symb) ERC20(name, symb) {
        _mint(msg.sender, 1000);
    }

}