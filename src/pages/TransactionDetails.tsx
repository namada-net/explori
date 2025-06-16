import {
  Box,
  Flex,
  Grid,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { useParams } from "react-router";
import { AccountLink } from "../components/AccountLink";
import { Hash } from "../components/Hash";
import { InnerTransactionCard } from "../components/InnerTransactionCard";
import { OverviewCard } from "../components/OverviewCard";
import { TransactionStatusBadge } from "../components/TransactionStatusBadge";
import { useTransaction } from "../queries/useTransaction";
import type { InnerTransaction } from "../types";

export const TransactionDetails = () => {
  const { hash } = useParams();
  const transaction = useTransaction(hash || "");

  if (transaction.isLoading) {
    return (
      <>
        <VStack gap={4} align="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.400">Loading transaction...</Text>
        </VStack>
      </>
    );
  }

  if (transaction.isError) {
    return (
      <Box bg="red.100" color="red.800" p={4} rounded="md">
        <Text fontWeight="semibold">Error</Text>
        <Text>
          Failed to load transaction. Please check the address and try again.
        </Text>
        <Text>{transaction.error.message}</Text>
      </Box>
    );
  }

  return (
    <>
      <Heading as="h1" size="xl" mb={4}>
        <Flex color="cyan" align="center" gap={2}>
          <FaArrowRightArrowLeft /> Transaction
        </Flex>
        <Text display="flex" fontSize="sm" alignItems="baseline" gap={1}>
          Hash: <Hash hash={hash || ""} enableCopy={true} />
        </Text>
      </Heading>
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={1}>
        <OverviewCard title="Fee Payer">
          <AccountLink address={transaction.data?.feePayer || ""} />
        </OverviewCard>
        <OverviewCard title="Gas Limit">
          {transaction.data?.gasLimit || "N/A"}
        </OverviewCard>
        <OverviewCard title="Gas Used">
          {transaction.data?.gasUsed || "N/A"}
        </OverviewCard>
        <OverviewCard title="Amount per Gas">
          {transaction.data?.amountPerGasUnit}
        </OverviewCard>
        <OverviewCard title="MASP Fee">
          {transaction.data?.maspFeePayment?.[1]?.sources?.[0]?.amount || "N/A"}
        </OverviewCard>
        <OverviewCard title="Block Height">
          {transaction.data?.blockHeight}
        </OverviewCard>
        <OverviewCard title="Status">
          <TransactionStatusBadge exitCode={transaction.data?.exitCode} />
        </OverviewCard>
        <OverviewCard title="Atomic">
          {transaction.data?.atomic === "true" ? "Yes" : "No"}
        </OverviewCard>
      </Grid>
      <Heading as="h2" size="lg" mt={8} mb={2}>
        Inner Transactions
      </Heading>
      <VStack gap={4} align="start" w="100%">
        {transaction.data?.innerTransactions.map(
          (innerTransaction: InnerTransaction) => (
            <InnerTransactionCard
              key={innerTransaction.txId}
              innerTransaction={innerTransaction}
            />
          ),
        )}
      </VStack>
    </>
  );
};
