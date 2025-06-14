import { useSimpleGet } from "./useSimpleGet";

export const useTokenSupply = () => {
  return useSimpleGet("tokenSupply", "/chain/token-supply");
};
