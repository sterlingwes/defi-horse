import { useCallback, useEffect, useState } from "react";

interface ConnectionState {
  capable: boolean;
  address: string | undefined;
  status: ConnectionStatus;
  connect: () => void;
}

export enum ConnectionStatus {
  idle,
  authorizing,
  connected,
  failed,
}

const getEthereum = (): EthereumGlobal | undefined => {
  // @ts-expect-error
  return window.ethereum;
};

interface EthereumGlobal {
  request: <R>(request: EthereumRequest) => Promise<R>;
}

interface EthereumRequest {
  method: "eth_requestAccounts";
}

export const useWallet = (): ConnectionState => {
  const [capable, setCapable] = useState<boolean>(false);
  const [address, setAddress] = useState<string>();
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.idle);

  const connect = useCallback(() => {
    setStatus(ConnectionStatus.authorizing);
    getEthereum()
      ?.request<string[]>({ method: "eth_requestAccounts" })
      .then((accounts) => {
        if (accounts?.[0]) {
          setAddress(accounts[0]);
          setStatus(ConnectionStatus.connected);
        }
      })
      .catch(() => setStatus(ConnectionStatus.failed));
  }, []);

  useEffect(() => {
    if (typeof getEthereum() !== "undefined") {
      setCapable(true);
    }
  }, []);

  return {
    capable,
    address,
    status,
    connect,
  };
};
