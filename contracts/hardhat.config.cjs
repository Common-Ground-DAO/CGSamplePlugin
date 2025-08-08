require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("@typechain/hardhat");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  typechain: {
    outDir: "../app/contracts",
    target: "ethers-v6",
    alwaysGenerateOverloads: false,
    dontOverrideCompile: false
  },
  paths: {
    artifacts: "./artifacts",
  }
};
