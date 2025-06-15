import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import { checkForNotEmptyWallet } from "../utils/transactions";

type SearchResult = {
  blocks: string[];
  transactions: string[];
  accounts: string[];
};

export const useSearchValue = (search: string) => {
  return useQuery<SearchResult>({
    queryKey: ["search", search],
    enabled: search.length > 0,
    queryFn: async () => {
      // if the search is a valid address, query accounts and transactions
      const output: SearchResult = {
        blocks: [],
        transactions: [],
        accounts: [],
      };

      // only query blocks if the search is a number
      const isBlockNumber = /^\d+$/.test(search);
      if (isBlockNumber) {
        try {
          await get("/block/height/" + search);
          output.blocks.push(search);
          return output;
        } catch {
          return output;
        }
      }

      // not valid transaction hash or address
      if (search.length < 32) {
        return output;
      }

      try {
        const accounts = await get("/account/" + search);
        if (checkForNotEmptyWallet(accounts)) {
          output.accounts.push(search);
        }
      } catch {
        /* empty */
      }

      try {
        await get("/chain/wrapper/" + search);
        output.transactions.push(search);
      } catch {
        /* empty */
      }

      return output;
    },
  });
};
