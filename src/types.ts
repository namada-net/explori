export type InnerTransaction = {
  txId: string;
  kind: string;
  data: string;
  memo: string;
  exitCode: string;
};

export type AccountResponse = Array<{
  minDenomAmount: string;
  tokenAddress: string;
}>;
