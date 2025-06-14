import { useSimpleGet } from "./useSimpleGet";

export const useLatestBlock = () => {
  return useSimpleGet("latestBlock", "/chain/block/latest");
};
