import { useEffect, useState } from "react";
import { useWallet, ConnectionStatus } from "./account/use-wallet";
import "./App.css";
import { YieldGraph } from "./common/yield-graph.component";
import { getAaveUser, AaveUser } from "./yield/aave/aave";

const Aave = ({ address }: { address: string }) => {
  const [aave, setAave] = useState<AaveUser>();
  useEffect(() => {
    getAaveUser({
      address,
    }).then((aave) => setAave(aave));
  }, [address]);

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>aUSDC Balance:</td>
            <td>{aave?.balance.token.toFormat(3)}</td>
          </tr>
          <tr>
            <td>Balance in USD:</td>
            <td>${aave?.balance.usd.toFormat(2)}</td>
          </tr>
        </tbody>
      </table>
      {aave?.historicalYield && (
        <YieldGraph chartData={aave?.historicalYield} />
      )}
    </div>
  );
};

function App() {
  const { connect, status, address, capable } = useWallet();

  if (!capable) {
    return <div>Sorry, you're not on Ethereum.</div>;
  }

  return (
    <div className="App">
      {status === ConnectionStatus.idle && (
        <button onClick={connect}>Connect Wallet</button>
      )}
      {status === ConnectionStatus.connected && address && (
        <Aave address={address} />
      )}
    </div>
  );
}

export default App;
