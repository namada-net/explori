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

interface Tx {
  txId: string;
  wrapperId: string;
  kind: string;
  data: string;
  memo: string | null;
  exitCode: "applied" | "rejected";
}

// Main transaction type
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

function getTransactionInfo(
  tx: Transaction,
  transparentAddress: string
): { amount: BigNumber; sender?: string; receiver?: string } | undefined {
  if (!tx?.tx.data) return undefined;

  const parsed =
    typeof tx.tx.data === "string" ? JSON.parse(tx.tx.data) : tx.tx.data;
  const sections: RawDataSection[] = Array.isArray(parsed) ? parsed : [parsed];

  if (sections.length === 0) return undefined;

  const target = sections.find((s) => s.targets?.length);
  const source = sections.find((s) => s.sources?.length);

  let amount: BigNumber | undefined;
  let receiver: string | undefined;

  // Apply the specific logic based on transaction type
  if (tx.tx.kind === "unshieldingTransfer") {
    // For unshielding: get amount from targets where owner matches current address
    if (target?.targets) {
      const mainTarget = target.targets.find(
        (target) => target.owner === transparentAddress
      );
      if (mainTarget) {
        amount = new BigNumber(mainTarget.amount);
        receiver = mainTarget.owner;
      }
    }
  } else if (tx.tx.kind === "ibcTransparentTransfer") {
    // For IBC transfers: get amount from first source (cross-chain, owner won't match)
    if (source?.sources && source.sources.length > 0) {
      amount = new BigNumber(source.sources[0].amount);
    }

    // Also get receiver from targets
    if (target?.targets) {
      const mainTarget = target.targets.find(
        (target) => target.owner === transparentAddress
      );
      receiver = mainTarget?.owner;
    }
  } else if (
    tx.tx.kind === "transparentTransfer" ||
    tx.tx.kind === "shieldingTransfer"
  ) {
    // For transparent/shielding transfers: get amount from sources where owner matches current address
    if (source?.sources) {
      const mainSource = source.sources.find(
        (source) => source.owner === transparentAddress
      );
      if (mainSource) {
        amount = new BigNumber(mainSource.amount);
      }
    }

    // Also get receiver from targets
    if (target?.targets) {
      const mainTarget = target.targets.find(
        (target) => target.owner === transparentAddress
      );
      receiver = mainTarget?.owner;
    }
  }

  const sender = source?.sources?.[0]?.owner;

  return amount ? { amount, sender, receiver } : undefined;
}
type AccountTransactionsProps = {
  address: string;
};

export const AccountTransactions = ({ address }: AccountTransactionsProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  const {
    data: transactionsData,
    isLoading,
    error,
    isFetching,
  } = useAccountTransactions(address, currentPage, transactionsPerPage);

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

  const truncateHash = (hash: string, length = 10) => {
    return `${hash.slice(0, length)}...${hash.slice(-length)}`;
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
              <Table.ColumnHeader color="gray.400">Amount</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transactions.map((tx: Transaction) => {
              const transactionInfo = getTransactionInfo(tx, address);
              return (
                <Table.Row key={tx.tx.txId}>
                  <Table.Cell>
                    <Link
                      color="blue.400"
                      href={`/tx/${tx.tx.txId}`}
                      fontSize="sm"
                      fontFamily="mono"
                    >
                      {truncateHash(tx.tx.txId)}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant="subtle"
                      colorScheme="blue"
                      fontSize="xs"
                      textTransform="capitalize"
                    >
                      {tx.tx.kind}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant="subtle"
                      backgroundColor={
                        tx.tx.exitCode === "applied" ? "green.500" : "red.500"
                      }
                      fontSize="xs"
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
                  <Table.Cell fontSize="sm" fontFamily="mono">
                    {transactionInfo?.amount.toString() || "-"}
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
              variant="outline"
              backgroundColor="yellow"
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
