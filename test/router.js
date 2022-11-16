
const { ethers } = require("hardhat");
const { formatUnits, parseEther } = require("ethers/lib/utils")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const hre = require("hardhat")
const { assert, expect } = require("chai")
const { BN, constants, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const add = hre.artifacts.readArtifact("PancakeFactory")

describe("Liquidity test ", function () {
    async function deployTokenFixture() {
        const [alice, bob, carol, david, erin, owner] = await hre.ethers.getSigners();
        let pairAB;
        let pairBC;
        let pairAC;
        let pancakeRouter;
        let pancakeFactory;
        let tokenA;
        let tokenC;
        let wrappedBNB;
        // console.log([alice, bob, carol, david, erin, owner])
        const PancakeFactory = await hre.ethers.getContractFactory("PancakeFactory", owner);
        const factory = await PancakeFactory.deploy(owner.address);
        pancakeFactory = await factory.deployed();

        // Deploy Wrapped BNB
        const WBNBToken = await hre.ethers.getContractFactory("contracts/libraries/WBNB.sol:WBNB", owner);
        const WBNB = await WBNBToken.deploy();
        wrappedBNB = await WBNB.deployed();

        const PancakePair = await hre.ethers.getContractFactory("PancakePair");
        // console.log(PancakePair)

        // Deploy Router
        const PancakeRouter = await hre.ethers.getContractFactory("contracts/PancakeRouter.sol:PancakeRouter", owner);
        const router = await PancakeRouter.deploy(pancakeFactory.address, wrappedBNB.address);
        pancakeRouter = await router.deployed();

        // Deploy ERC20s
        const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
        const tokenAdeployed = await MockERC20.deploy("Token A", "TA", parseEther("10000000"))
        tokenA = await tokenAdeployed.deployed();
        const tokenBdeployed = await MockERC20.deploy("Token C", "TC", parseEther("10000000"));
        tokenC = await tokenBdeployed.deployed()
        let result = await pancakeFactory.connect(alice).createPair(wrappedBNB.address, tokenA.address);
        let pairABAddress = await pancakeFactory.allPairs(0)
        pairAB = await hre.ethers.getContractAt("PancakePair", await pairABAddress);
        // console.log("pairAB", result.logs[0].args[2])

        result = await pancakeFactory.createPair(wrappedBNB.address, tokenC.address);
        let pairBCAddress = await pancakeFactory.allPairs(1)
        pairBC = await hre.ethers.getContractAt("PancakePair", await pairBCAddress);


        result = await pancakeFactory.connect(alice).createPair(tokenA.address, tokenC.address);
        let pairACAddress = await pancakeFactory.allPairs(2)
        pairAC = await hre.ethers.getContractAt("PancakePair", await pairACAddress);

        assert.equal(String(await pairAB.totalSupply()), parseEther("0").toString());
        assert.equal(String(await pairBC.totalSupply()), parseEther("0").toString());
        assert.equal(String(await pairAC.totalSupply()), parseEther("0").toString());


        for (let thisUser of [alice, bob, carol, david, erin, owner]) {
            await tokenA.connect(thisUser).mintTokens(parseEther("2000000"));
            await tokenC.connect(thisUser).mintTokens(parseEther("2000000"));

            await tokenA.connect(thisUser).approve(pancakeRouter.address, parseEther("100000000000000000000000000000"));
            await tokenC.connect(thisUser).approve(pancakeRouter.address, parseEther("100000000000000000000000000000"));
            await wrappedBNB.connect(thisUser).approve(pancakeRouter.address, parseEther("100000000000000000000000000000"));
        }

        return {
            pairAB,
            pairBC,
            pairAC,
            pancakeRouter,
            pancakeFactory,
            tokenA,
            tokenC,
            wrappedBNB,
            alice, bob, carol, david, erin, owner
        }
    }

    it("User adds liquidity to LP tokens", async function () {
        const { pairAB,
            pairBC,
            pairAC,
            pancakeRouter,
            pancakeFactory,
            tokenA,
            tokenC,
            wrappedBNB,
            alice, bob, carol, david, erin, owner } = await loadFixture(deployTokenFixture);
        const deadline = await time.latest() + 12000;
        // console.log(deadline)

        /* Add liquidity (Pancake Router)
         * address tokenB,
         * uint256 amountADesired,
         * uint256 amountBDesired,
         * uint256 amountAMin,
         * uint256 amountBMin,
         * address to,
         * uint256 deadline
         */
        expect(0).to.equal(0);
        // 1 A = 1 C
        let result = await pancakeRouter.connect(bob).addLiquidity(
            tokenC.address,
            tokenA.address,
            parseEther("1000000"), // 1M token A
            parseEther("1000000"), // 1M token B
            parseEther("1000000"),
            parseEther("1000000"),
            bob.address,
            deadline,
        );

        // expectEvent.inTransaction(result.receipt.transactionHash, tokenA, "Transfer", {
        //     from: bob,
        //     to: pairAC.address,
        //     value: parseEther("1000000").toString(),
        // });

        //     expectEvent.inTransaction(result.receipt.transactionHash, tokenC, "Transfer", {
        //         from: bob,
        //         to: pairAC.address,
        //         value: parseEther("1000000").toString(),
        //     });

        //     assert.equal(String(await pairAC.totalSupply()), parseEther("1000000").toString());
        //     assert.equal(String(await tokenA.balanceOf(pairAC.address)), parseEther("1000000").toString());
        //     assert.equal(String(await tokenC.balanceOf(pairAC.address)), parseEther("1000000").toString());

        //     // 1 BNB = 100 A
        //     result = await pancakeRouter.addLiquidityETH(
        //         tokenA.address,
        //         parseEther("100000"), // 100k token A
        //         parseEther("100000"), // 100k token A
        //         parseEther("1000"), // 1,000 BNB
        //         bob,
        //         deadline,
        //         { from: bob, value: parseEther("1000").toString() }
        //     );

        //     expectEvent.inTransaction(result.receipt.transactionHash, tokenA, "Transfer", {
        //         from: bob,
        //         to: pairAB.address,
        //         value: parseEther("100000").toString(),
        //     });

        //     assert.equal(String(await pairAB.totalSupply()), parseEther("10000").toString());
        //     assert.equal(String(await wrappedBNB.balanceOf(pairAB.address)), parseEther("1000").toString());
        //     assert.equal(String(await tokenA.balanceOf(pairAB.address)), parseEther("100000").toString());

        // 1 BNB = 100 C
        // result = await pancakeRouter.addLiquidityETH(
        //     tokenC.address,
        //     parseEther("100000"), // 100k token C
        //     parseEther("100000"), // 100k token C
        //     parseEther("1000"), // 1,000 BNB
        //     bob,
        //     deadline,
        //     { from: bob, value: parseEther("1000").toString() }
        // );

        //     expectEvent.inTransaction(result.receipt.transactionHash, tokenC, "Transfer", {
        //         from: bob,
        //         to: pairBC.address,
        //         value: parseEther("100000").toString(),
        //     });

        //     assert.equal(String(await pairBC.totalSupply()), parseEther("10000").toString());
        //     assert.equal(String(await wrappedBNB.balanceOf(pairBC.address)), parseEther("1000").toString());
        //     assert.equal(String(await tokenC.balanceOf(pairBC.address)), parseEther("100000").toString());
    });

})
