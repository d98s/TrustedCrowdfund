const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

const hre = require("hardhat");


async function deployFirst() {

    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const desc = "This is a platform where fund seekers can do so for their business";

    //constprojectName, uint _targetAmount, uint _minimumAmount, uint _tokenRate
    const [owner, firstUser, secondUser, thirdUser, fourthUser] = await ethers.getSigners();

    const Crowdfundingfactory = await ethers.getContractFactory("Crowdfundingfactory");
    const crowdfundingfactory = await Crowdfundingfactory.deploy(desc, { value : lockedAmount});

    return {crowdfundingfactory, desc, lockedAmount, owner, firstUser, secondUser, thirdUser};
}

async function initiate1() {

    const projectName = "Coffee";
    const token = "CFE";
    const targetAmount = 2e11; //target of 200GWEI
    const minimumAmount = 1e9; //minimum contribution of 1 GWEI
    const tokenRate = 5;  //five tokens per minimum amount
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const deadline  = (await time.latest()) + ONE_YEAR_IN_SECS

    const Crowdfundingplatform = await ethers.getContractFactory("Crowdfundingplatform");
    return {Crowdfundingplatform, projectName, token, targetAmount, minimumAmount, tokenRate, deadline};
}

async function main() {
    await time.latest();

    const {crowdfundingfactory, firstUser, secondUser, thirdUser} = await loadFixture(deployFirst);

    const {Crowdfundingplatform, projectName, token, targetAmount, minimumAmount, tokenRate, deadline} = await loadFixture(initiate1);

    const TokenERC20 = await ethers.getContractFactory("TokenERC20");

    await crowdfundingfactory.connect(firstUser).createChildContract(projectName, token, targetAmount, minimumAmount, tokenRate, deadline);
    
    const add_platform = crowdfundingfactory.getMap(firstUser.address);
    const contractPlatform = await Crowdfundingplatform.attach(add_platform);

    const add_token = contractPlatform.getTokenAddress();
    const contractToken = await TokenERC20.attach(add_token);
    const staking_value1 = 1e10;
    const staking_value2 = 1e11;
    const staking_value3 = 2e10;
    
    await contractPlatform.connect(secondUser).contribute({value : staking_value1});
    stake1 = await contractToken.balanceOf(secondUser.address);
    nam = await contractToken.symbol();
    var blockNumBefore = await ethers.provider.getBlockNumber();
    var blockBefore = await ethers.provider.getBlock(blockNumBefore);
    var timestampBefore = blockBefore.timestamp;
    console.log('User: ', secondUser.address, 'staked: ', stake1, nam, ' on ', new Date(timestampBefore*1000).toString());
    
    const A_MONTH = (await time.latest()) + 30*24*60*60;
    await time.increaseTo(A_MONTH);

    await contractPlatform.connect(thirdUser).contribute({value : staking_value2});
    stake2 = await contractToken.balanceOf(thirdUser.address);

    var blockNumBefore = await ethers.provider.getBlockNumber();
    var blockBefore = await ethers.provider.getBlock(blockNumBefore);
    var timestampBefore = blockBefore.timestamp;
    console.log('User: ', thirdUser.address, 'staked: ', stake2, nam, ' on ', new Date(timestampBefore*1000).toString());
    
    const FIVE_MONTH = (await time.latest()) + 5*30*24*60*60;
    await time.increaseTo(FIVE_MONTH);
    await contractPlatform.connect(thirdUser).contribute({value : staking_value3});
    stake3 = await contractToken.balanceOf(thirdUser.address);
    var blockNumBefore = await ethers.provider.getBlockNumber();
    var blockBefore = await ethers.provider.getBlock(blockNumBefore);
    var timestampBefore = blockBefore.timestamp;
    console.log('User: ', thirdUser.address, 'staked: ', stake3, nam, ' on ', new Date(timestampBefore*1000).toString());
    // const A_YEAR = MONTH + 365*30*24*60*60;
    // await time.increaseTo(A_YEAR);

    const after = await ethers.provider.getBalance(add_platform);
    console.log('Raised money: ', after, ' Wei');
    
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
