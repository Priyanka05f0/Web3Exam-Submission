import { ethers } from "ethers";
import { TOKEN_ADDRESS, FAUCET_ADDRESS, TOKEN_ABI, FAUCET_ABI } from "./config";

// --- 1. Wallet & Provider ---
export async function getProvider() {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();
  return await provider.getSigner();
}

// --- 2. Contract Instances ---
export async function getTokenContract(signerOrProvider) {
  if (!signerOrProvider) {
      const provider = await getProvider();
      return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
  }
  return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signerOrProvider);
}

export async function getFaucetContract(signerOrProvider) {
  if (!signerOrProvider) {
      const provider = await getProvider();
      return new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, provider);
  }
  return new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signerOrProvider);
}

// --- 3. Core Actions ---
export async function connectWallet() {
  const provider = await getProvider();
  const accounts = await provider.send("eth_requestAccounts", []);
  return accounts[0];
}

export async function getBalance(address) {
  const contract = await getTokenContract();
  const balance = await contract.balanceOf(address);
  return balance.toString(); 
}

export async function requestTokens() {
  const signer = await getSigner();
  const contract = await getFaucetContract(signer);
  const tx = await contract.requestTokens();
  await tx.wait(); 
  return tx.hash;
}

export async function canClaim(address) {
  const contract = await getFaucetContract();
  return await contract.canClaim(address);
}

export async function getRemainingAllowance(address) {
  const contract = await getFaucetContract();
  const allowance = await contract.remainingAllowance(address);
  return allowance.toString();
}

export function getContractAddresses() {
  return { token: TOKEN_ADDRESS, faucet: FAUCET_ADDRESS };
}