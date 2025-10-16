import { Box, Flex, Heading, Text, VStack, Spinner, Badge, HStack, Button, Menu, Checkbox, Tooltip } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { FaShieldAlt } from "react-icons/fa";
import { useRecentTransactions } from "../queries/useRecentTransactions";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { Hash } from "../components/Hash";
import { AccountLink } from "../components/AccountLink";
import { transactionUrl } from "../routes";
import { camelCaseToTitleCase, MASP_ADDRESS, toDisplayAmount, formatNumberWithCommasAndDecimals, getAgeFromTimestamp, formatTimestamp } from "../utils";
import type { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";

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



export const MaspTransactions = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [selectedKinds, setSelectedKinds] = useState<Set<string>>(new Set());
  const [hideIbcShieldingRejections, setHideIbcShieldingRejections] = useState(true);
  // All available MASP transaction kinds
  const allMaspKinds = [
    "shieldedTransfer",
    "shieldingTransfer",
    "unshieldingTransfer",
    "ibcShieldingTransfer",
    "ibcUnshieldingTransfer",
  ];

  // Use selected kinds or all kinds if none selected
  const selectedKindsArray = selectedKinds.size > 0 
    ? Array.from(selectedKinds) 
    : allMaspKinds;
  
  const maspKindsForQuery = selectedKindsArray;

  // Use selected tokens or undefined if none selected (omits token parameter)
  const selectedTokensArray = selectedTokens.size > 0 
    ? Array.from(selectedTokens) 
    : [];
  
  const tokensForQuery = selectedTokensArray.length > 0 
    ? selectedTokensArray 
    : undefined;

  const perBatch = 30;
  const offset = (currentPage - 1) * perBatch;

  const { data: wrappers, isLoading, error } = useRecentTransactions(
    offset,
    maspKindsForQuery,
    tokensForQuery,
  );
  const { data: chainAssetsMap } = useChainAssetsMap();

  // Transform API results into enriched MASP transaction rows (parse data for token/amount/source/target)
  const baseTransactions = (wrappers || []).flatMap((wrapper) => {
    const blockHeight = wrapper.blockHeight;
    return (wrapper.innerTransactions || [])
      .filter((inner) => selectedKindsArray.includes(inner.kind))
      .map((inner) => {
        let source: string | undefined;
        let target: string | undefined;
        let amount: string | undefined;
        let token: string | undefined;

        if (inner.kind === "shieldedTransfer") {
          source = "MASP";
          target = "MASP";
        } else if (inner.data) {
          try {
            const parsedData = typeof inner.data === "string" ? JSON.parse(inner.data) : inner.data;
            if (Array.isArray(parsedData)) {
              const sourceSection = parsedData.find((section: any) => section.sources);
              const targetSection = parsedData.find((section: any) => section.targets);
              if (sourceSection?.sources?.[0]) {
                source = sourceSection.sources[0].owner;
                amount = sourceSection.sources[0].amount;
                token = sourceSection.sources[0].token;
              }
              if (targetSection?.targets?.[0]) {
                target = targetSection.targets[0].owner;
                if (!amount) amount = targetSection.targets[0].amount;
                if (!token) token = targetSection.targets[0].token;
              }
            } else if (parsedData?.sources?.[0] || parsedData?.targets?.[0]) {
              if (parsedData.sources?.[0]) {
                source = parsedData.sources[0].owner;
                amount = parsedData.sources[0].amount;
                token = parsedData.sources[0].token;
              }
              if (parsedData.targets?.[0]) {
                target = parsedData.targets[0].owner;
                if (!amount) amount = parsedData.targets[0].amount;
                if (!token) token = parsedData.targets[0].token;
              }
            }
          } catch {}
        }

        return {
          txId: inner.id,
          id: inner.id,
          innerTxId: inner.id,
          blockHeight,
          kind: inner.kind,
          exitCode: inner.exitCode,
          source,
          target,
          amount,
          token,
        } as {
          txId: string;
          id: string;
          innerTxId: string;
          blockHeight: number;
          kind: string;
          exitCode: string;
          source?: string;
          target?: string;
          amount?: string;
          token?: string;
        };
      });
  });

  // Fetch unique block timestamps for the current page
  const uniqueHeights = Array.from(new Set(baseTransactions.map((t) => t.blockHeight))).filter((h) => Number.isFinite(h) && h > 0);
  const { data: blocksForPage } = useQuery({
    queryKey: ["masp-blocks-for-page", uniqueHeights],
    queryFn: async () => {
      if (uniqueHeights.length === 0) return [] as Array<{ height: number; timestamp?: string }>;
      const blocks = await Promise.all(uniqueHeights.map((h) => get("/block/height/" + h)));
      return blocks.map((b, idx) => ({ height: uniqueHeights[idx], timestamp: b?.timestamp })) as Array<{ height: number; timestamp?: string }>;
    },
    enabled: uniqueHeights.length > 0,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const heightToTimestamp = new Map<number, string | undefined>((blocksForPage || []).map((b) => [b.height, b.timestamp]));
  const transactions = baseTransactions.map((t) => ({ ...t, timestamp: heightToTimestamp.get(t.blockHeight) }));

  const totalInBatch = baseTransactions.length;
  const hasPrev = currentPage > 1;
  const hasNext = (wrappers?.length || 0) === perBatch;

  // Update URL when page changes
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (currentPage === 1) {
      newSearchParams.delete('page');
    } else {
      newSearchParams.set('page', currentPage.toString());
    }
    setSearchParams(newSearchParams);
  }, [currentPage, searchParams, setSearchParams]);

  // Sync currentPage state when URL query parameter changes (e.g., clicking nav link)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;
    const safePage = Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;
    if (safePage !== currentPage) {
      setCurrentPage(safePage);
    }
  }, [searchParams]);

  // Token filter derived from asset map
  const assetEntries = Object.entries(chainAssetsMap || {});
  const assetList = assetEntries
    .map(([address, asset]) => ({ address, symbol: (asset as any)?.symbol || (asset as any)?.name || address }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  // Transaction kinds for filtering (same as allMaspKinds)
  const transactionKinds = allMaspKinds;

  const toggleToken = (token: string) => {
    const next = new Set(selectedTokens);
    if (next.has(token)) {
      next.delete(token);
    } else {
      next.add(token);
    }
    setSelectedTokens(next);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const toggleKind = (kind: string) => {
    const next = new Set(selectedKinds);
    if (next.has(kind)) {
      next.delete(kind);
    } else {
      next.add(kind);
    }
    setSelectedKinds(next);
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  const resetTokenFilters = () => {
    setSelectedTokens(new Set());
    setCurrentPage(1); // Reset to page 1 when filters change
  };
  
  const resetKindFilters = () => {
    setSelectedKinds(new Set());
    setCurrentPage(1); // Reset to page 1 when filters change
  };

  // Apply client-side filtering for IBC shielding rejections if checkbox is checked
  const filteredTransactions = hideIbcShieldingRejections 
    ? transactions.filter(tx => !(tx.kind === "ibcShieldingTransfer" && tx.exitCode === "rejected"))
    : transactions;

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
        <Box bg="red.700" color="white" p={4} rounded="md">
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

      <Box bg="gray.800" p={4} rounded="md" mb={4}>
        <HStack justify="space-between" align="center">
          <Text color="gray.300" fontSize="sm">
            Showing {totalInBatch} MASP transactions from {offset + 1}-{offset + (wrappers?.length || 0)} most recent wrappers
            {hideIbcShieldingRejections && (
              <span> ({transactions.length - filteredTransactions.length} hidden)</span>
            )}
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

              {/* Hide IBC Shielding Rejections Checkbox */}
              <HStack gap={2} align="center" cursor="pointer" onClick={() => {
                setHideIbcShieldingRejections(!hideIbcShieldingRejections);
              }}>
                <Checkbox.Root 
                  checked={hideIbcShieldingRejections} 
                  colorPalette="gray" 
                  variant="subtle"
                >
                  <Checkbox.Control />
                </Checkbox.Root>
                <Text fontSize="sm" color="gray.300" userSelect="none">
                  Hide IBC Shielding Rejections
                </Text>
              </HStack>
            </HStack>
          </HStack>
        </Box>

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
                No MASP transactions
              </Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table.Root variant="outline" size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader color="gray.300">Age</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Type</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Amount</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Token</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">From</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">To</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Result</Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">Hash</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredTransactions.map((tx) => {
                    const tokenAsset = tx.token ? chainAssetsMap[tx.token] : null;

                    return (
                      <Table.Row
                        key={`${tx.txId || tx.id}-${tx.kind}-${tx.blockHeight}`}
                        _hover={{ bg: "gray.800" }}
                        transition="all 0.1s ease-in-out"
                        cursor="pointer"
                        onClick={() => navigate(transactionUrl(tx.innerTxId || tx.txId || tx.id))}
                      >
                        <Table.Cell>
                          {tx.timestamp ? (
                            <Tooltip.Root openDelay={0} closeDelay={0}>
                              <Tooltip.Trigger asChild>
                                <Text fontSize="xs" color="gray.400">
                                  {getAgeFromTimestamp(tx.timestamp)}
                                </Text>
                              </Tooltip.Trigger>
                              <Tooltip.Positioner>
                                <Tooltip.Content bg="gray.700" color="white" px={2} py={1} rounded="md" fontSize="sm">
                                  {formatTimestamp(parseInt(tx.timestamp, 10))}
                                </Tooltip.Content>
                              </Tooltip.Positioner>
                            </Tooltip.Root>
                          ) : (
                            <Text fontSize="xs" color="gray.500">-</Text>
                          )}
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
                        <Table.Cell>
                          {tx.source ? (
                            tx.source === MASP_ADDRESS || tx.source === "MASP" || tx.kind === "ibcUnshieldingTransfer" ? (
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
                          <Badge
                            variant="subtle"
                            colorPalette={tx.exitCode === "applied" ? "green" : "red"}
                            fontSize="xs"
                            textTransform="capitalize"
                          >
                            {tx.exitCode}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell py={4}>
                          <Text fontSize="sm" color="gray.400">
                            {(() => {
                              const hash = tx.innerTxId || tx.txId || tx.id;
                              return hash ? `${hash.slice(0, 6)}...${hash.slice(-6)}` : "-";
                            })()}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table.Root>
            </Box>
          )}

          <HStack justify="space-between" mt={4}>
            {!hasNext && (wrappers?.length || 0) > 0 && (
              <Text color="gray.400" fontSize="sm">
                No additional matching transactions
              </Text>
            )}
            <HStack ml="auto">
              <Button
                variant="outline"
                size="md"
                px={3}
                _hover={{ bg: "gray.800", color: "white" }}
                borderColor="gray.700"
                color="gray.300"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrev}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="md"
                px={3}
                _hover={{ bg: "gray.800", color: "white" }}
                borderColor="gray.700"
                color="gray.300"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!hasNext}
              >
                Next
              </Button>
            </HStack>
          </HStack>
        </>
      )}
    </Box>
  );
};
