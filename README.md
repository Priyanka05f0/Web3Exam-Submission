\# ERC-20 Token Faucet DApp



\## 1. Project Overview

This project is a Faucet DApp where users can request ERC-20 tokens. It includes a smart contract with a 24-hour cooldown and lifetime limits, plus a React frontend for easy interaction.



\## 2. Architecture

\* \*\*Contracts:\*\* Written in Solidity (Token.sol, TokenFaucet.sol).

\* \*\*Frontend:\*\* React + Vite + Ethers.js.

\* \*\*Deployment:\*\* Dockerized for consistent setup.



\## 3. Deployed Contracts (Localhost)

\* \*\*Token:\*\* 0x5FbDB2315678afecb367f032d93F642f64180aa3

\* \*\*Faucet:\*\* 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512



\## 4. Quick Start

```bash

cp .env.example .env

docker compose up

\# Access at http://localhost:3000



\## 5. Configuration

This project uses environment variables to manage blockchain connections.



VITE\_RPC\_URL: The endpoint for the blockchain node (e.g., http://localhost:8545 for local Hardhat Network).



VITE\_TOKEN\_ADDRESS: The address of the deployed ERC-20 Token contract.



VITE\_FAUCET\_ADDRESS: The address of the deployed Faucet contract.



These values are loaded automatically in Docker via docker-compose.yml.



\## 6. Design Decisions

Faucet Drip Amount (100 Tokens): We set the claim amount to 100 tokens to allow users enough balance for testing interactions without draining the pool too quickly.



Cooldown Period (24 Hours): A strict time-lock was implemented to prevent spamming and ensure fair distribution among all users.



Lifetime Limit (1,000 Tokens): A cap was introduced to prevent a single user from accumulating too much supply over time, encouraging rotation of test tokens.



Separation of Concerns: The Token logic (ERC-20) and Faucet logic are in separate contracts to keep the code modular and secure.



\## 7. Testing Approach

Smart Contract Testing: We used Hardhat and Chai to write automated unit tests.



Covered 10 scenarios including: Deployment, Successful Claims, Cooldown Enforcement, Lifetime Limits, and Admin Pausing.



Achieved a 100% pass rate on all test suites.



System Testing: We implemented a Docker Healthcheck using curl to ensure the frontend container is responsive and the server is running correctly before traffic is allowed.



\## 8. Security Considerations

Checks-Effects-Interactions Pattern: Used in the requestTokens function to update the user's lastClaimTime before transferring tokens, preventing reentrancy attacks.



Access Control: The pause() and setPaused() functions are restricted to the admin only, ensuring no unauthorized users can stop the service.



Solidity 0.8+: We used modern Solidity (v0.8.20) which has built-in protection against integer overflow and underflow attacks.



\## 9. Known Limitations

Local State Persistence: Since this project runs on a local Hardhat node, the blockchain state (balances and transactions) will reset if the container or node is restarted.



Browser Wallet Dependency: The application strictly requires a browser extension wallet like MetaMask; it does not support mobile wallets or direct private key entry.



Single Network Support: The current configuration is hardcoded for the local development network and would need configuration updates to work on Sepolia or Mainnet.

