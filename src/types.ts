export type InnerTransaction = {
  txId: string;
  kind: string;
  data: string;
  memo: string;
  exitCode: string;
};

export type Validator = {
  address: string;
  votingPower: string;
  maxCommission: string;
  commission: string;
  state: string;
  name: string;
  email: string;
  website: string;
  description: string;
  discordHandle: string;
  avatar: string;
  validatorId: string;
  rank: number;
};

export type AccountResponse = Array<{
  minDenomAmount: string;
  tokenAddress: string;
}>;

export type TransactionSource = {
  amount: string;
  owner: string;
  token: string;
  type: string;
};

export type TransactionTarget = {
  amount: string;
  owner: string;
  token: string;
  type: string;
};

// RPC-related types
export type Balance = Record<string, string>;

export type DelegationTotals = Record<string, string>;

export type StakingTotals = {
  owner: string;
  totalBonded: string;
  totalUnbonded: string;
  totalWithdrawable: string;
};

export type StakingPositions = {
  owner: string;
  bonds: Array<{
    validator: string;
    amount: string;
    startEpoch: bigint;
  }>;
  unbonds: Array<{
    validator: string;
    amount: string;
    withdrawEpoch: bigint;
  }>;
};

export type GasCosts = Record<string, string>;

export type RpcChainConfig = {
  rpcUrl: string;
  chainId: string;
  maspIndexerUrl?: string;
};
