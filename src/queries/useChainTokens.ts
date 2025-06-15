import { useSimpleGet } from "./useSimpleGet";

export const useChainTokens = () => {
  return useSimpleGet("chain-tokens", "/chain/token", undefined);
};
