import BigNumber from "bignumber.js";
import { loader } from "graphql.macro";
import { request } from "graphql-request";
import { HistoricalYield } from "../../common/yield.types";
import { AaveUserQuery, AaveUserQueryVariables } from "../../generated/graphql";
import { Deposit } from "../../common/account.types";

const aaveUser = loader("./aave-user.graphql");

const graphUrl = "https://api.thegraph.com/subgraphs/name/aave/protocol-v2";

const yieldUnitDenominator = new BigNumber(10).pow(25);

const parseYield = (yieldInt: string): BigNumber => {
  return new BigNumber(yieldInt).dividedBy(yieldUnitDenominator);
};

export interface AaveUser {
  historicalYield: HistoricalYield[];
  deposits: Deposit[];
  balance: {
    token: BigNumber;
    eth: BigNumber;
    usd: BigNumber;
  };
  pricing: {
    ethPrice: BigNumber;
    usdEth: BigNumber;
    lastUpdate: number;
  };
  symbol: string;
}

let cacheUser: AaveUser | undefined;

const ethDivisor = new BigNumber(10).pow(18);

export const getAaveUser = async (
  params: AaveUserQueryVariables
): Promise<AaveUser> => {
  if (cacheUser) return cacheUser;

  const { user }: AaveUserQuery = await request(graphUrl, aaveUser, params);

  // @ts-ignore
  window.aaveUser = user;

  const firstReserve = user?.reserves?.[0];

  if (!firstReserve) throw new Error("No first reserve");

  const decimals = firstReserve.reserve.decimals;

  if (!decimals) throw new Error("No decimals in reserve");

  const tokenDivisor = new BigNumber(10).pow(decimals);
  const liquidityIndex = new BigNumber(
    firstReserve.reserve.liquidityIndex
  ).dividedBy(new BigNumber(10).pow(27));

  const tokenBalance = new BigNumber(firstReserve.scaledATokenBalance)
    .multipliedBy(liquidityIndex)
    .dividedBy(tokenDivisor);

  const ethPrice = new BigNumber(
    firstReserve.reserve.price.priceInEth
  ).dividedBy(ethDivisor);

  const usdEth = new BigNumber(
    firstReserve.reserve.price.oracle.usdPriceEth
  ).dividedBy(ethDivisor);

  cacheUser = {
    balance: {
      token: tokenBalance,
      eth: ethPrice.multipliedBy(tokenBalance),
      usd: ethPrice.dividedBy(usdEth).multipliedBy(tokenBalance),
    },

    symbol: firstReserve.reserve.symbol,

    pricing: {
      ethPrice,

      usdEth,

      lastUpdate: firstReserve.reserve.price.oracle.lastUpdateTimestamp,
    },

    deposits:
      firstReserve.depositHistory.map(
        ({ timestamp, reserve: { symbol }, amount }) => ({
          timestamp,
          symbol,
          amount,
        })
      ) ?? [],

    historicalYield:
      firstReserve.reserve.paramsHistory
        .map(({ timestamp, liquidityRate }) => ({
          timestamp,
          rate: parseYield(liquidityRate),
        }))
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(({ timestamp, rate }) => ({
          timestamp,
          rate: rate.toNumber(),
        })) ?? [],
  };

  return cacheUser;
};
