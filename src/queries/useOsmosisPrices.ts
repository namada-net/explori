import { useQuery } from "@tanstack/react-query";
import { getUrlJson } from "../http/query";
import type { RegistryAsset } from "../types";
import { useChainAssetsMap } from "./useChainAssetsMap";

const COSMOS_REGISTRY__BASE_URL = "https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master"
const OSMOSIS_ASSET_JSON_URL = COSMOS_REGISTRY__BASE_URL + "/osmosis/assetlist.json"
const PRICE_API_URL = "https://sqs.osmosis.zone/tokens/prices"

export const useOsmosisAssets = () => { 
  return useQuery({
    queryKey: ["osmosis-assets"],
    queryFn: async (): Promise<RegistryAsset[]> => {
      try {
        const assetJson = await getUrlJson(OSMOSIS_ASSET_JSON_URL);
        if (!assetJson || !Array.isArray(assetJson.assets)) {
          throw new Error("Invalid response format: expected assets array");
        }
        return assetJson.assets as RegistryAsset[];
      } catch (error) {
        throw new Error(`Failed to fetch Osmosis assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useOsmosisPrices = (refreshSecs: number = 30) => {
  const namadaAssetsMapQuery = useChainAssetsMap();
  const osmosisAssetsQuery = useOsmosisAssets();

  return useQuery({
    queryKey: ["assets-with-prices"],
    queryFn: async () => {
      // Early validation - if dependencies aren't ready, don't proceed
      if (!namadaAssetsMapQuery.data || !osmosisAssetsQuery.data) {
        throw new Error("Asset data not available");
      }

      const namadaAssetsMap = namadaAssetsMapQuery.data;
      const osmosisAssets = osmosisAssetsQuery.data;

      // Find USDC base from osmosis assets
      const usdcAsset = osmosisAssets.find(asset => asset.coingecko_id === "usd-coin");
      if (!usdcAsset) {
        throw new Error("USDC asset not found in Osmosis assets");
      }
      const usdcBase = usdcAsset.base;

      // Convert namada assets map to array and map to their corresponding Osmosis bases
      const namadaAssetsArray = Object.values(namadaAssetsMap).filter((asset): asset is NonNullable<typeof asset> => asset !== undefined);
      const assetBases = namadaAssetsArray
        .map(asset => {
          const osmosisAsset = osmosisAssets.find(osmosisAsset => 
            osmosisAsset.symbol === asset.symbol
          );
          return osmosisAsset?.base;
        })
        .filter((base): base is string => base !== undefined);

      // Early validation - if no asset bases found, don't make the API call
      if (assetBases.length === 0) {
        throw new Error("No matching asset bases found for price query");
      }

      const queryString = assetBases.join(',');

      try {
        const pricesJson = await getUrlJson(`${PRICE_API_URL}?base=${queryString}`);
        
        // Map assets with their prices
        const prices = namadaAssetsArray.map(asset => {
          const osmosisAsset = osmosisAssets.find(osmosisAsset => 
            osmosisAsset.symbol === asset.symbol
          );
          
          if (!osmosisAsset) {
            return {
              address: asset.address,
              symbol: asset.symbol,
              priceUsdc: null
            };
          }

          const priceEntry = pricesJson[osmosisAsset.base];

          const priceUsdc = priceEntry?.[usdcBase] || null;

          return {
            address: asset.address,
            symbol: asset.symbol,
            priceUsdc
          };
        });

        return prices;
      } catch (error) {
        throw new Error(`Failed to fetch prices: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    enabled: !namadaAssetsMapQuery.isLoading && osmosisAssetsQuery.isSuccess && 
             !!namadaAssetsMapQuery.data && !!osmosisAssetsQuery.data,
    staleTime: refreshSecs * 1000,
    gcTime: 300 * 1000, // 5 minutes
    refetchInterval: refreshSecs * 1000, // Refetch every 30s by default
  });
};
