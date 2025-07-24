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

export type Bond = {
  minDenomAmount: string;
  validator: Validator;
  status: string;
  startEpoch: string;
};

export type MergedBond = {
  minDenomAmount: string;
  validator: Validator;
  redelegationInfo: {
    earliestRedelegationEpoch: string;
    earliestRedelegationTime: string;
  };
};

// MergeUnbond has the same structure
export type Unbond = {
  minDenomAmount: string;
  validator: Validator;
  withdrawEpoch: string;
  withdrawTime: string;
  canWithdraw: boolean;
};
