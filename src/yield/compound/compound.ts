import { loader } from "graphql.macro";
import { request } from "graphql-request";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import { compAbi } from "../../abi";
import { CompoundUserQuery } from "../../generated/graphql";

const infuraProject = process.env.REACT_APP_INFURA_PROJECT;
const base = new BigNumber(10);
const coefficient = base.pow(-18);

/**
 * get COMP that accrues along with interest, not yet claimed
 * @param address wallet address accruing COMP for supply
 */
export const getCompAllocation = async (address: string) => {
  const compoundLensContract = "0xd513d22422a3062Bd342Ae374b4b9c20E0a9a074";
  const compTokenContract = "0xc00e94Cb662C3520282E6f5717214004A7f26888";
  const comptrollerContract = "0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B";

  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      `https://mainnet.infura.io/v3/${infuraProject}`
    )
  );

  const contract = new web3.eth.Contract(compAbi, compoundLensContract);
  const compBalance = await contract.methods
    .getCompBalanceMetadataExt(compTokenContract, comptrollerContract, address)
    .call();

  const actualBalance = coefficient.multipliedBy(compBalance.allocated);
  return actualBalance;
};

export interface CompoundUser {
  balance: {
    token: BigNumber;
    usdc: BigNumber;
  };
  governance: {
    token: BigNumber;
  };
}

let cacheUser: CompoundUser | undefined;

const graphUrl =
  "https://api.thegraph.com/subgraphs/name/graphprotocol/compound-v2";
const compoundUserQuery = loader("./compound-user.graphql");

export const getCompoundUser = async ({ address }: { address: string }) => {
  if (cacheUser) return cacheUser;

  const compTokenAccrued = await getCompAllocation(address);

  const { account }: CompoundUserQuery = await request(
    graphUrl,
    compoundUserQuery,
    { id: address }
  );

  const firstToken = account?.tokens?.[0];

  const tokenBalance = new BigNumber(firstToken?.cTokenBalance);

  cacheUser = {
    balance: {
      token: tokenBalance,
      usdc: tokenBalance.multipliedBy(firstToken?.market.exchangeRate),
    },
    governance: {
      token: compTokenAccrued,
    },
  };

  return cacheUser;
};
