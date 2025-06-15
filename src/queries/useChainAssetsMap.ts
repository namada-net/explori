import { useMemo } from "react";
import { useChainTokens } from "./useChainTokens";
import namadaAssets from "@namada/chain-registry/namada/assetlist.json";
import { useChainParameters } from "./useChainParameters";

type Address = string;
type Asset = {
  address?: string;
  denom?: string;
  symbol?: string;
  name?: string;
};

type NativeToken = {
  address: string;
};

type IbcToken = {
  address: string;
};

const findAssetByToken = (
  token: NativeToken | IbcToken,
  assets: Asset[]
): Asset | undefined => {
  return assets.find((asset) => asset.address === token.address);
};

export const useChainAssetsMap = () => {
  const chainTokensQuery = useChainTokens();
  const { data: chainParameters } = useChainParameters();
  const chainAssetsMap = useMemo(() => {
    const assets = namadaAssets.assets as Asset[];
    const chainAssetsMap: Record<Address, Asset | undefined> = {};

    if (chainParameters?.nativeTokenAddress) {
      // the first asset is the native token asset
      chainAssetsMap[chainParameters.nativeTokenAddress] = assets[0];
    }

    chainTokensQuery.data?.forEach((token: NativeToken | IbcToken) => {
      const asset = findAssetByToken(token, assets);
      if (asset) {
        chainAssetsMap[token.address] = asset;
      }
    });

    return chainAssetsMap;
  }, [chainParameters?.nativeTokenAddress, chainTokensQuery.data]);

  return {
    data: chainAssetsMap,
    isLoading: chainTokensQuery.isLoading,
    error: chainTokensQuery.error,
  };
};
