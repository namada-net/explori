import { OverviewCard } from "../components/OverviewCard";
import { Hash } from "../components/Hash";
import { useTransaction } from "../queries/useTransaction";
import { Text, Heading, Grid, Flex, VStack } from "@chakra-ui/react";
import { useParams } from "react-router";
import { AccountLink } from "../components/AccountLink";
import { TransactionStatusBadge } from "../components/TransactionStatusBadge";
import { InnerTransactionCard } from "../components/InnerTransactionCard";
import type { InnerTransaction } from "../types";
import { FaArrowRightArrowLeft } from "react-icons/fa6";

export const TransactionDetails = () => {
  const { hash } = useParams();
  const transaction = useTransaction(hash || "");

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
