import type { Asset, AssetDenomUnit } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { fromUnixTime, format } from "date-fns";

export const camelCaseToTitleCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
};

export const NAMADA_ADDRESS = "tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7";
export const PGF_ADDRESS = "tnam1pgqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkhgajr";

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

export const formatNumberWithCommas = (num: number | BigNumber): string => {
  const numericValue = typeof num === 'number' ? num :
    (num && typeof num.toNumber === 'function') ? num.toNumber() : Number(num);
  return numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

export const formatNumberWithCommasAndDecimals = (num: number | BigNumber, maxDecimals: number = 6): string => {
  const numericValue = typeof num === 'number' ? num :
    (num && typeof num.toNumber === 'function') ? num.toNumber() : Number(num);

  // Format with up to maxDecimals decimal places, but remove trailing zeros
  const formatted = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });

  return formatted;
};

const getMagnitudeSuffix = (num: number): string => {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)} B`;
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)} M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)} K`;
  }
  return "";
};

export const toDisplayAmountFancy = (
  asset: Asset,
  baseAmount: BigNumber,
): string => {
  const displayAmount = toDisplayAmount(asset, baseAmount);
  const numericValue = displayAmount.toNumber();

  const formattedWithCommas = numericValue.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const magnitudeSuffix = getMagnitudeSuffix(numericValue);

  if (magnitudeSuffix) {
    return `${formattedWithCommas} (${magnitudeSuffix})`;
  }

  return formattedWithCommas;
};
