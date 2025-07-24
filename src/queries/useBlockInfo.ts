import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";

export const useBlockInfo = (blockHeight: number | null | undefined) => {
  // Validate that blockHeight is a positive number
  const isValidBlockHeight = blockHeight != null && blockHeight > 0 && Number.isInteger(blockHeight);
  
  return useQuery({
    queryKey: ["block", blockHeight],
    queryFn: async () => {
      if (!isValidBlockHeight) {
        throw new Error(`Invalid block height: ${blockHeight}`);
      }
      return get("/block/height/" + blockHeight);
    },
    enabled: isValidBlockHeight,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
