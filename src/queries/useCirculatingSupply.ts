import { useSimpleGet } from "./useSimpleGet";

export const useCirculatingSupply = () => {
  return useSimpleGet("circulatingSupply", "/chain/circulating-supply");
};
