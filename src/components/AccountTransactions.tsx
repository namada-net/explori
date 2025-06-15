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
import { formatDistanceToNow } from "date-fns";

type Transaction = {
  id: string;
  hash: string;
  blockHeight: number;
  timestamp: string;
  type: string;
  status: "success" | "failed" | "pending";
  amount?: string;
  fee?: string;
  from?: string;
  to?: string;
};

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
  console.log(transactions, "transactions");
  const totalPages = Math.ceil(
    (transactionsData?.pagination.totalItems || 0) /
      transactionsData?.pagination.perPage
  );

  console.log(transactionsData, "transactionsData");

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "green";
      case "failed":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
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
              <Table.ColumnHeader color="gray.400">Age</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Amount</Table.ColumnHeader>
              <Table.ColumnHeader color="gray.400">Fee</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {transactions.map((tx: Transaction) => (
              <Table.Row key={tx.id || tx.hash}>
                <Table.Cell>
                  <Link
                    color="blue.400"
                    href={`/tx/${tx.hash}`}
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
                    {tx.type}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge
                    variant="subtle"
                    colorScheme={getStatusColor(tx.status)}
                    fontSize="xs"
                    textTransform="capitalize"
                  >
                    {tx.status}
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
                <Table.Cell fontSize="sm" color="gray.400">
                  {/* {formatDistanceToNow(new Date(tx.timestamp), {
                    addSuffix: true,
                  })} */}
                </Table.Cell>
                <Table.Cell fontSize="sm" fontFamily="mono">
                  {tx.amount || "-"}
                </Table.Cell>
                <Table.Cell fontSize="sm" fontFamily="mono" color="gray.400">
                  {tx.fee || "-"}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <HStack justify="space-between" align="center" mt={4}>
          <Text fontSize="sm" color="gray.400">
            Page {currentPage} of {totalPages} ({transactionsData?.total} total)
          </Text>
          <HStack gap={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isFetching}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
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
