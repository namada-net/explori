import { useTransaction } from "../queries/useTransaction";
import { Box, Grid, Skeleton, VStack } from "@chakra-ui/react";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { AccountLink } from "./AccountLink";
import { useNavigate } from "react-router";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { transactionUrl } from "../routes";
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

  if (transaction.isLoading) {
    return <Skeleton h="60px" w="100%" />;
  }

  if (transaction.isError) {
    return <Box>Error loading transaction</Box>;
  }

  return (
    <Grid
      gap={4}
      w="100%"
      bg="gray.800"
      py={4}
      px={6}
      rounded="sm"
      templateColumns="40% 1fr 1fr 1fr 1fr"
      cursor="pointer"
      _hover={{ bg: "gray.700" }}
      onClick={() => navigate(transactionUrl(hash))}
    >
      <Data
        title="Hash"
        content={
          <VStack align="start" gap={1}>
            <Hash hash={transaction.data?.txId} />
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
