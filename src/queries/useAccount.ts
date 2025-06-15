import { useSimpleGet } from "./useSimpleGet";

export const useAccount = (address: string) => {
  return useSimpleGet(
    `account-${address}`,
    `/account/${address}`,
    undefined // Don't auto-refetch account data
  );
};
