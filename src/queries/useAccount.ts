import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import { getAbciQuery } from "../http/query";
import { MASP_ADDRESS } from "../utils";
import { useChainAssetsMap } from "./useChainAssetsMap";
import { convertAbciAmount } from "../utils";

const MULTITOKEN_PREFIX = "/shell/value/#tnam1pyqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqej6juv/#";

export const useAccount = (address: string) => {
  const { data: chainAssetsMap, isLoading: assetsLoading, error: assetsError } = useChainAssetsMap();

  return useQuery({
    queryKey: [`account-${address}`, address],
    queryFn: async () => {
      // Due to a bug in the indexer, the balances from the /account/{address} endpoint for the masp account specifically
      // are sometimes wrong. Fetch the masp balances directly from the chain via abci query
      if (address === MASP_ADDRESS) {
        if (!chainAssetsMap) {
          throw new Error("Chain assets map not available");
        }

        const assetAddresses = Object.keys(chainAssetsMap);
        
        // Fetch balances for all assets in parallel
        const balancePromises = assetAddresses.map(async (tokenAddress) => {
          try {
            const path = MULTITOKEN_PREFIX + tokenAddress + "/balance/#" + MASP_ADDRESS;
            const response = await getAbciQuery(path, 0); // Using 0 as default block height
            const value = response?.result?.response?.value;
            if (!value) {
              throw new Error("No value field found in response");
            }
            const balance = convertAbciAmount(value).toString();
            return {
              tokenAddress,
              minDenomAmount: balance,
            };
          } catch (error) {
            console.warn(`Failed to fetch balance for token ${tokenAddress}:`, error);
            return {
              tokenAddress,
              minDenomAmount: "0",
            };
          }
        });

        return await Promise.all(balancePromises);
      } else {
        // Handle all other accounts in the standard way
        return get(`/account/${address}`);
      }
    },
    enabled: address !== MASP_ADDRESS || (!assetsLoading && !assetsError && !!chainAssetsMap),
  });
};
