import { ethers } from "ethers";
import { TOKEN_ABI } from "../ABI/token.ABI";
import { EXCHANGE_ABI } from "../ABI/exchange.ABI";

import createDispatchAction from "./utility/createDispatch";

export const loadProvider = (dispatch) => {
  // A Web3Provider wraps a standard Web3 provider, which is
  // what MetaMask injects as window.ethereum into each page
  const connection = new ethers.providers.Web3Provider(window.ethereum);
  dispatch(createDispatchAction("PROVIDER_LOADED", { connection }));
  return connection;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(createDispatchAction("NETWORK_LOADED", { chainId }));
  return chainId;
};

export const loadAccount = async ( provider,dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
    dispatch(createDispatchAction("ACCOUNT_LOADED", { account }));
    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    dispatch(createDispatchAction("ACCOUNT_BALANCE_LOADED", { balance }));
 
};
export const loadTokens = async (addresses, dispatch, provider) => {
  let tokenContr, symbol;

  tokenContr = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
  symbol = await tokenContr.symbol();
  dispatch(createDispatchAction("TOKEN_1_LOADED", { tokenContr, symbol }));

  tokenContr = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
  symbol = await tokenContr.symbol();
  dispatch(createDispatchAction("TOKEN_2_LOADED", { tokenContr, symbol }));
  return tokenContr;
};
export const loadExchange = async (address, dispatch, provider) => {
  let exchangeContract, exchangeAddress;

  exchangeContract = new ethers.Contract(address, EXCHANGE_ABI, provider);
  exchangeAddress = exchangeContract.address;
  dispatch(createDispatchAction("EXCHANGE_LOADED", { exchangeAddress,exchangeContract }));
  return exchangeContract;
};
