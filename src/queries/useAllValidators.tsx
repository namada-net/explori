import { useSimpleGet } from "./useSimpleGet";

export const useAllValidators = () => {
  return useSimpleGet("all-validators", `/pos/validator/all`);
};
