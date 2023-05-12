import logo from "../assets/logo.png";
import Blockies from "react-blockies";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "../redux-store/interactions";
import config from "../config.json";
import eth from "../assets/eth.svg";
import { noop } from "lodash";
const Navbar = () => {
  const account = useSelector((state) => state.ProviderReducer.account);
  const connection = useSelector((state) => state.ProviderReducer.connection);
  const balance = useSelector((state) => state.ProviderReducer.balance);
  const chainId = useSelector((state) => state.ProviderReducer.chainId);
  const dispatch = useDispatch();

  const handleloadAccount = async () => {
    // Fetch current account & balance from Metamask
    await loadAccount(connection, dispatch);
  };

  const handleNetChange = async (e) => {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: e.target.value }],
    });
  };
  return (
    <div className="exchange__header grid">
      <div className="exchange__header--brand flex">
        <img src={logo} alt="logo" className="logo" />
        <h1>Dapp Token Exchange</h1>
      </div>

      <div className="exchange__header--networks flex">
        <img src={eth} alt="ETH Logo" className="Eth Logo" />
        {chainId && (
          <select
            className="networks"
            value={config[chainId] ? `0x${chainId.toString(16)}` : 0}
            onChange={handleNetChange}
          >
            <option value="0" disabled>
              Select A Network
            </option>
            <option value="0x7A69">Localhost</option>
            <option value="0x2A" disabled>
              Kovan
            </option>
            <option value="0x5">Goerli</option>
          </select>
        )}
      </div>

      <div className="exchange__header--account flex">
        <p>
          <small>My balance :</small>{" "}
          {balance ? Number(balance).toFixed(3) + "ETH" : "0 ETH"}
        </p>
              {account ? (
                  <a
                      href={config[ chainId ] ? `${config[ chainId ].explorerURL}${account}`: `#`}
            target="_blank"
            rel={"noreferrer"}
          >
            {account.slice(0, 4) + "..." + account.slice(-4)}
            <Blockies
              seed={account}
              size={10}
              scale={4}
              bgColor="#21FFEB"
              spotColor="#767F92"
              className="identicon"
            />
          </a>
        ) : (
          <button className="button" onClick={handleloadAccount}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
