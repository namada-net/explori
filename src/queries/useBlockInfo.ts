import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";

export const useBlockInfo = (blockHeight: number) => {
  return useQuery({
    queryKey: ["block", blockHeight],
    queryFn: async () => {
      return get("/block/height/" + blockHeight);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
