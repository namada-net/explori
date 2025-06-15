import type { Asset, AssetDenomUnit } from "@chain-registry/types";
import BigNumber from "bignumber.js";

export const NAMADA_ADDRESS = "tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7";

export const shortenHashOrAddress = (hash: string, length = 10) => {
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
};
const findDisplayUnit = (asset: Asset): AssetDenomUnit | undefined => {
  const { display, denom_units } = asset;
  return denom_units.find((unit) => unit.denom === display);
};

export const toDisplayAmount = (
  asset: Asset,
  baseAmount: BigNumber
): BigNumber => {
  const displayUnit = findDisplayUnit(asset);
  if (!displayUnit) {
    return baseAmount;
  }

  return baseAmount.shiftedBy(-displayUnit.exponent);
};
