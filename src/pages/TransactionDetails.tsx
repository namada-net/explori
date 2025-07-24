import {
  Box,
  Flex,
  Grid,
  Heading,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { useParams } from "react-router";
import { AccountLink } from "../components/AccountLink";
import { Hash } from "../components/Hash";
import { InnerTransactionCard } from "../components/InnerTransactionCard";
import { OverviewCard } from "../components/OverviewCard";
import { TransactionStatusBadge } from "../components/TransactionStatusBadge";
import { useTransaction } from "../queries/useTransaction";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { NAMADA_ADDRESS, toDisplayAmount } from "../utils";
import type { InnerTransaction } from "../types";

export const TransactionDetails = () => {
  const { hash } = useParams();
  const transaction = useTransaction(hash || "");
  const { data: chainAssetsMap } = useChainAssetsMap();

  if (transaction.isLoading) {
    return (
      <VStack gap={4} align="center" py={8}>
        <Spinner size="lg" />
        <Text color="gray.400">Loading transaction...</Text>
      </VStack>
    );
  }

  if (transaction.isError) {
    return (
      <Box bg="red.100" color="red.800" p={4} rounded="md">
        <Text fontWeight="semibold">Error</Text>
        <Text>
          Failed to load transaction. Please check the address and try again.
        </Text>
        <Text>{transaction.error?.message}</Text>
      </Box>
    );
  }

  const txData = transaction.data;
  const isInnerTx = txData?.type === "inner";

  if (isInnerTx) {
    return (
      <>
        <Heading as="h1" size="xl" mb={4}>
          <Flex color="cyan" align="center" gap={2}>
            <FaArrowRightArrowLeft /> Inner Transaction
          </Flex>
          <Box display="flex" fontSize="sm" alignItems="baseline" gap={1}>
            Hash: <Hash hash={hash || ""} enableCopy={true} />
          </Box>
        </Heading>
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={1}>
          <OverviewCard title="Wrapper ID">
            <Hash hash={txData.wrapperId || ""} enableCopy={true} />
          </OverviewCard>
        </Grid>

        {txData.data && (
          <>
            <Heading as="h2" size="lg" mt={8} mb={2}>
              Transaction Data
            </Heading>
            <InnerTransactionCard innerTransaction={txData} />
          </>
        )}
      </>
    );
  }

  // Show wrapper transaction details + inner transactions
  return (
    <>
      <Heading as="h1" size="xl" mb={4}>
        <Flex color="cyan" align="center" gap={2}>
          <FaArrowRightArrowLeft /> Transaction
        </Flex>
        <Box display="flex" fontSize="sm" alignItems="baseline" gap={1}>
          Hash: <Hash hash={hash || ""} enableCopy={true} />
        </Box>
      </Heading>
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={1}>
        <OverviewCard title="Status">
          <TransactionStatusBadge exitCode={txData?.exitCode} />
        </OverviewCard>
        <OverviewCard title="Block Height">
          {txData?.blockHeight || "-"}
        </OverviewCard>
        <OverviewCard title="Fee Paid">
          {txData?.amountPerGasUnit && txData?.gasLimit && chainAssetsMap
            ? (() => {
              const rawFeeAmount = new BigNumber(txData.amountPerGasUnit)
                .multipliedBy(new BigNumber(txData.gasLimit));
              const feeAsset = chainAssetsMap[txData.feeToken] || chainAssetsMap[NAMADA_ADDRESS];
              if (feeAsset) {
                // NAM amountPerGasUnit is already in display units, other tokens are in base units
                const isNativeToken = txData.feeToken === NAMADA_ADDRESS || !txData.feeToken;
                const displayAmount = isNativeToken
                  ? rawFeeAmount
                  : toDisplayAmount(feeAsset as any, rawFeeAmount);
                return `${displayAmount.toFormat()} ${feeAsset.symbol || "NAM"}`;
              }
              return `${rawFeeAmount.toFormat()} NAM`;
            })()
            : "-"}
        </OverviewCard>
        <OverviewCard title="Fee Payer">
          <AccountLink address={txData?.feePayer || ""} />
        </OverviewCard>
        <OverviewCard title="Gas Limit">
          {txData?.gasLimit || "-"}
        </OverviewCard>
        <OverviewCard title="Gas Used">{txData?.gasUsed || "-"}</OverviewCard>
        <OverviewCard title="Atomic">
          {txData?.atomic === "true" ? "Yes" : "No"}
        </OverviewCard>
      </Grid>

      {txData?.innerTransactions?.length > 0 && (
        <>
          <Heading as="h2" size="lg" mt={8} mb={2}>
            Inner Transactions ({txData.innerTransactions.length})
          </Heading>
          <VStack gap={4} align="start" w="100%">
            {txData.innerTransactions.map(
              (innerTransaction: InnerTransaction, index: number) => (
                <InnerTransactionCard
                  key={innerTransaction.txId || `inner-${index}`}
                  innerTransaction={innerTransaction}
                  wrapperTxData={{
                    kind: innerTransaction.kind,
                    feePayer: txData.feePayer,
                    amountPerGasUnit: txData.amountPerGasUnit,
                    gasLimit: txData.gasLimit,
                    feeToken: txData.feeToken,
                  }}
                />
              ),
            )}
          </VStack>
        </>
      )}
    </>
  );
};
