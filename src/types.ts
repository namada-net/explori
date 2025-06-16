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
