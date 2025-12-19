import React, { useState } from 'react';
import { connectWallet, getBalance, requestTokens, canClaim, getRemainingAllowance } from './utils/contracts';
import './utils/eval'; 

function App() {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [isEligible, setIsEligible] = useState(false);
  const [msg, setMsg] = useState("");

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setAccount(addr);
      refresh(addr);
    } catch (e) { setMsg(e.message); }
  };

  const refresh = async (addr) => {
    setBalance(await getBalance(addr));
    setIsEligible(await canClaim(addr));
  };

  const handleClaim = async () => {
    setMsg("Claiming...");
    try {
      await requestTokens();
      setMsg("Success! Tokens claimed.");
      refresh(account);
    } catch (e) { setMsg("Error: " + e.message); }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Token Faucet</h1>
      <button onClick={handleConnect}>{account ? "Connected: " + account : "Connect Wallet"}</button>
      {account && (
        <div>
          <p>Balance: {balance}</p>
          <p>{isEligible ? "Ready to Claim" : "Cooldown Active"}</p>
          <button onClick={handleClaim} disabled={!isEligible}>Claim Tokens</button>
        </div>
      )}
      <p>{msg}</p>
    </div>
  );
}

export default App;