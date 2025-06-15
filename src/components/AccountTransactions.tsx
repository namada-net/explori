import { useState } from "react";

import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Spinner,
  Badge,
  Link,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useAccountTransactions } from "../queries/useAccountTransactions";
import BigNumber from "bignumber.js";
import {
  NAMADA_ADDRESS,
  shortenHashOrAddress,
  toDisplayAmount,
} from "../utils";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import type { Asset } from "@chain-registry/types";

interface Tx {
  txId: string;
  wrapperId: string;
  kind: string;
  data: string;
  memo: string | null;
  exitCode: "applied" | "rejected";
}

interface Transaction {
  tx: Tx;
  target: string;
  kind: string;
  blockHeight: number;
}

type RawDataSection = {
  amount?: string;
  sources?: Array<{ amount: string; owner: string }>;
  targets?: Array<{ amount: string; owner: string }>;
};

type AccountTransactionsProps = {
  address: string | undefined;
};

const getTransactionInfo = (
  transaction: Transaction,
  transparentAddress: string
): { amount: BigNumber } | undefined => {
  const { tx } = transaction;
  if (!tx?.data) return undefined;

  const parsed = typeof tx.data === "string" ? JSON.parse(tx.data) : tx.data;

  if (tx.kind === "bond" || tx.kind === "unbond") {
    // Bond/unbond transactions have a flat structure with amount, validator, and source
    if (parsed.amount && parsed.source === transparentAddress) {
      return {
        amount: new BigNumber(parsed.amount),
      };
    }
    return undefined;
  }

  // Handle transactions with sources/targets structure
  const sections: RawDataSection[] = Array.isArray(parsed) ? parsed : [parsed];

  if (sections.length === 0) return undefined;

  const target = sections.find((s) => s.targets?.length);
  const source = sections.find((s) => s.sources?.length);

  let amount: BigNumber | undefined;

  // Check both sources and targets for matching owner address and return amount
  let matchingEntry = null;

  if (source?.sources) {
    matchingEntry = source.sources.find(
      (src) => src.owner === transparentAddress
    );
  }

  if (!matchingEntry && target?.targets) {
    matchingEntry = target.targets.find(
      (target) => target.owner === transparentAddress
    );
  }

  if (matchingEntry) {
    amount = new BigNumber(matchingEntry.amount);
  }
  return amount ? { amount } : undefined;
};

const getToken = (
  txn: Transaction["tx"],
  nativeToken: string
): string | undefined => {
  if (txn?.kind === "bond" || txn?.kind === "unbond") return nativeToken;
  let parsed;
  try {
    parsed = txn?.data ? JSON.parse(txn.data) : undefined;
  } catch (error) {
    console.error("Failed to parse getToken data:", error);
  }
  if (!parsed) return undefined;
  const sections = Array.isArray(parsed) ? parsed : [parsed];

  // return the first token found in sources or targets
  for (const section of sections) {
    if (section.sources?.length) {
      return section.sources[0].token;
    }
    if (section.targets?.length) {
      return section.targets[0].token;
    }
  }

  return undefined;
};

export const AccountTransactions = ({ address }: AccountTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const { data: chainAssetsMap } = useChainAssetsMap();
  const namadaAsset = chainAssetsMap[NAMADA_ADDRESS];
  const {
    data: transactionsData,
    isLoading,
    error,
    isFetching,
  } = useAccountTransactions(address ?? "", currentPage, transactionsPerPage);

  const transactions = transactionsData?.results || [];
  const totalPages = Math.ceil(
    (transactionsData?.pagination.totalItems || 0) /
      transactionsData?.pagination.perPage
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (isLoading && currentPage === 1) {
    return (
      <Box bg="gray.800" p={6} rounded="md">
        <Heading as="h2" size="md" mb={4}>
          Recent Transactions
        </Heading>
        <VStack gap={4} align="center" py={8}>
          <Spinner size="lg" />
          <Text color="gray.400">Loading transactions...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="gray.800" p={6} rounded="md">
        <Heading as="h2" size="md" mb={4}>
          Recent Transactions
        </Heading>
        <Box bg="red.100" color="red.800" p={4} rounded="md">
          <Text fontWeight="semibold">Error</Text>
          <Text>Failed to load transactions. Please try again.</Text>
        </Box>
      </Box>
    );
  }

  console.log(transactions, "transactions");

  if (!transactions || transactions.length === 0) {
    return (
      <Box bg="gray.800" p={6} rounded="md">
        <Heading as="h2" size="md" mb={4}>
          Recent Transactions
        </Heading>
        <Text color="gray.400">No transactions found for this account.</Text>
      </Box>
    );
  }

  return (
    <Box bg="gray.800" p={6} rounded="md">
      <HStack justify="space-between" align="center" mb={4}>
        <Heading as="h2" size="md">
          Recent Transactions
        </Heading>
        {isFetching && <Spinner size="sm" />}
      </HStack>

      <Box overflowX="auto">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader color="gray.400">Hash</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Type</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Status</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Block</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400" textAlign="right">
                Amount
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transactions
              .filter((tx: Transaction) => tx.tx.kind !== "claimRewards")
              .map((tx: Transaction) => {
                const transactionInfo = getTransactionInfo(tx, address ?? "");
                const token = getToken(tx.tx, NAMADA_ADDRESS);
                const tokenSymbol = token ? chainAssetsMap[token]?.symbol : "";
                return (
                  <Table.Row key={tx.tx.txId}>
                    <Table.Cell>
                      <Link
                        color="blue.400"
                        href={`/tx/${tx.tx.txId}`}
                        fontSize="sm"
                        fontFamily="mono"
                      >
                        {shortenHashOrAddress(tx.tx.txId)}
                      </Link>
                    </Table.Cell>
                    <Table.Cell>
                      {tx.tx.kind
                        .replace(/([a-z])([A-Z])/g, "$1 $2")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant="subtle"
                        backgroundColor={
                          tx.tx.exitCode === "applied" ? "green.500" : "red.500"
                        }
                        fontSize="sm"
                        textTransform="capitalize"
                      >
                        {tx.tx.exitCode}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Link
                        color="blue.400"
                        href={`/block/${tx.blockHeight}`}
                        fontSize="sm"
                      >
                        {tx.blockHeight}
                      </Link>
                    </Table.Cell>
                    <Table.Cell
                      fontSize="sm"
                      fontFamily="mono"
                      textAlign="right"
                    >
                      {transactionInfo?.amount &&
                        namadaAsset &&
                        toDisplayAmount(
                          namadaAsset as Asset,
                          BigNumber(transactionInfo.amount)
                        ).toString()}{" "}
                      {tokenSymbol}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="space-between" align="center" mt={4}>
          <Text fontSize="sm" color="gray.400">
            Page {currentPage} of {totalPages} (
            {transactionsData?.pagination.totalItems} total)
          </Text>
          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              color="yellow"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isFetching}
            >
              Previous
            </Button>
            <Button
              size="sm"
              backgroundColor="yellow"
              color="black"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isFetching}
            >
              Next
            </Button>
          </HStack>
        </HStack>
      )}
    </Box>
  );
};
