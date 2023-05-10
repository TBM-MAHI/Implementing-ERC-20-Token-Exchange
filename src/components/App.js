import "../App.css";
import { useEffect } from "react";
import { ethers } from "ethers";
import { TOKEN_ABI } from "../ABI/token.ABI";
import config from '../config.json';

const App = () => {
  useEffect(() => {
    console.log('fired useEffect')
    function fetchData() {
      return loadBlockchainData();
    }
    fetchData();
  }, []);

  const loadBlockchainData = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log(accounts);
    //CONNECT TO ETHERS.js to blockchain
    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    console.log(chainId);

    //Tokens smart contrac
    const MAHI_token = new ethers.Contract(
      config[chainId].MAHI.address,
      TOKEN_ABI,
      provider
    );
   console.log(MAHI_token.address)
    let symbol = await MAHI_token.symbol();
    console.log(symbol);
  };
 

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
