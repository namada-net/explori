import { useSimpleGet } from "./useSimpleGet";

export const useChainParameters = () => {
  return useSimpleGet("chain-parameters", "/chain/parameters");
};
