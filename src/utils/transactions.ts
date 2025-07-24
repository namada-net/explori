import type { AccountResponse } from "../types";

export const checkForNotEmptyWallet = (tx: AccountResponse) => {
  return tx.some((el) => el.minDenomAmount !== "0");
};

export function decodeHexAscii(hex: string): string {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex string");
  }

  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  }

  return new TextDecoder().decode(bytes);
};