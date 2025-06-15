import { useSimpleGet } from "./useSimpleGet";

export const useAccountTransactions = (
  address: string,
  page = 1,
  limit = 10
) => {
  const url = `/chain/history?addresses=${address}&page=${page}&limit=${limit}`;
  const queryId = `account-transactions-${address}-${page}-${limit}`;

  return useSimpleGet(queryId, url, undefined);
};
