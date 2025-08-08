const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("LSP7Vesting", function () {
  let vesting;
  let token;
  let owner;
  let beneficiary;
  let other;
  const amount = ethers.parseUnits("1000", 18);
  const duration = 60 * 60 * 24 * 30; // 30 days
  let startTimestamp;
  let baseTime;

  beforeEach(async function () {
    [owner, beneficiary, other] = await ethers.getSigners();
    // Get the current block timestamp as baseTime
    const blockNum = await ethers.provider.getBlockNumber();
    const block = await ethers.provider.getBlock(blockNum);
    baseTime = block.timestamp;
    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockToken");
    token = await MockToken.deploy("Test Token", "TST", 18);
    await token.waitForDeployment();
    // Deploy vesting contract
    startTimestamp = baseTime + 10; // 10 seconds in the future
    const LSP7Vesting = await ethers.getContractFactory("LSP7Vesting");
    vesting = await LSP7Vesting.deploy(beneficiary.address, startTimestamp, duration);
    await vesting.waitForDeployment();
    // Fund the vesting contract
    await token.mint(await vesting.getAddress(), amount);
  });

  it("should set the correct beneficiary", async function () {
    expect(await vesting.beneficiary()).to.equal(beneficiary.address);
  });

  it("should have zero released initially", async function () {
    expect(await vesting["released(address)"](await token.getAddress())).to.equal(0);
  });

  it("should not release tokens before start", async function () {
    // Set block time to just before vesting start
    await ethers.provider.send("evm_setNextBlockTimestamp", [startTimestamp - 1]);
    await ethers.provider.send("evm_mine");
    await expect(vesting["release(address)"](await token.getAddress())).to.not.be.reverted;
    expect(await token.balanceOf(beneficiary.address)).to.be.closeTo(0, 20000000000000000n);
  });

  it("should release tokens linearly over time", async function () {
    // Move time to halfway through vesting
    await ethers.provider.send("evm_increaseTime", [Math.floor(duration / 2) + 1]);
    await ethers.provider.send("evm_mine");
    await vesting["release(address)"](await token.getAddress());
    const half = await token.balanceOf(beneficiary.address);
    expect(half).to.be.closeTo(amount / 2n, 20000000000000000n); // within 0.02 token
    // Move to end
    await ethers.provider.send("evm_increaseTime", [Math.floor(duration / 2) + 1]);
    await ethers.provider.send("evm_mine");
    await vesting["release(address)"](await token.getAddress());
    expect(await token.balanceOf(beneficiary.address)).to.be.closeTo(amount, 20000000000000000n);
  });

  it("should not allow non-beneficiary to release, but anyone can call", async function () {
    await ethers.provider.send("evm_increaseTime", [duration + 2]);
    await ethers.provider.send("evm_mine");
    await expect(vesting.connect(other)["release(address)"](await token.getAddress())).to.not.be.reverted;
    expect(await token.balanceOf(beneficiary.address)).to.be.closeTo(amount, 20000000000000000n);
  });

  it("should not release more than available", async function () {
    await ethers.provider.send("evm_increaseTime", [duration + 3]);
    await ethers.provider.send("evm_mine");
    await vesting["release(address)"](await token.getAddress());
    const bal = await token.balanceOf(beneficiary.address);
    await expect(vesting["release(address)"](await token.getAddress())).to.not.be.reverted;
    expect(await token.balanceOf(beneficiary.address)).to.be.closeTo(bal, 20000000000000000n);
  });
}); 