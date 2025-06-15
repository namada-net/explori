import type { AccountResponse } from "../types";

export const checkForNotEmptyWallet = (tx: AccountResponse) => {
  return tx.some((el) => el.minDenomAmount !== "0");
};
