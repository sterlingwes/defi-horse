import { useEffect, useState } from "react";
import { useWallet, ConnectionStatus } from "./account/use-wallet";
import "./App.css";
import { YieldGraph } from "./common/yield-graph.component";
import { getAaveUser, AaveUser } from "./yield/aave/aave";
import { getCompoundUser, CompoundUser } from "./yield/compound/compound";

const Aave = ({ address }: { address: string }) => {
  const [aave, setAave] = useState<AaveUser>();
  useEffect(() => {
    getAaveUser({
      address,
    }).then((aave) => setAave(aave));
  }, [address]);

  return (
    <div>
      <h2>AAVE</h2>
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

const Compound = ({ address }: { address: string }) => {
  const [compound, setCompound] = useState<CompoundUser>();
  useEffect(() => {
    getCompoundUser({ address }).then((compound) => setCompound(compound));
  }, [address]);

  return (
    <div>
      <h2>Compound</h2>
      <table>
        <tbody>
          <tr>
            <td>cUSDC Balance:</td>
            <td>{compound?.balance.token.toFormat(3)}</td>
          </tr>
          <tr>
            <td>Balance in USDC:</td>
            <td>${compound?.balance.usdc.toFormat(2)}</td>
          </tr>
          <tr>
            <td>COMP Balance:</td>
            <td>{compound?.governance.token.toFormat(6)}</td>
          </tr>
        </tbody>
      </table>
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
        <>
          <Aave address={address} />
          <Compound address={address} />
        </>
      )}
    </div>
  );
}

export default App;
