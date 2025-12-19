import { 
  connectWallet, 
  requestTokens, 
  getBalance, 
  canClaim, 
  getRemainingAllowance,
  getContractAddresses 
} from "./contracts";

window._EVAL_ = {
  connectWallet,
  requestTokens,
  getBalance,
  canClaim,
  getRemainingAllowance,
  getContractAddresses
};