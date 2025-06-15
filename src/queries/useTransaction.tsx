import { get } from "../http/query";
import { useQuery } from "@tanstack/react-query";

export const useTransaction = (hash: string) => {
  return useQuery({
    queryKey: ["transactions", hash],
    queryFn: async () => {
      return get("/chain/wrapper/" + hash);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
