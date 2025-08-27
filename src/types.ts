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

export type ProposalResponse = {
  id: string;
  content: string;
  type: string;
  tallyType: string;
  data: string;
  author: string;
  startEpoch: string;
  endEpoch: string;
  activationEpoch: string;
  startTime: string;
  endTime: string;
  currentTime: string;
  activationTime: string;
  status: string;
  yayVotes: string;
  nayVotes: string;
  abstainVotes: string;
};

export type ProposalContent = {
  title: string;
  authors: string;
  "discussions-to": string;
  created: string;
  license: string;
  abstract: string;
  motivation: string;
  details: string;
  requires: string;
}

export type RegistryAsset = {
  description: string;
  extended_description: string;
  denom_units: RegistryDenomUnit[];
  type_asset: string;
  base: string;
  name: string;
  display: string;
  symbol: string;
  logo_URIs: {
    png?: string;
    svg?: string;
  };
  images: {
    image_sync?: string;
    png?: string;
    svg?: string;
    theme?: {
      primary_color_hex?: string;
      background_color_hex?: string;
      circle?: string;
      dark_mode?: string;
      monochrome?: boolean;
    };
  }[];
  coingecko_id: string;
  keywords: string[];
  socials: {
    website?: string;
    twitter?: string;
    telegram?: string;
    discord?: string;
    github?: string;
    medium?: string;
    reddit?: string;
  }
}

export type RegistryDenomUnit = {
  denom: string;
  exponent: number;
}

export type InnerTransactionWithHeight = {
  txId: string;
  kind: string;
  data: string;
  memo: string;
  exitCode: string;
  blockHeight: number;
};

export type Pagination = {
  totalItems: number;
  totalPages: number;
  perPage: number;
  currentPage: number;
};

export type RecentTransactionsResponse = {
  results: InnerTransactionWithHeight[];
  pagination: Pagination;
};
