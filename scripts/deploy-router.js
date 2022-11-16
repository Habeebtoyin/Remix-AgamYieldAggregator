const { feeSetterAddress } = require("../config");
const hre = require("hardhat");


/**
 *  CakeToken _cake,
        SyrupBar _syrup,
        address _devaddr,
        uint256 _cakePerBlock,
        uint256 _startBlock
 */
async function main() {

    const factory = await hre.ethers.getContractFactory("PancakeFactory");
    const PancakeFactory = await factory.deploy("0x4cBDDaA2f48dF41aCc17434180892DB2B5ae93Cf");
    const deployedFactory = await PancakeFactory.deployed();
    const hash = await deployedFactory.INIT_CODE_PAIR_HASH()
    console.log("Factory Address", deployedFactory.address, "/n init_hash:", hash)



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
