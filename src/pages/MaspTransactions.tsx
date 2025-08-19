import { Box, Flex, Heading, Text, VStack, Spinner, Badge, HStack, Button, Menu, Checkbox } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { FaShieldAlt } from "react-icons/fa";
import { useMaspTransactionsPage } from "../queries/useMaspTransactions";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { Pagination } from "../components/Pagination";
import { Hash } from "../components/Hash";
import { PageLink } from "../components/PageLink";
import { AccountLink } from "../components/AccountLink";
import { blockUrl, transactionUrl } from "../routes";
import { camelCaseToTitleCase, MASP_ADDRESS, toDisplayAmount, formatNumberWithCommasAndDecimals } from "../utils";
import type { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";

// Mapping between transaction kinds and their color palettes
const getTransactionKindColor = (kind: string): string => {
  const colorMap: Record<string, string> = {
    "shieldedTransfer": "yellow",
    "shieldingTransfer": "purple", 
    "unshieldingTransfer": "orange",
    "ibcShieldingTransfer": "cyan",
    "ibcUnshieldingTransfer": "pink",
  };
  
  return colorMap[kind] || "gray";
};

// Utility function to calculate human-readable age
const getAgeFromTimestamp = (timestamp: string): string => {
  const now = new Date();
  // Convert string timestamp to number (Unix timestamp in seconds)
  const timestampSeconds = parseInt(timestamp, 10);
  // Convert to milliseconds for JavaScript Date
  const txTime = new Date(timestampSeconds * 1000);
  const diffMs = now.getTime() - txTime.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hr${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  } else {
    return `${seconds} sec${seconds > 1 ? 's' : ''} ago`;
  }
};

export const MaspTransactions = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [selectedKinds, setSelectedKinds] = useState<Set<string>>(new Set());
  const blocksPerPage = 100;

  const { data, isLoading, error, latestBlockHeight } = useMaspTransactionsPage(currentPage, blocksPerPage);
  const { data: chainAssetsMap } = useChainAssetsMap();

  const transactions = data || [];
  const totalPages = latestBlockHeight ? Math.ceil(latestBlockHeight / blocksPerPage) : 0;

  // Calculate the block range for the current page
  const startBlock = latestBlockHeight ? Math.max(latestBlockHeight - (currentPage - 1) * blocksPerPage, 1) : 0;
  const endBlock = latestBlockHeight ? Math.max(startBlock - blocksPerPage + 1, 1) : 0;

  // Token filter derived from asset map
  const assetEntries = Object.entries(chainAssetsMap || {});
  const assetList = assetEntries
    .map(([address, asset]) => ({ address, symbol: (asset as any)?.symbol || (asset as any)?.name || address }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  // Transaction kinds for filtering
  const transactionKinds = [
    "shieldedTransfer",
    "shieldingTransfer", 
    "unshieldingTransfer",
    "ibcShieldingTransfer",
    "ibcUnshieldingTransfer"
  ];

  const toggleToken = (token: string) => {
    const next = new Set(selectedTokens);
    if (next.has(token)) {
      next.delete(token);
    } else {
      next.add(token);
    }
    setSelectedTokens(next);
  };

  const toggleKind = (kind: string) => {
    const next = new Set(selectedKinds);
    if (next.has(kind)) {
      next.delete(kind);
    } else {
      next.add(kind);
    }
    setSelectedKinds(next);
  };

  const resetTokenFilters = () => setSelectedTokens(new Set());
  const resetKindFilters = () => setSelectedKinds(new Set());

  const filteredTransactions = transactions.filter((tx) => {
    // Filter by token if any tokens are selected
    if (selectedTokens.size > 0 && (!tx.token || !selectedTokens.has(tx.token))) {
      return false;
    }
    // Filter by kind if any kinds are selected
    if (selectedKinds.size > 0 && !selectedKinds.has(tx.kind)) {
      return false;
    }
    return true;
  });

  if (isLoading && currentPage === 1) {
    return (
      <Box w="100%">
        <Heading as="h1" size="xl" mb={2} color="cyan">
          <Flex gap={2} align="center">
            <FaShieldAlt />
            MASP Transactions
          </Flex>
        </Heading>
        <VStack gap={4} align="center" py={8} bg="gray.800" rounded="md">
          <Spinner size="lg" />
          <Text color="gray.400">Loading MASP transactions...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box w="100%">
        <Heading as="h1" size="xl" mb={2} color="cyan">
          <Flex gap={2} align="center">
            <FaShieldAlt />
            MASP Transactions
          </Flex>
        </Heading>
        <Box bg="red.100" color="red.800" p={4} rounded="md">
          <Text fontWeight="semibold">Error</Text>
          <Text>Failed to load MASP transactions. Please try again.</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box w="100%">
      <Heading as="h1" size="xl" mb={2} color="cyan">
        <Flex gap={2} align="center">
          <FaShieldAlt />
          MASP Transactions
        </Flex>
      </Heading>

      {latestBlockHeight && (
        <Box bg="gray.800" p={4} rounded="md" mb={4}>
          <HStack justify="space-between" align="center">
            <Text color="gray.300" fontSize="sm">
              Showing transactions from blocks {startBlock} - {endBlock}
            </Text>
            
            <HStack gap={2}>
                             {/* Token Filter Dropdown */}
               <Menu.Root closeOnSelect={false}>
                 <Menu.Trigger asChild>
                   <Button size="sm" variant="surface" colorPalette="gray">
                     {selectedTokens.size === 0 ? "All Tokens" : `${selectedTokens.size} selected`}
                   </Button>
                 </Menu.Trigger>
                 <Menu.Positioner>
                   <Menu.Content p={3} bg="gray.800" borderColor="gray.700">
                     <Button size="xs" variant="ghost" onClick={resetTokenFilters} mb={2} color="cyan.400" _hover={{ bg: "gray.700" }}>
                       Reset
                     </Button>
                    <VStack align="start" maxH="300px" overflowY="auto" gap={2}>
                      {assetList.map(({ address, symbol }) => (
                        <HStack key={address} w="full" cursor="pointer" onClick={() => toggleToken(address)}>
                          <Checkbox.Root checked={selectedTokens.has(address)} colorPalette="gray" variant="subtle">
                            <Checkbox.Control />
                          </Checkbox.Root>
                          <Text fontSize="sm" userSelect="none">{symbol}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>

                             {/* Transaction Kind Filter Dropdown */}
               <Menu.Root closeOnSelect={false}>
                 <Menu.Trigger asChild>
                   <Button size="sm" variant="surface" colorPalette="gray">
                     {selectedKinds.size === 0 ? "All Types" : `${selectedKinds.size} selected`}
                   </Button>
                 </Menu.Trigger>
                 <Menu.Positioner>
                   <Menu.Content p={3} bg="gray.800" borderColor="gray.700">
                     <Button size="xs" variant="ghost" onClick={resetKindFilters} mb={2} color="cyan.400" _hover={{ bg: "gray.700" }}>
                       Reset
                     </Button>
                    <VStack align="start" maxH="300px" overflowY="auto" gap={2}>
                      {transactionKinds.map((kind) => (
                        <HStack key={kind} w="full" cursor="pointer" onClick={() => toggleKind(kind)}>
                          <Checkbox.Root checked={selectedKinds.has(kind)} colorPalette="gray" variant="subtle">
                            <Checkbox.Control />
                          </Checkbox.Root>
                          <Text fontSize="sm" userSelect="none">{camelCaseToTitleCase(kind)}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            </HStack>
          </HStack>
        </Box>
      )}

      {(isLoading && currentPage > 1) ? (
        <VStack gap={4} align="center" py={8} bg="gray.800" rounded="md">
          <Spinner size="lg" />
          <Text color="gray.400">Loading MASP transactions...</Text>
        </VStack>
      ) : (
        <>
          {transactions.length === 0 ? (
            <Box p={6} rounded="md">
              <Text color="gray.400" textAlign="center">
                No MASP transactions in this block range
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table.Root variant="outline" size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader color="gray.300">Hash</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Type</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Result</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Block</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Age</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">From</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">To</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Amount</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Token</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredTransactions.map((tx) => {
                    const tokenAsset = tx.token ? chainAssetsMap[tx.token] : null;
                    
                    return (
                      <Table.Row
                        key={`${tx.txId}-${tx.kind}-${tx.blockHeight}`}
                        _hover={{ bg: "gray.800" }}
                        transition="all 0.1s ease-in-out"
                        cursor="pointer"
                        onClick={() => navigate(transactionUrl(tx.innerTxId || tx.txId))}
                      >
                        <Table.Cell py={4}>
                          <Hash hash={tx.innerTxId || tx.txId} />
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            variant="outline"
                            colorPalette={getTransactionKindColor(tx.kind)}
                            fontSize="xs"
                            textTransform="capitalize"
                          >
                            {camelCaseToTitleCase(tx.kind)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            variant="subtle"
                            colorPalette={tx.exitCode === "applied" ? "green" : "red"}
                            fontSize="xs"
                            textTransform="capitalize"
                          >
                            {tx.exitCode}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <PageLink to={blockUrl(tx.blockHeight)}>{tx.blockHeight}</PageLink>
                        </Table.Cell>
                        <Table.Cell>
                          {tx.timestamp ? (
                            <Text fontSize="xs" color="gray.400">
                              {getAgeFromTimestamp(tx.timestamp)}
                            </Text>
                          ) : (
                            <Text fontSize="xs" color="gray.500">-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {tx.source ? (
                            tx.source === MASP_ADDRESS || tx.source === "MASP" ? (
                              <HStack gap={1} align="center">
                                <FaShieldAlt color="#22d3ee" size={12} />
                                <Text fontWeight="medium" color="cyan.400">MASP</Text>
                              </HStack>
                            ) : (
                              <AccountLink address={tx.source} />
                            )
                          ) : (
                            <Text color="gray.500">-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {tx.target ? (
                            tx.target === MASP_ADDRESS || tx.target === "MASP" ? (
                              <HStack gap={1} align="center">
                                <FaShieldAlt color="#22d3ee" size={12} />
                                <Text fontWeight="medium" color="cyan.400">MASP</Text>
                              </HStack>
                            ) : (
                              <AccountLink address={tx.target} />
                            )
                          ) : (
                            <Text color="gray.500">-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {tx.kind === "shieldedTransfer" ? (
                            <FaShieldAlt color="gray" />
                          ) : tx.amount && tokenAsset ? (
                            <Text fontSize="sm">
                              {formatNumberWithCommasAndDecimals(toDisplayAmount(
                                tokenAsset as Asset,
                                new BigNumber(tx.amount),
                              ))}
                            </Text>
                          ) : tx.amount ? (
                            <Text fontSize="sm">{tx.amount}</Text>
                          ) : (
                            <Text color="gray.500">-</Text>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          {tx.kind === "shieldedTransfer" ? (
                            <FaShieldAlt color="gray" />
                          ) : tokenAsset ? (
                            <Text fontSize="sm" fontWeight="medium">
                              {tokenAsset.symbol}
                            </Text>
                          ) : tx.token ? (
                            <Hash hash={tx.token} />
                          ) : (
                            <Text color="gray.500">-</Text>
                          )}
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Box>
          )}

          {totalPages > 1 && latestBlockHeight && (
            <Box>
              <Pagination
                currentPage={currentPage}
                count={latestBlockHeight}
                pageSize={blocksPerPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};
