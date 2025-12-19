const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("TokenFaucet System", function () {
  
  // Fixture to deploy contracts freshly for every test
  async function deployFaucetFixture() {
    const [owner, user1, user2] = await ethers.getSigners();

    // 1. Deploy Token
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy();
    // await token.waitForDeployment(); // specific for ethers v6

    // 2. Deploy Faucet
    const Faucet = await ethers.getContractFactory("TokenFaucet");
    const faucet = await Faucet.deploy(token.target);
    // await faucet.waitForDeployment();

    // 3. Grant minting role to Faucet
    await token.setMinter(faucet.target);

    // Constants
    const FAUCET_AMOUNT = ethers.parseEther("100");
    const MAX_CLAIM = ethers.parseEther("1000");
    const COOLDOWN = 24 * 60 * 60; // 24 hours

    return { token, faucet, owner, user1, user2, FAUCET_AMOUNT, MAX_CLAIM, COOLDOWN };
  }

  // Test Case 1 & 2: Deployment and Config
  it("Should set the right owner and configuration", async function () {
    const { faucet, token, owner } = await loadFixture(deployFaucetFixture);
    expect(await faucet.token()).to.equal(token.target);
    expect(await faucet.admin()).to.equal(owner.address);
  });

  // Test Case 3: Successful Claim
  it("Should allow a user to claim tokens", async function () {
    const { faucet, token, user1, FAUCET_AMOUNT } = await loadFixture(deployFaucetFixture);
    
    await expect(faucet.connect(user1).requestTokens())
      .to.emit(faucet, "TokensClaimed")
      .withArgs(user1.address, FAUCET_AMOUNT, await time.latest() + 1);
      
    expect(await token.balanceOf(user1.address)).to.equal(FAUCET_AMOUNT);
  });

  // Test Case 4: Cooldown Enforcement
  it("Should prevent claiming before 24 hours pass", async function () {
    const { faucet, user1 } = await loadFixture(deployFaucetFixture);
    
    await faucet.connect(user1).requestTokens(); // First claim
    
    // Try claiming immediately again
    await expect(faucet.connect(user1).requestTokens())
      .to.be.revertedWith("Cooldown active");
  });

  // Test Case 5: Lifetime Limit
  it("Should enforce lifetime claim limits", async function () {
    const { faucet, user1, COOLDOWN } = await loadFixture(deployFaucetFixture);
    
    // Claim 10 times (Max limit is 1000, claim is 100)
    for (let i = 0; i < 10; i++) {
        await faucet.connect(user1).requestTokens();
        await time.increase(COOLDOWN + 1); // Fast forward time
    }

    // 11th claim should fail
    await expect(faucet.connect(user1).requestTokens())
      .to.be.revertedWith("Lifetime limit reached");
  });

  // Test Case 6 & 7: Pause Mechanism (Admin Only)
  it("Should allow admin to pause and prevent claims", async function () {
    const { faucet, user1, user2 } = await loadFixture(deployFaucetFixture);

    // Admin pauses
    await faucet.setPaused(true);
    
    // User cannot claim
    await expect(faucet.connect(user1).requestTokens())
      .to.be.revertedWith("Faucet is paused");

    // Non-admin cannot unpause
    await expect(faucet.connect(user1).setPaused(false))
      .to.be.revertedWith("Only admin");
  });

  // Test Case 10: Multiple Users
  it("Should handle multiple users independently", async function () {
    const { faucet, user1, user2 } = await loadFixture(deployFaucetFixture);
    
    await faucet.connect(user1).requestTokens();
    
    // User 2 should be able to claim immediately even if User 1 just did
    await expect(faucet.connect(user2).requestTokens()).not.to.be.reverted;
  });
});