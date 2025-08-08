import pkg from "hardhat";
const ethers = (pkg as any).ethers;

async function main() {
  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const mockToken = await MockToken.deploy("Mock Token", "MOCK", 18);
  await mockToken.waitForDeployment();
  console.log(`MockToken deployed to: ${await mockToken.getAddress()}`);
  await mockToken.mint(
    (await ethers.getSigners())[0].address,
    (10n ** 30n).toString(),
  );

  // Deploy MockLSP7
  const MockLSP7 = await ethers.getContractFactory("MockLSP7");
  const mockLSP7 = await MockLSP7.deploy(
    "Mock LSP7",
    "MLSP7",
    (await ethers.getSigners())[0].address,
    0, // lsp4TokenType: 0 = Token
    false // isNonDivisible: false = fungible
  );
  await mockLSP7.waitForDeployment();
  console.log(`MockLSP7 deployed to: ${await mockLSP7.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 