import { Grid, VStack, Text, Tooltip } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { transactionUrl } from "../routes";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { toDisplayAmount, formatNumberWithCommasAndDecimals, getAgeFromTimestamp, formatTimestamp } from "../utils";
import type { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { useBlockInfo } from "../queries/useBlockInfo";

type InnerTx = {
  id: string;
  kind?: string;
  exitCode?: string;
  data?: string;
};

type InnerTransactionListCardProps = {
  inner: InnerTx;
};

export const InnerTransactionListCard = ({ inner }: InnerTransactionListCardProps) => {
  const navigate = useNavigate();
  const { data: chainAssetsMap } = useChainAssetsMap();
  const blockInfo = useBlockInfo((inner as any).blockHeight);

  // Parse token and amount for transfer types
  const getTransferInfo = () => {
    if (!inner.data || !inner.kind) return { token: null, amount: null };
    
    const transferKinds = [
      "transparentTransfer",
      "shieldingTransfer", 
      "unshieldingTransfer",
      "ibcShieldingTransfer",
      "ibcUnshieldingTransfer",
      "ibcTransparentTransfer",
    ];
    
    if (!transferKinds.includes(inner.kind)) return { token: null, amount: null };

    try {
      const parsedData = typeof inner.data === "string" ? JSON.parse(inner.data) : inner.data;
      let token: string | null = null;
      let amount: string | null = null;

      if (Array.isArray(parsedData)) {
        const sourceSection = parsedData.find((section: any) => section.sources);
        const targetSection = parsedData.find((section: any) => section.targets);
        if (sourceSection?.sources?.[0]) {
          token = sourceSection.sources[0].token;
          amount = sourceSection.sources[0].amount;
        }
        if (targetSection?.targets?.[0] && !amount) {
          token = targetSection.targets[0].token;
          amount = targetSection.targets[0].amount;
        }
      } else if (parsedData?.sources?.[0] || parsedData?.targets?.[0]) {
        if (parsedData.sources?.[0]) {
          token = parsedData.sources[0].token;
          amount = parsedData.sources[0].amount;
        }
        if (parsedData.targets?.[0] && !amount) {
          token = parsedData.targets[0].token;
          amount = parsedData.targets[0].amount;
        }
      }

      return { token, amount };
    } catch {
      return { token: null, amount: null };
    }
  };

  const { token, amount } = getTransferInfo();
  const tokenAsset = token ? chainAssetsMap?.[token] : null;

  const transferKinds = [
    "transparentTransfer",
    "shieldingTransfer", 
    "unshieldingTransfer",
    "ibcShieldingTransfer",
    "ibcUnshieldingTransfer",
    "ibcTransparentTransfer",
  ];
  const isTransferType = inner.kind && transferKinds.includes(inner.kind);

  return (
    <Grid
      gap={2}
      w="100%"
      bg="gray.800"
      py={4}
      px={6}
      rounded="sm"
      templateColumns="1fr 1fr 3fr 1fr 0.75fr 1.25fr 1fr"
      cursor="pointer"
      _hover={{ bg: "gray.700" }}
      onClick={() => navigate(transactionUrl(inner.id))}
    >
      <Data
        title="Age"
        content={
          blockInfo.data?.timestamp ? (
            <Tooltip.Root openDelay={0} closeDelay={0}>
              <Tooltip.Trigger asChild>
                <Text fontSize="sm" color="gray.400">
                  {getAgeFromTimestamp(blockInfo.data.timestamp)}
                </Text>
              </Tooltip.Trigger>
              <Tooltip.Positioner>
                <Tooltip.Content bg="gray.700" color="white" px={2} py={1} rounded="md" fontSize="sm">
                  {formatTimestamp(parseInt(blockInfo.data.timestamp, 10))}
                </Tooltip.Content>
              </Tooltip.Positioner>
            </Tooltip.Root>
          ) : (
            <Text fontSize="sm" color="gray.500">-</Text>
          )
        }
      />
      <Data
        title="Block #"
        content={
          <Text fontSize="sm" color="gray.400">
            {(inner as any).blockHeight ? (inner as any).blockHeight.toLocaleString() : "-"}
          </Text>
        }
      />
      <Data
        title="Hash"
        content={
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.400">
              {inner.id ? `${inner.id.slice(0, 6)}...${inner.id.slice(-6)}` : "-"}
            </Text>
          </VStack>
        }
      />
      <Data
        title={isTransferType ? "Amount" : ""}
        content={
          isTransferType ? (
            amount && tokenAsset ? (
              <Text fontSize="sm" color="gray.400">
                {formatNumberWithCommasAndDecimals(toDisplayAmount(
                  tokenAsset as Asset,
                  new BigNumber(amount),
                ))}
              </Text>
            ) : amount ? (
              <Text fontSize="sm" color="gray.400">{amount}</Text>
            ) : (
              <Text color="gray.500">-</Text>
            )
          ) : (
            <Text color="transparent">-</Text>
          )
        }
      />
      <Data
        title={isTransferType ? "Token" : ""}
        content={
          isTransferType ? (
            tokenAsset ? (
              <Text fontSize="sm" fontWeight="medium" color="gray.400">
                {tokenAsset.symbol}
              </Text>
            ) : token ? (
              <Hash hash={token} />
            ) : (
              <Text color="gray.500">-</Text>
            )
          ) : (
            <Text color="transparent">-</Text>
          )
        }
      />
      <Data
        title="Kind"
        content={
          <Text fontSize="sm" color="gray.400">
            {inner.kind || "-"}
          </Text>
        }
      />
      <Data
        title="Status"
        content={<TransactionStatusBadge exitCode={inner.exitCode || "unknown"} />}
      />
    </Grid>
  );
};


