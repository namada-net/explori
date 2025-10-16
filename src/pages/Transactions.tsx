import { Box, Flex, Heading, Spinner, VStack, HStack, Button, Text, Menu, Checkbox } from "@chakra-ui/react";
import { IoSwapHorizontal } from "react-icons/io5";
import { useMemo, useState } from "react";
import { useRecentTransactions } from "../queries/useRecentTransactions";
import { TransactionCard } from "../components/TransactionCard";
import { InnerTransactionListCard } from "../components/InnerTransactionListCard";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";

export const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const perBatch = 30;
  const offset = (currentPage - 1) * perBatch;

  // Filters (apply only in inner view)
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [selectedKinds, setSelectedKinds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"wrapper" | "inner">("wrapper");

  const selectedKindsArray = selectedKinds.size > 0 ? Array.from(selectedKinds) : [];
  const selectedTokensArray = selectedTokens.size > 0 ? Array.from(selectedTokens) : [];
  const kindsForQuery = viewMode === "inner" && selectedKindsArray.length > 0 ? selectedKindsArray : undefined;
  const tokensForQuery = viewMode === "inner" && selectedTokensArray.length > 0 ? selectedTokensArray : undefined;

  const { data: wrappers, isLoading, isError } = useRecentTransactions(offset, kindsForQuery, tokensForQuery, 10000);
  const { data: chainAssetsMap } = useChainAssetsMap();

  const innerWithWrapper = useMemo(() => {
    return (wrappers || []).flatMap((w) => (w.innerTransactions || []).map((inner) => ({
      id: inner.id,
      kind: inner.kind,
      exitCode: inner.exitCode,
      data: inner.data,
      blockHeight: w.blockHeight,
      wrapperId: w.id,
    })));
  }, [wrappers]);

  const hasPrev = currentPage > 1;
  const hasNext = (wrappers?.length || 0) === perBatch;

  // Build token list from asset map
  const assetEntries = Object.entries(chainAssetsMap || {});
  const assetList = assetEntries
    .map(([address, asset]) => ({ address, symbol: (asset as any)?.symbol || (asset as any)?.name || address }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  // Known kinds (baseline), augmented with kinds present in current batch
  const baseKinds = [
    "bond",
    "unbond",
    "transparentTransfer",
    "shieldingTransfer",
    "unshieldingTransfer",
    "shieldedTransfer",
    "ibcMsgTransfer",
    "ibcUnshieldingTransfer",
    "ibcShieldingTransfer",
    "ibcTransparentTransfer",
    "claimRewards",
  ];
  const kindsFromBatch = Array.from(new Set((wrappers || []).flatMap((w) => (w.innerTransactions || []).map((i) => i.kind))));
  const transactionKinds = Array.from(new Set([...baseKinds, ...kindsFromBatch]));

  // Transfer kinds that can be filtered by token
  const transferKinds = [
    "transparentTransfer",
    "shieldingTransfer", 
    "unshieldingTransfer",
    "ibcShieldingTransfer",
    "ibcUnshieldingTransfer",
    "ibcTransparentTransfer",
  ];

  const hasTokenFilter = selectedTokens.size > 0;

  const toggleToken = (token: string) => {
    const next = new Set(selectedTokens);
    if (next.has(token)) {
      next.delete(token);
    } else {
      next.add(token);
    }
    setSelectedTokens(next);
    setCurrentPage(1);
  };

  const toggleKind = (kind: string) => {
    const next = new Set(selectedKinds);
    if (next.has(kind)) {
      next.delete(kind);
    } else {
      next.add(kind);
    }
    setSelectedKinds(next);
    setCurrentPage(1);
  };

  const resetTokenFilters = () => {
    setSelectedTokens(new Set());
    setCurrentPage(1);
  };

  const resetKindFilters = () => {
    setSelectedKinds(new Set());
    setCurrentPage(1);
  };

  return (
    <Box w="100%">
      <Heading as="h1" size="xl" mb={2} color="cyan">
        <Flex gap={2} align="center">
          <IoSwapHorizontal />
          Latest transactions
        </Flex>
      </Heading>

      <Box bg="gray.800" p={4} rounded="md" mb={4}>
        <HStack justify="space-between" align="center">
          <HStack gap={4} align="center">
            <HStack gap={1} p={1} bg="gray.700" rounded="md">
              <Button
                size="sm"
                variant={viewMode === "wrapper" ? "solid" : "ghost"}
                colorPalette={viewMode === "wrapper" ? "cyan" : "gray"}
                onClick={() => setViewMode("wrapper")}
              >
                Wrapper TXs
              </Button>
              <Button
                size="sm"
                variant={viewMode === "inner" ? "solid" : "ghost"}
                colorPalette={viewMode === "inner" ? "cyan" : "gray"}
                onClick={() => setViewMode("inner")}
              >
                Inner TXs
              </Button>
            </HStack>
            <Text color="gray.300" fontSize="sm">
              {viewMode === "wrapper"
                ? (
                  <>Showing {offset + 1}-{offset + (wrappers?.length || 0)} most recent wrapper txs</>
                ) : (
                  <>Showing {innerWithWrapper.length} inner transactions from {offset + 1}-{offset + (wrappers?.length || 0)} most recent wrappers</>
                )}
            </Text>
          </HStack>
          <HStack gap={2}>
              <Menu.Root closeOnSelect={false}>
                <Menu.Trigger asChild>
                  <Button 
                    size="sm" 
                    variant="surface" 
                    colorPalette="gray"
                    disabled={viewMode === "wrapper"}
                  >
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

              <Menu.Root closeOnSelect={false}>
                <Menu.Trigger asChild>
                  <Button 
                    size="sm" 
                    variant="surface" 
                    colorPalette="gray"
                    disabled={viewMode === "wrapper"}
                  >
                    {selectedKinds.size === 0 ? "All Types" : `${selectedKinds.size} selected`}
                  </Button>
                </Menu.Trigger>
                <Menu.Positioner>
                  <Menu.Content p={3} bg="gray.800" borderColor="gray.700">
                    <Button size="xs" variant="ghost" onClick={resetKindFilters} mb={2} color="cyan.400" _hover={{ bg: "gray.700" }}>
                      Reset
                    </Button>
                      <VStack align="start" maxH="300px" overflowY="auto" gap={2}>
                        {transactionKinds.map((kind) => {
                          const isTransferKind = transferKinds.includes(kind);
                          const isDisabled = hasTokenFilter && !isTransferKind;
                          const isSelected = selectedKinds.has(kind);
                          
                          return (
                            <HStack 
                              key={kind} 
                              w="full" 
                              cursor={isDisabled ? "not-allowed" : "pointer"} 
                              onClick={() => !isDisabled && toggleKind(kind)}
                              opacity={isDisabled ? 0.5 : 1}
                            >
                              <Checkbox.Root 
                                checked={isSelected} 
                                colorPalette="gray" 
                                variant="subtle"
                                disabled={isDisabled}
                              >
                                <Checkbox.Control />
                              </Checkbox.Root>
                              <Text 
                                fontSize="sm" 
                                userSelect="none"
                                color={isDisabled ? "gray.500" : "inherit"}
                              >
                                {kind}
                              </Text>
                            </HStack>
                          );
                        })}
                      </VStack>
                  </Menu.Content>
                </Menu.Positioner>
              </Menu.Root>
            </HStack>
          </HStack>
      </Box>

      {isLoading ? (
        <VStack gap={4} align="center" py={8} bg="gray.800" rounded="md">
          <Spinner size="lg" />
          <Text color="gray.400">Loading transactions...</Text>
        </VStack>
      ) : isError ? (
        <Box bg="red.700" color="white" p={4} rounded="md">
          <Text fontWeight="semibold">Error</Text>
          <Text>Failed to load transactions. Please try again.</Text>
        </Box>
      ) : (
        <>
          {(viewMode === "wrapper" && (!wrappers || wrappers.length === 0)) || (viewMode === "inner" && innerWithWrapper.length === 0) ? (
            <Box p={6} rounded="md">
              <Text color="gray.400" textAlign="center">No transactions</Text>
            </Box>
          ) : (
            <VStack gap={2} align="start" w="100%">
              {viewMode === "wrapper" && wrappers?.map((w) => (
                <TransactionCard key={w.id} hash={w.id} />
              ))}
              {viewMode === "inner" && innerWithWrapper.map((itx) => (
                <InnerTransactionListCard key={itx.id} inner={itx} />
              ))}
            </VStack>
          )}

          <HStack justify="space-between" mt={4}>
            {!hasNext && (wrappers?.length || 0) > 0 && (
              <Text color="gray.400" fontSize="sm">No additional {viewMode === "wrapper" ? "transactions" : "inner transactions"}</Text>
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
