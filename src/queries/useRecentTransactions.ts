import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import type { RecentTransactionsResponse } from "../types";

export const useRecentTransactions = (
  page = 1,
  kind?: string,
  token?: string
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("page", page.toString());
  if (kind) {
    queryParams.append("kind", kind);
  }
  if (token) {
    queryParams.append("token", token);
  }

  const url = `/chain/recent-inner?${queryParams.toString()}`;
  const queryId = `recent-transactions-${page}-${kind || "all"}-${token || "all"}`;

  return useQuery<RecentTransactionsResponse>({
    queryKey: [queryId, url],
    queryFn: async () => {
      return get(url);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: false, // Disable automatic refetching
  });
};
