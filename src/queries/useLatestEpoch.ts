import { useSimpleGet } from "./useSimpleGet";

export const useLatestEpoch = () => {
  return useSimpleGet("latestEpoch", "/chain/epoch/latest");
};
