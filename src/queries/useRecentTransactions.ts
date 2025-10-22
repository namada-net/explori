import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import type { WrapperTransaction } from "../types";

export const useRecentTransactions = (
  offset = 0,
  kind?: string | string[],
  token?: string | string[],
  refetchInterval?: number,
) => {
  const queryParams = new URLSearchParams();
  queryParams.append("offset", offset.toString());
  queryParams.append("size", "30");
  if (kind) {
    const kinds = Array.isArray(kind) ? kind : [kind];
    kinds.filter(Boolean).forEach((k) => queryParams.append("kind", k));
  }
  if (token) {
    const tokens = Array.isArray(token) ? token : [token];
    tokens.filter(Boolean).forEach((t) => queryParams.append("token", t));
  }

  const url = `/chain/wrapper/recent?${queryParams.toString()}`;
  const queryId = `recent-wrappers-${offset}-${Array.isArray(kind) ? kind.join("|") : (kind || "all")}-${Array.isArray(token) ? token.join("|") : (token || "all")}`;

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
