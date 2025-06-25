import { useSimpleGet } from "./useSimpleGet";

export const useVotingPower = () => {
  return useSimpleGet("tokenSupply", "/pos/voting-power");
};
