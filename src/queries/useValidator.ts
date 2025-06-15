import { useSimpleGet } from "./useSimpleGet";

export const useValidatorBonds = (address: string) => {
  return useSimpleGet("validator-bonds", `/pos/merged-bonds/${address}`);
};

export const useValidatorUnbonds = (address: string) => {
  return useSimpleGet("validator-unbonds", `/pos/merged-unbonds/${address}`);
};
