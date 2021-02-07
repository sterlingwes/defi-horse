import BigNumber from "bignumber.js";

export interface Deposit {
  timestamp: number;
  amount: number;
  symbol: string;
}

export interface Account {
  balance: BigNumber;
}
