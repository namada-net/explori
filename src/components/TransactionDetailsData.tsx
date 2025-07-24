import type { Asset } from "@chain-registry/types";
import { VStack, HStack, Text, Box } from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { accountUrl, validatorUrl } from "../routes";
import type { TransactionSource, TransactionTarget } from "../types";
import { shortenHashOrAddress, toDisplayAmount, NAMADA_ADDRESS } from "../utils";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { PageLink } from "./PageLink";

const formatAmount = (value: string, asset?: Asset) => {
  if (asset) {
    const amount = toDisplayAmount(asset as any, BigNumber(value));
    return (
      <span>
        {amount.toString()} {asset.symbol}
      </span>
    );
  }
  return <span>{value}</span>;
};

type WrapperTxContext = {
  kind?: string;
  feePayer?: string;
  amountPerGasUnit?: string;
  gasLimit?: string;
  feeToken?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const createValueMap = (wrapperContext?: WrapperTxContext): Record<string, Function | undefined> => ({
  validator: (address: string) => (
    <PageLink to={validatorUrl(address)}>
      {shortenHashOrAddress(address)}
    </PageLink>
  ),
  source: (address: string) => (
    <PageLink to={accountUrl(address)}>
      {shortenHashOrAddress(address)}
    </PageLink>
  ),
  amount: formatAmount,
  owner: (address: string) => (
    <PageLink to={accountUrl(address)}>
      {shortenHashOrAddress(address)}
    </PageLink>
  ),
  token: (value: string) => {
    return <Hash hash={value} enableCopy={true} />;
  },
  sources: (array: TransactionSource[]) => (
    <VStack align="start" gap={1}>
      {array.map((source, index) => {
        const { data: chainAssetsMap } = useChainAssetsMap();
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
          const { data: chainAssetsMap } = useChainAssetsMap();
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
  shielded_section_hash: (value: string) => {
    if (!value || value === null || value === undefined) {
      return <>-</>;
    }
    return <>{JSON.stringify(value)}</>;
  },
});

const keyMap = (key: string) => {
  key = key.replace(/_/g, " ");
  return String(key).charAt(0).toUpperCase() + String(key).slice(1);
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
    return Object.entries(details).map(([key, value]) => (
      <Data
        key={key}
        title={keyMap(key)}
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
