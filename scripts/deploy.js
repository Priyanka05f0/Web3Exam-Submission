const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 1. Deploy Token
  const Token = await hre.ethers.getContractFactory("Token");
  const token = await Token.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed to:", tokenAddress);

  // 2. Deploy Faucet
  const Faucet = await hre.ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(tokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("Faucet deployed to:", faucetAddress);

  // 3. Grant minting role to Faucet
  console.log("Granting minter role to faucet...");
  const tx = await token.setMinter(faucetAddress);
  await tx.wait();
  console.log("Minter role granted.");

  // 4. Save deployment addresses for Frontend
  // We save this to frontend/src/utils/contracts.js as required
  const contractsFileContent = `
export const TOKEN_ADDRESS = "${tokenAddress}";
export const FAUCET_ADDRESS = "${faucetAddress}";
export const TOKEN_ABI = ${JSON.stringify(Token.interface.format("json"))};
export const FAUCET_ABI = ${JSON.stringify(Faucet.interface.format("json"))};
  `;

  // Ensure directory exists
  const outputDir = path.join(__dirname, "../frontend/src/utils");
  if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(outputDir, "contracts.js"),
    contractsFileContent.trim()
  );

  console.log("Contract addresses and ABIs saved to frontend/src/utils/contracts.js");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});