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
export const MASP_ADDRESS = "tnam1pcqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzmefah";

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

// Converts a byte array to a signed BigInt in little-endian format
const bytesToSignedLittleEndianBigInt = (bytes: Uint8Array): bigint => {
  // Check if the most significant bit is set (negative number)
  const isNegative = (bytes[bytes.length - 1] & 0x80) !== 0;
  
  let value = BigInt(0);
  
  // Convert from little-endian to BigInt
  for (let i = 0; i < bytes.length; i++) {
    value += BigInt(bytes[i]) << BigInt(i * 8);
  }
  
  // If negative, convert to two's complement
  if (isNegative) {
    const maxValue = BigInt(1) << BigInt(bytes.length * 8);
    value = value - maxValue;
  }
  
  return value;
};

// Deserialize a "value" string from an Abci query if it's known to be an Amount
export const convertAbciAmount = (base64String: string): bigint => {
  if (!base64String) return BigInt(0);

  try {
    // Decode base64 to bytes
    const bytes = Uint8Array.from(atob(base64String), c => c.charCodeAt(0));
    
    // For I256 (signed 256-bit integer), we expect 32 bytes
    if (bytes.length !== 32) {
      console.error("Invalid byte length for I256 deserialization:", bytes.length);
      return BigInt(0);
    }

    // Convert to signed BigInt
    const amount = bytesToSignedLittleEndianBigInt(bytes);
    
    // Ensure the amount is non-negative (amounts shouldn't be negative)
    return amount >= 0 ? amount : BigInt(0);
    
  } catch (error) {
    console.error(`Error deserializing ABCI amount from base64 "${base64String}":`, error);
    return BigInt(0);
  }
};
