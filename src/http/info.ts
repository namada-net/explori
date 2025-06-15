export const fetchLatestBlock = async () => {
  return fetch("/chain/block/latest");
};

export const fetchLatestEpoch = async () => {
  return fetch("/chain/epoch/latest");
};

export const fetchAccountDetails = async (address: string) => {
  return fetch(`/account/${address}`);
};

export const fetchAccountTransactions = async (address: string) => {
  return fetch(`/account/chain/history?addresses=${address}`);
};
