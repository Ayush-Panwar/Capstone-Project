import { useEffect } from "react";
import config from "../config.json";
import "../App.css";
import { useDispatch } from "react-redux";
import {
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange,
} from "../store/interactions";

function App() {
  const dispatch = useDispatch();
  const localBlockchainData = async () => {
    //Connect ethers to blockchain
    const provider = loadProvider(dispatch);

    //Fetch current network's chainId (e.g. hardhat:31337,kovan:42)
    const chainId = await loadNetwork(provider, dispatch);

    //Fetch current account & balance from Metamask
    const account = await loadAccount(provider, dispatch);

    //Loadt token smart contracts
    const DApp = config[chainId].DApp;
    const mETH = config[chainId].mETH;
    await loadTokens(provider, [DApp.address, mETH.address], dispatch);

    //Load exchange smart Contract
    const exchangeConfig = config[chainId].exchange;
    const exchange = await loadExchange(
      provider,
      exchangeConfig.address,
      dispatch
    );
  };

  useEffect(() => {
    localBlockchainData();
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
}

export default App;
