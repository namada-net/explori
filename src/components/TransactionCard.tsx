import { useTransaction } from "../queries/useTransaction";
import { Box, Grid, Skeleton, VStack, Text, Tooltip } from "@chakra-ui/react";
import { Data } from "./Data";
import { AccountLink } from "./AccountLink";
import { useNavigate } from "react-router";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { transactionUrl } from "../routes";
import { getAgeFromTimestamp, formatTimestamp } from "../utils";
import { useBlockInfo } from "../queries/useBlockInfo";
import type { InnerTransaction } from "../types";

type TransactionListProps = {
  hash: string;
};

const allInnerTxApplied = (innerTransactions: InnerTransaction[]): string => {
  let appliedCount = 0;
  for (const tx of innerTransactions) {
    if (tx.exitCode === "applied") {
      appliedCount++;
    }

    if (tx.exitCode !== "applied") {
      return appliedCount > 0 ? "partial" : "failed";
    }
  }
  return "applied";
};

export const TransactionCard = ({ hash }: TransactionListProps) => {
  const navigate = useNavigate();
  const transaction = useTransaction(hash);
  const blockInfo = useBlockInfo(transaction.data?.blockHeight);

  if (transaction.isLoading) {
    return <Skeleton h="60px" w="100%" />;
  }

  if (transaction.isError) {
    return <Box>Error loading transaction</Box>;
  }

  return (
    <Grid
      gap={2}
      w="100%"
      bg="gray.800"
      py={4}
      px={6}
      rounded="sm"
      templateColumns="1fr 1fr 2fr 1fr 1fr 1fr 2fr"
      cursor="pointer"
      _hover={{ bg: "gray.700" }}
      onClick={() => navigate(transactionUrl(hash))}
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
            {transaction.data?.blockHeight ? transaction.data.blockHeight.toLocaleString() : "-"}
          </Text>
        }
      />
      <Data
        title="Hash"
        content={
          <VStack align="start" gap={1}>
            <Text fontSize="sm" color="gray.400">
              {(transaction.data?.txId || transaction.data?.id) ? 
                `${(transaction.data?.txId || transaction.data?.id)!.slice(0, 6)}...${(transaction.data?.txId || transaction.data?.id)!.slice(-6)}` : 
                "-"}
            </Text>
          </VStack>
        }
      />
      <Data
        title="Inner TXs"
        content={transaction.data?.innerTransactions.length || 0}
      />
      <Data
        title="Status"
        content={
          <TransactionStatusBadge
            exitCode={transaction.data?.exitCode || "unknown"}
          />
        }
      />
      <Data
        title="Inner TXs Status"
        content={
          <TransactionStatusBadge
            exitCode={allInnerTxApplied(transaction.data?.innerTransactions)}
          />
        }
      />
      <Data
        title="Fee payer"
        content={<AccountLink address={transaction.data?.feePayer} />}
      />
    </Grid>
  );
};
