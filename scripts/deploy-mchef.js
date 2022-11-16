const { devadd } = require("../config")
const hre = require("hardhat");


/**
 *  CakeToken _cake,
        SyrupBar _syrup,
        address _devaddr,
        uint256 _cakePerBlock,
        uint256 _startBlock
 */
async function main() {

    const masterchef = await hre.ethers.getContractFactory("MasterChef");
    const masterChef = await masterchef.deploy(cake, syrup, devadd, cakeperblock, startBlock);

    await masterChef.deployed();

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
