import { useQuery } from "@tanstack/react-query";
import { getFromRpc } from "../http/query";

export const useBlockResults = (blockHeight: number | null | undefined) => {
  // Validate that blockHeight is a positive number
  const isValidBlockHeight = blockHeight != null && blockHeight > 0 && Number.isInteger(blockHeight);
  
  return useQuery({
    queryKey: ["block_results", blockHeight],
    queryFn: async () => {
      if (!isValidBlockHeight) {
        throw new Error(`Invalid block height: ${blockHeight}`);
      }
      return getFromRpc("/block_results?height=" + blockHeight);
    },
    enabled: isValidBlockHeight,
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
