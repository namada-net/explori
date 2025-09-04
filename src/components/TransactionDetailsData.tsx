import type { Asset } from "@chain-registry/types";
import { VStack, HStack, Text, Box, Image } from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { useAllValidators } from "../queries/useAllValidators";
import { accountUrl, validatorUrl } from "../routes";
import type { TransactionSource, TransactionTarget, Validator } from "../types";
import { shortenHashOrAddress, toDisplayAmount, NAMADA_ADDRESS, formatNumberWithCommasAndDecimals } from "../utils";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { PageLink } from "./PageLink";

const formatAmount = (value: string, asset?: Asset) => {
  if (asset) {
    const amount = toDisplayAmount(asset as any, BigNumber(value));
    return (
      <span>
        {formatNumberWithCommasAndDecimals(amount)} {asset.symbol}
      </span>
    );
  }
  return <span>{formatNumberWithCommasAndDecimals(parseFloat(value))}</span>;
};

type WrapperTxContext = {
  kind?: string;
  feePayer?: string;
  amountPerGasUnit?: string;
  gasLimit?: string;
  feeToken?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const createValueMap = (wrapperContext?: WrapperTxContext): Record<string, Function | undefined> => {
  const { data: chainAssetsMap } = useChainAssetsMap();
  const { data: validators } = useAllValidators();

  return {
    validator: (address: string) => {
      const validator = validators?.find((v: Validator) => v.address === address);
      return (
        <PageLink to={validatorUrl(address)}>
          <HStack gap={2} align="center">
            <Box
              width="20px"
              height="20px"
              borderRadius="full"
              overflow="hidden"
              bg="gray.600"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              {validator?.avatar ? (
                <Image
                  src={validator.avatar}
                  alt={validator.name || "Validator"}
                  width="20px"
                  height="20px"
                  objectFit="cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <Text fontSize="xs" color="gray.300" fontWeight="medium">
                  {(validator?.name || "U")[0].toUpperCase()}
                </Text>
              )}
            </Box>
            <Text>
              {validator?.name || shortenHashOrAddress(address)}
            </Text>
          </HStack>
        </PageLink>
      );
    },
    source: (address: string) => (
      <PageLink to={accountUrl(address)}>
        {shortenHashOrAddress(address)}
      </PageLink>
    ),
    amount: (value: string, asset?: Asset) => {
      // For bond/unbond transactions, amounts are always in NAM and need decimal conversion
      const isBondTransaction = wrapperContext?.kind === "bond" || wrapperContext?.kind === "unbond";

      if (isBondTransaction) {
        const namAsset = chainAssetsMap[NAMADA_ADDRESS];
        if (namAsset) {
          return formatAmount(value, namAsset as any);
        }
      }

      // For other transactions, use the provided asset or fallback to raw value
      return formatAmount(value, asset);
    },
    owner: (address: string) => (
      <PageLink to={accountUrl(address)}>
        {shortenHashOrAddress(address)}
      </PageLink>
    ),
    token: (value: string) => {
      return <Hash hash={value} enableCopy={true} />;
    },
    data: (value: any) => {
      const isIbcTransfer = wrapperContext?.kind === "ibcMsgTransfer";

      if (isIbcTransfer && typeof value === "string") {
        // For IBC transfers, display data as truncated hash with copy functionality
        return <Hash hash={value} enableCopy={true} />;
      }

      // For other transaction types, fall back to regular display
      if (typeof value === "string") {
        return <span>{value}</span>;
      }

      return <>{JSON.stringify(value)}</>;
    },
    sources: (array: TransactionSource[]) => (
      <VStack align="start" gap={1}>
        {array.map((source, index) => {
          const { owner, amount, token, type, ...rest } = source;
          return (
            <VStack key={index} align="start" gap={1}>
              <HStack gap={2} align="center" minW="100%">
                <Box minW="200px">
                  <PageLink to={accountUrl(owner)}>
                    {shortenHashOrAddress(owner)}
                  </PageLink>
                </Box>
                <Text color="gray.400">•</Text>
                <Box>
                  {formatAmount(amount, chainAssetsMap[token] as any)}
                </Box>
              </HStack>
              {Object.keys(rest).length > 0 && (
                <TransactionDetailsData details={rest} wrapperContext={wrapperContext} />
              )}
            </VStack>
          );
        })}
      </VStack>
    ),
    targets: (array: TransactionTarget[]) => {
      const isUnshieldingTransfer = wrapperContext?.kind === "unshieldingTransfer";

      return (
        <VStack align="start" gap={1}>
          {array.map((target, index) => {
            const { owner, amount, token, type, ...rest } = target;

            // Check if this target matches the fee payment for unshielding transfers
            let isFeePayment = false;
            if (isUnshieldingTransfer && wrapperContext) {
              const matchesFeePayer = owner === wrapperContext.feePayer;
              const matchesFeeToken = token === wrapperContext.feeToken;

              console.log('Checking fee payment for target:', {
                index,
                owner,
                feePayer: wrapperContext.feePayer,
                matchesFeePayer,
                token,
                feeToken: wrapperContext.feeToken,
                matchesFeeToken,
                amount,
                kind: wrapperContext.kind,
                isUnshieldingTransfer
              });

              if (matchesFeePayer && wrapperContext.amountPerGasUnit && wrapperContext.gasLimit) {
                const calculatedFeeInDisplayUnits = new BigNumber(wrapperContext.amountPerGasUnit)
                  .multipliedBy(new BigNumber(wrapperContext.gasLimit));

                // Convert calculated fee to base units for comparison
                // For native token, amountPerGasUnit is in display units, so convert back to base units
                // For other tokens, amountPerGasUnit is already in base units
                const isNativeToken = token === wrapperContext.feeToken &&
                  token === NAMADA_ADDRESS;

                let calculatedFeeInBaseUnits = calculatedFeeInDisplayUnits;
                if (isNativeToken && chainAssetsMap[token]) {
                  // Convert from display units back to base units by applying the exponent
                  const asset = chainAssetsMap[token] as any;
                  const displayUnit = asset?.denom_units?.find((unit: any) => unit.denom === asset?.display);
                  if (displayUnit?.exponent) {
                    calculatedFeeInBaseUnits = calculatedFeeInDisplayUnits.shiftedBy(displayUnit.exponent);
                  }
                }

                const targetAmount = new BigNumber(amount);

                console.log('Fee calculation comparison:', {
                  targetAmount: targetAmount.toString(),
                  calculatedFeeDisplayUnits: calculatedFeeInDisplayUnits.toString(),
                  calculatedFeeBaseUnits: calculatedFeeInBaseUnits.toString(),
                  amountPerGasUnit: wrapperContext.amountPerGasUnit,
                  gasLimit: wrapperContext.gasLimit,
                  isNativeToken,
                  isEqual: targetAmount.isEqualTo(calculatedFeeInBaseUnits)
                });

                // Try both exact match and fee token match
                isFeePayment = targetAmount.isEqualTo(calculatedFeeInBaseUnits) && (matchesFeeToken || !wrapperContext.feeToken);
              }
            }

            return (
              <VStack key={index} align="start" gap={1}>
                <HStack gap={2} align="center" minW="100%">
                  <Box minW="200px">
                    <PageLink to={accountUrl(owner)}>
                      {shortenHashOrAddress(owner)}
                    </PageLink>
                  </Box>
                  <Text color="gray.400">•</Text>
                  <Box>
                    {formatAmount(amount, chainAssetsMap[token] as any)}
                    {isFeePayment && (
                      <Text as="span" color="gray.400" fontSize="sm" ml={2}>
                        (Fee Payment)
                      </Text>
                    )}
                  </Box>
                </HStack>
                {Object.keys(rest).length > 0 && (
                  <TransactionDetailsData details={rest} wrapperContext={wrapperContext} />
                )}
              </VStack>
            );
          })}
        </VStack>
      );
    },
    shielded_section_hash: (value: any) => {
      if (!value || value === null || value === undefined) {
        return <>-</>;
      }

      // Check if value is an array of bytes (numbers)
      if (Array.isArray(value) && value.every((item: any) => typeof item === 'number' && item >= 0 && item <= 255)) {
        // Convert byte array to hex string
        const hexString = value
          .map((byte: number) => byte.toString(16).padStart(2, '0'))
          .join('');

        return (
          <Text fontFamily="mono" fontSize="sm">
            0x{hexString}
          </Text>
        );
      }

      // For other types, fall back to JSON stringify
      return <>{JSON.stringify(value)}</>;
    },
  };
};

const keyMap = (key: string) => {
  key = key.replace(/_/g, " ");
  return String(key).charAt(0).toUpperCase() + String(key).slice(1);
};

const getFieldTitle = (key: string, wrapperContext?: WrapperTxContext) => {
  const isIbcTransfer = wrapperContext?.kind === "ibcMsgTransfer";

  if (isIbcTransfer && key === "data") {
    return "Data (encoded)";
  }

  return keyMap(key);
};

const ContentArray = <T,>({
  array,
  Component,
}: {
  array: T[];
  Component: React.FC<{ details: T }>;
}) => {
  return (
    <VStack>
      {array.map((item) => (
        <VStack
          key={JSON.stringify(item)}
          align="left"
          px={2}
          rounded="sm"
          borderLeft="2px solid"
          borderColor="white"
          overflow="auto"
        >
          <Component details={item} />
        </VStack>
      ))}
    </VStack>
  );
};

export const TransactionDetailsData = ({
  details,
  wrapperContext
}: {
  details: unknown;
  wrapperContext?: WrapperTxContext;
}) => {
  const valueMap = createValueMap(wrapperContext);

  if (Array.isArray(details)) {
    return details.map((item, index) => (
      <TransactionDetailsData details={item} key={index} wrapperContext={wrapperContext} />
    ));
  }

  if (typeof details === "object" && details !== null) {
    return Object.entries(details)
      .filter(([key, _value]) => {
        // Filter out Native field for ibcTransparentTransfer transactions
        const isIbcTransparentTransfer = wrapperContext?.kind === "ibcTransparentTransfer";
        if (isIbcTransparentTransfer && key.toLowerCase() === "native") {
          return false;
        }
        // Omit the top-level "Ibc" item for IBC-related inner transactions
        const isIbcRelated = (wrapperContext?.kind || "").toLowerCase().startsWith("ibc");
        if (isIbcRelated && key.toLowerCase() === "ibc") {
          return false;
        }
        return true;
      })
      .map(([key, value]) => (
        <Data
          key={key}
          title={getFieldTitle(key, wrapperContext)}
          content={
            valueMap[key] ? (
              valueMap[key](value)
            ) : Array.isArray(value) ? (
              <ContentArray array={value} Component={({ details }) => (
                <TransactionDetailsData details={details} wrapperContext={wrapperContext} />
              )} />
            ) : (
              value
            )
          }
        />
      ));
  }

  return <Data content={details} />;
};
