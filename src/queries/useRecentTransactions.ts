import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import type { WrapperTransaction } from "../types";

export const useRecentTransactions = (
  offset = 0,
  kind?: string,
  token?: string,
  refetchInterval?: number,
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("offset", offset.toString());
  queryParams.append("size", "30");
  if (kind) {
    queryParams.append("kind", kind);
  }
  if (token) {
    queryParams.append("token", token);
  }

  const url = `/chain/wrapper/recent?${queryParams.toString()}`;
  const queryId = `recent-wrappers-${offset}-${kind || "all"}-${token || "all"}`;

  return useQuery<WrapperTransaction[]>({
    queryKey: [queryId, url],
    queryFn: async () => {
      return get(url);
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: refetchInterval ?? false, // Disable automatic refetching
  });
};
