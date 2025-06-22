import type { Asset, AssetDenomUnit } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { fromUnixTime, format } from "date-fns";

export const camelCaseToTitleCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
};

export const NAMADA_ADDRESS = "tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7";

export const shortenHashOrAddress = (hash: string | null, length = 10) => {
  if (!hash) return "-";
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};
const findDisplayUnit = (asset: Asset): AssetDenomUnit | undefined => {
  const { display, denom_units } = asset;
  return denom_units.find((unit) => unit.denom === display);
};

export const toDisplayAmount = (
  asset: Asset,
  baseAmount: BigNumber,
): BigNumber => {
  const displayUnit = findDisplayUnit(asset);
  if (!displayUnit) {
    return baseAmount;
  }

  return baseAmount.shiftedBy(-displayUnit.exponent);
};

export const formatTimestamp = (timestamp: number): string => {
  const time = fromUnixTime(timestamp);
  return format(time, "PPpp");
};
