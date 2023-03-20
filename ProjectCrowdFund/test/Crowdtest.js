const {
    time,
    loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Crowdfundingfactory", function() {
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
        const deadline  = (await time.latest()) + ONE_YEAR_IN_SECS;

        const Crowdfundingplatform = await ethers.getContractFactory("Crowdfundingplatform");
        return {Crowdfundingplatform, projectName, token, targetAmount, minimumAmount, tokenRate, deadline};
    }

    async function initiate2() {

        const projectName = "BURGER";
        const token = "BGR";
        const targetAmount = 2e13; //target of 200GWEI
        const minimumAmount = 1e11; //minimum contribution of 1 GWEI
        const tokenRate = 5;  //five tokens per minimum amount
        const THIRTY_DAYS_IN_SECS = 30 * 24 * 60 * 60; //30 days may be
        const deadline  = (await time.latest()) + THIRTY_DAYS_IN_SECS;

        return {projectName, token, targetAmount, minimumAmount, tokenRate, deadline};
    }

    describe("Deployment", function() {
        it("Should set the right owner and description", async function() {
            const {crowdfundingfactory, owner, desc} = await loadFixture(deployFirst);

            expect(await crowdfundingfactory.owner()).to.equal(owner.address);
            expect(await crowdfundingfactory.description()).to.equal(desc);
        });
    })
    describe("Create A Fundraising", function() {
        it("Should pass all the parameters well (Owner, TokenName, Target, Minimum, tokenRate, deadline)", async function() {
            const {crowdfundingfactory, firstUser} = await loadFixture(deployFirst);

            const {Crowdfundingplatform, projectName, token, targetAmount, minimumAmount, tokenRate, deadline} = await loadFixture(initiate1);

            await crowdfundingfactory.connect(firstUser).createChildContract(projectName, token, targetAmount, minimumAmount, tokenRate, deadline);
            const add = crowdfundingfactory.getMap(firstUser.address);
            const contract = await Crowdfundingplatform.attach(add);
            expect(await contract.getOwner()).to.equal(firstUser.address);
            expect(await contract.getProjectName()).to.equal(projectName);
            expect(await contract.getTokenName()).to.equal(token);
            expect(await contract.getTargetAmount()).to.equal(targetAmount);
            expect(await contract.getMinimumAmount()).to.equal(minimumAmount);
            expect(await contract.getTokenRate()).to.equal(tokenRate);
            expect(await contract.getDeadline()).to.equal(deadline);
        });

    })
    
    describe("Create Two Fundraising Platforms", function() {
        it("Should pass all the parameters well (Owner, TokenName, Target, Minimum, tokenRate, deadline) to both fundings", async function() {
            const {crowdfundingfactory, firstUser, secondUser} = await loadFixture(deployFirst);

            var {Crowdfundingplatform, projectName, token, targetAmount, minimumAmount, tokenRate, deadline} = await loadFixture(initiate1);
            
            //platform 1 for coffee shop
            await crowdfundingfactory.connect(firstUser).createChildContract(projectName, token, targetAmount, minimumAmount, tokenRate, deadline);
            const add1 = crowdfundingfactory.getMap(firstUser.address);
            const contract1 = await Crowdfundingplatform.attach(add1);

            expect(await contract1.getOwner()).to.equal(firstUser.address);
            expect(await contract1.getProjectName()).to.equal(projectName);
            expect(await contract1.getTokenName()).to.equal(token);
            expect(await contract1.getTargetAmount()).to.equal(targetAmount);
            expect(await contract1.getMinimumAmount()).to.equal(minimumAmount);
            expect(await contract1.getTokenRate()).to.equal(tokenRate);
            expect(await contract1.getDeadline()).to.equal(deadline);

            //platform2 for burger shop
            var {projectName, token, targetAmount, minimumAmount, tokenRate, deadline} = await loadFixture(initiate2);
            
            await crowdfundingfactory.connect(secondUser).createChildContract(projectName, token, targetAmount, minimumAmount, tokenRate, deadline);
            const add2 = crowdfundingfactory.getMap(secondUser.address);
            const contract2 = await Crowdfundingplatform.attach(add2);          

            expect(await contract2.getOwner()).to.equal(secondUser.address);
            expect(await contract2.getProjectName()).to.equal(projectName);
            expect(await contract2.getTokenName()).to.equal(token);
            expect(await contract2.getTargetAmount()).to.equal(targetAmount);
            expect(await contract2.getMinimumAmount()).to.equal(minimumAmount);
            expect(await contract2.getTokenRate()).to.equal(tokenRate);
            expect(await contract2.getDeadline()).to.equal(deadline);
        });

    })
    describe("Staking", function() {
        it("Should fail if the  staking amount is less than the minimum", async function() {
            const {crowdfundingfactory, firstUser, thirdUser} = await loadFixture(deployFirst);

            const {Crowdfundingplatform, projectName, token, targetAmount, minimumAmount, tokenRate, deadline} = await loadFixture(initiate1);

            await crowdfundingfactory.connect(firstUser).createChildContract(projectName, token, targetAmount, minimumAmount, tokenRate, deadline);
            
            const add_platform = crowdfundingfactory.getMap(firstUser.address);
            const contract = await Crowdfundingplatform.attach(add_platform);
            await expect(contract.connect(thirdUser).contribute({value : 1e8})).to.be.revertedWith(
                "contribution below threshold"
            );
        });

        it("Should get Tokens for my stake", async function() {
            const {crowdfundingfactory, firstUser, thirdUser} = await loadFixture(deployFirst);

            const {Crowdfundingplatform, projectName, token, targetAmount, minimumAmount, tokenRate, deadline} = await loadFixture(initiate1);

            const TokenERC20 = await ethers.getContractFactory("TokenERC20");

            await crowdfundingfactory.connect(firstUser).createChildContract(projectName, token, targetAmount, minimumAmount, tokenRate, deadline);
            
            const add_platform = crowdfundingfactory.getMap(firstUser.address);
            const contract = await Crowdfundingplatform.attach(add_platform);

            const add_token = contract.getTokenAddress();
            const contract1 = await TokenERC20.attach(add_token);
            const staking_value = 1e10;
            // const before = await ethers.provider.getBalance(firstUser.address);
    
            await contract.connect(thirdUser).contribute({value : staking_value});

            expect(await contract1.balanceOf(thirdUser.address)).to.equal(tokenRate * staking_value / minimumAmount);
        });

    })
})
