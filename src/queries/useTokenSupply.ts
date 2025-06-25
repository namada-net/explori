import { useSimpleGet } from "./useSimpleGet";

export const useTokenSupply = (address: string) => {
  return useSimpleGet("tokenSupply", `/chain/token-supply?address=${address}`);
};
