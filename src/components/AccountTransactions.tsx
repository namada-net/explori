import { useState } from "react";

import { Box, Heading, Text, VStack, Spinner, Badge } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useAccountTransactions } from "../queries/useAccountTransactions";
import BigNumber from "bignumber.js";
import {
  camelCaseToTitleCase,
  NAMADA_ADDRESS,
  toDisplayAmount,
  formatNumberWithCommas,
  formatNumberWithCommasAndDecimals,
} from "../utils";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import type { Asset } from "@chain-registry/types";
import { blockUrl, transactionUrl } from "../routes";
import { useNavigate } from "react-router";
import { Pagination } from "./Pagination";
import { Hash } from "./Hash";
import { PageLink } from "./PageLink";

interface Tx {
  txId?: string; // Legacy field
  id?: string;   // New field
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
  transparentAddress: string,
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
      (src) => src.owner === transparentAddress,
    );
  }

  if (!matchingEntry && target?.targets) {
    matchingEntry = target.targets.find(
      (target) => target.owner === transparentAddress,
    );
  }

  if (matchingEntry) {
    amount = new BigNumber(matchingEntry.amount);
  }
  return amount ? { amount } : undefined;
};

const getToken = (
  txn: Transaction["tx"],
  nativeToken: string,
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
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;
  const { data: chainAssetsMap } = useChainAssetsMap();
  const namadaAsset = chainAssetsMap[NAMADA_ADDRESS];
  const {
    data: transactionsData,
    isLoading,
    error,
  } = useAccountTransactions(address ?? "", currentPage, transactionsPerPage);

  const transactions = transactionsData?.results || [];
  const totalPages = Math.ceil(
    (transactionsData?.pagination.totalItems || 0) /
    transactionsData?.pagination.perPage,
  );

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
      <Box bg="red.700" color="white" p={4} rounded="md">
        <Text fontWeight="semibold">Error</Text>
        <Text>Failed to load transactions. Please try again.</Text>
      </Box>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Box bg="gray.800" p={6} rounded="md">
        <Text color="gray.400">No transactions found for this account.</Text>
      </Box>
    );
  }

  return (
    <>
      <Box overflowX="auto">
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader color="gray.300">Hash</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.300">Type</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.300">Direction</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.300">Status</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.300">Block</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.300">Amount</Table.ColumnHeader>
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
                  <Table.Row
                    key={tx.tx.txId || tx.tx.id}
                    _hover={{
                      bg: "gray.800",
                    }}
                    transition="all 0.1s ease-in-out"
                    cursor="pointer"
                    onClick={() => navigate(transactionUrl(tx.tx.wrapperId))}
                  >
                    <Table.Cell py={4}>
                      <Hash hash={tx.tx.wrapperId} />
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant="outline"
                        colorPalette="gray"
                        fontSize="xs"
                        textTransform="capitalize"
                        fontWeight="medium"
                      >
                        {camelCaseToTitleCase(tx.tx.kind)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={
                          tx.kind === "received" ? "solid" : "outline"
                        }
                        colorPalette="blue"
                        fontSize="xs"
                        textTransform="capitalize"
                      >
                        {tx.kind || "-"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant="surface"
                        colorPalette={
                          tx.tx.exitCode === "applied" ? "green" : "red"
                        }
                        fontSize="xs"
                        textTransform="capitalize"
                      >
                        {tx.tx.exitCode}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <PageLink to={blockUrl(tx.blockHeight)}>
                        {formatNumberWithCommas(tx.blockHeight)}
                      </PageLink>
                    </Table.Cell>
                    <Table.Cell>
                      {transactionInfo?.amount &&
                        namadaAsset &&
                        formatNumberWithCommasAndDecimals(toDisplayAmount(
                          namadaAsset as Asset,
                          BigNumber(transactionInfo.amount),
                        ))}{" "}
                      <Text as="span" color="gray.400" fontSize="xs">
                        {tokenSymbol}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
          </Table.Body>
        </Table.Root>
      </Box>
      {totalPages > 1 && (
        <Box>
          <Pagination
            currentPage={currentPage}
            count={transactionsData?.pagination.totalItems || 0}
            pageSize={30}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </Box>
      )}
    </>
  );
};
