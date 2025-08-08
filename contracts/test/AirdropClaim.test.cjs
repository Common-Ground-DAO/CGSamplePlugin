const { ethers } = require("hardhat");
const { expect } = require("chai");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");

describe("AirdropClaim", function () {
  let airdropClaim;
  let token;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let merkleTree;
  let merkleRoot;
  
  const amount1 = ethers.parseUnits("100", 18);
  const amount2 = ethers.parseUnits("200", 18);
  
  before(async function () {
    // Get signers
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    
    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockToken");
    token = await MockToken.deploy("Test Token", "TST", 18);
    await token.waitForDeployment();
    
    // Create merkle tree
    const values = [
      [addr1.address, amount1.toString()],
      [addr2.address, amount2.toString()]
    ];
    
    merkleTree = StandardMerkleTree.of(values, ["address", "uint256"]);
    merkleRoot = merkleTree.root;
    
    // Deploy AirdropClaim contract
    const AirdropClaim = await ethers.getContractFactory("AirdropClaim");
    airdropClaim = await AirdropClaim.deploy(await token.getAddress(), merkleRoot);
    await airdropClaim.waitForDeployment();
    
    // Transfer tokens to the airdrop contract
    const totalAirdrop = amount1 + amount2;
    await token.mint(await airdropClaim.getAddress(), totalAirdrop);
  });
  
  it("should set the correct merkle root", async function () {
    expect(await airdropClaim.merkleRoot()).to.equal(merkleRoot);
  });
  
  it("should set the correct token address", async function () {
    expect(await airdropClaim.token()).to.equal(await token.getAddress());
  });
  
  it("should allow eligible address to claim tokens with valid proof", async function () {
    // Get proof for addr1
    const index1 = 0;
    const proof1 = merkleTree.getProof(index1);
    
    // Initial state
    expect(await airdropClaim.hasClaimed(addr1.address, amount1)).to.be.false;
    const initialBalance = await token.balanceOf(addr1.address);
    
    // Claim tokens
    await airdropClaim.connect(addr1).claimERC20(amount1, proof1);
    
    // Check state after claim
    expect(await airdropClaim.hasClaimed(addr1.address, amount1)).to.be.true;
    expect(await token.balanceOf(addr1.address)).to.equal(initialBalance + amount1);
  });
  
  it("should prevent claiming twice", async function () {
    // Get proof for addr1
    const index1 = 0;
    const proof1 = merkleTree.getProof(index1);
    
    // Try to claim again
    await expect(
      airdropClaim.connect(addr1).claimERC20(amount1, proof1)
    ).to.be.revertedWith("Already claimed");
  });
  
  it("should prevent claiming with invalid proof", async function () {
    // Get proof for addr2
    const index2 = 1;
    const proof2 = merkleTree.getProof(index2);
    
    // Try to claim with wrong amount
    await expect(
      airdropClaim.connect(addr2).claimERC20(amount1, proof2)
    ).to.be.revertedWith("Invalid proof");
  });
  
  it("should prevent non-eligible address from claiming", async function () {
    // Get proof for addr1 but try to use it with addr3
    const index1 = 0;
    const proof1 = merkleTree.getProof(index1);
    
    await expect(
      airdropClaim.connect(addr3).claimERC20(amount1, proof1)
    ).to.be.revertedWith("Invalid proof");
  });
  
  it("should allow owner to recover funds", async function () {
    // Transfer some extra tokens to the contract
    const extraAmount = ethers.parseUnits("50", 18);
    await token.mint(await airdropClaim.getAddress(), extraAmount);
    
    const initialBalance = await token.balanceOf(owner.address);
    const contractBalance = await token.balanceOf(await airdropClaim.getAddress());
    
    // Recover funds
    await airdropClaim.recoverERC20(await token.getAddress());
    
    // Check balances
    expect(await token.balanceOf(owner.address)).to.equal(initialBalance + contractBalance);
    expect(await token.balanceOf(await airdropClaim.getAddress())).to.equal(0);
  });
  
  it("should prevent non-owner from recovering funds", async function () {
    await expect(
      airdropClaim.connect(addr1).recoverERC20(await token.getAddress())
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
}); 