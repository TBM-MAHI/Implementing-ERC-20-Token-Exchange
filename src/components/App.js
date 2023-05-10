import { useEffect } from "react";
import { useDispatch } from "react-redux";
import config from "../config.json";

import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange
} from "../redux-store/interactions";
const App = () => {
  const dispatch = useDispatch();
  const loadBlockchainData = async () => {
    //CONNECT TO ETHERS.js to blockchain
    const provider = loadProvider(dispatch);
    // Fetch current network's chainId (e.g. hardhat: 31337, kovan: 42)
    const chainId = await loadNetwork(provider, dispatch);

    // Fetch current account & balance from Metamask
    await loadAccount(provider, dispatch);
    // Load token smart contracts
    let configs = config[chainId];
    await loadTokens(
      [configs.MAHI.address, configs.mETH.address],
      dispatch,
      provider
    );
    // Load exchange smart contract
    await loadExchange(configs.exchange.address, dispatch, provider);
  };
  useEffect(() => {
    console.log("fired useEffect");
    function fetchData() {
      return loadBlockchainData();
    }
    fetchData();
  });
  return (
    <div>
      {/* Navbar */}

      <main className="exchange grid">
        <section className="exchange__section--left grid">
          {/* Markets */}

          {/* Balance */}

          {/* Order */}
        </section>
        <section className="exchange__section--right grid">
          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}
        </section>
      </main>

      {/* Alert */}
    </div>
  );
};

export default App;
