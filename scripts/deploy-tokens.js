
const hre = require("hardhat");
const { token } = require("../config")
const { formatUnits, parseEther } = require("ethers/lib/utils")

async function dexToken() {

    const dextok = await hre.ethers.getContractFactory("contracts/Agam.sol:BEP20")
    const dexTok = await dextok.deploy("token", "token");

    const dexTokenAdress = await dexTok.deployed();
    console.log("DExtoken : ", dexTokenAdress.address);
    return dexTokenAdress

}

async function syrupToken() {

    const dextoken = await dexToken()
    const syrup = await hre.ethers.getContractFactory("contracts/SyrupBar.sol:SyrupBar");
    const syrupBar = await syrup.deploy(dextoken.address);
    const dexsyrup = await syrupBar.deployed(dextoken);
    console.log(" Syrup token: ", dexsyrup.address)

}

async function wrappedNative() {
    dexToken()
    const syrup = await hre.ethers.getContractFactory("WBNB");
    const syrupBar = await syrup.deploy();
    const dexsyrup = await syrupBar.deployed();
    console.log(" wrap token: ", dexsyrup.address)

}

async function MockERC20() {
    dexToken()
    const syrup = await hre.ethers.getContractFactory("MockERC20");
    const syrupBar = await syrup.deploy("Token A", "TA", parseEther("10000000"));
    const dexsyrup = await syrupBar.deployed();
    console.log(" wrap token: ", dexsyrup.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
MockERC20().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

module.exports = {
    // syrupToken,
    dexToken
}
