import type { Asset } from "@chain-registry/types";
import { VStack, HStack, Text, Box } from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { accountUrl, validatorUrl } from "../routes";
import type { TransactionSource, TransactionTarget } from "../types";
import { shortenHashOrAddress, toDisplayAmount } from "../utils";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { PageLink } from "./PageLink";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const valueMap: Record<string, Function | undefined> = {
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
  amount: (value: string, asset?: Asset) => {
    if (asset) {
      const amount = toDisplayAmount(asset, BigNumber(value));
      return (
        <span>
          {amount.toString()} {asset.symbol}
        </span>
      );
    }
    return <span>{value}</span>;
  },
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
                {valueMap.amount?.(amount, chainAssetsMap[token])}
              </Box>
            </HStack>
            {Object.keys(rest).length > 0 && (
              <TransactionDetailsData details={rest} />
            )}
          </VStack>
        );
      })}
    </VStack>
  ),
  // target and sources render the same
  targets: (array: TransactionTarget[]) => (
    <VStack align="start" gap={1}>
      {array.map((target, index) => {
        const { data: chainAssetsMap } = useChainAssetsMap();
        const { owner, amount, token, type, ...rest } = target;
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
                {valueMap.amount?.(amount, chainAssetsMap[token])}
              </Box>
            </HStack>
            {Object.keys(rest).length > 0 && (
              <TransactionDetailsData details={rest} />
            )}
          </VStack>
        );
      })}
    </VStack>
  ),
  shielded_section_hash: (value: string) => {
    return <>{JSON.stringify(value)}</>;
  },
};

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

export const TransactionDetailsData = ({ details }: { details: unknown }) => {
  if (Array.isArray(details)) {
    return details.map((item, index) => (
      <TransactionDetailsData details={item} key={index} />
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
            <ContentArray array={value} Component={TransactionDetailsData} />
          ) : (
            value
          )
        }
      />
    ));
  }

  return <Data content={details} />;
};
