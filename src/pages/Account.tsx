import { useParams } from "react-router";
import { useMemo } from "react";
import { useAccount } from "../queries/useAccount";
import namadaAssets from "@namada/chain-registry/namada/assetlist.json";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { toDisplayAmount } from "../utils";
import type { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { AccountTransactions } from "../components/AccountTransactions";

type UserAsset = {
  address?: string;
  denom?: string;
  symbol?: string;
  name?: string;
  balance: string;
  tokenAddress: string;
};

type AccountAsset = {
  tokenAddress: string;
  minDenomAmount: string;
};

export const Account = () => {
  const { address } = useParams<{ address: string }>();

  const {
    data: account,
    isLoading: accountLoading,
    error: accountError,
  } = useAccount(address!);
  const { data: chainAssetsMap, isLoading: chainAssetsLoading } =
    useChainAssetsMap();
  const isLoading = accountLoading || chainAssetsLoading;

  const userAssets = useMemo((): UserAsset[] => {
    if (!account || !chainAssetsMap) return [];

    const assetsWithDetails: UserAsset[] = [];

    // Process each token balance in the account
    account.forEach((accountAsset: AccountAsset) => {
      const chainAsset = chainAssetsMap[accountAsset.tokenAddress];
      if (chainAsset) {
        assetsWithDetails.push({
          ...chainAsset,
          balance: accountAsset.minDenomAmount || "0",
          tokenAddress: accountAsset.tokenAddress,
        });
      }
    });

    return assetsWithDetails;
  }, [account, chainAssetsMap]);

  // Calculate total NAM balance from native token
  const nativeTokenBalance = useMemo(() => {
    if (!userAssets.length) return "0";

    const nativeAsset = userAssets.find(
      (asset) =>
        asset.symbol === "NAM" || asset.name?.toLowerCase().includes("namada")
    );

    return nativeAsset?.balance || "0";
  }, [userAssets]);

  if (isLoading) {
    return (
      <VStack gap={4} align="center" py={8}>
        <Spinner size="lg" />
        <Text>Loading account details...</Text>
      </VStack>
    );
  }

  if (accountError) {
    return (
      <Box bg="red.100" color="red.800" p={4} rounded="md">
        <Text fontWeight="semibold">Error</Text>
        <Text>
          Failed to load account details. Please check the address and try
          again.
        </Text>
      </Box>
    );
  }

  if (!account) {
    return (
      <Box bg="yellow.100" color="yellow.800" p={4} rounded="md">
        <Text fontWeight="semibold">Warning</Text>
        <Text>Account not found. Please verify the address is correct.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Account Details
          </Heading>
          <Text color="gray.400" fontSize="sm" wordBreak="break-all">
            {address}
          </Text>
        </Box>

        <Box bg="gray.800" p={6} rounded="md">
          <VStack gap={6} align="stretch">
            <HStack justify="space-between" align="center">
              <Heading as="h2" size="md">
                Overview
              </Heading>
              <Box
                bg="green.100"
                color="green.800"
                px={3}
                py={1}
                rounded="full"
                fontSize="sm"
              >
                Active
              </Box>
            </HStack>

            <HStack gap={8}>
              <Box>
                <Text fontSize="sm" color="gray.400">
                  Balance
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="yellow">
                  {toDisplayAmount(
                    namadaAssets.assets[0] as Asset,
                    new BigNumber(nativeTokenBalance)
                  ).toFixed(3)}{" "}
                  NAM
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Native Token
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.400">
                  Transaction Count
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="yellow">
                  {account.transactionCount || "0"}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Total transactions
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.400">
                  Total Assets
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="yellow">
                  {userAssets.length}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Token types
                </Text>
              </Box>
            </HStack>

            {/* Assets List */}
            {userAssets.length > 0 && (
              <Box>
                <Heading as="h3" size="sm" mb={4} color="gray.300">
                  Assets
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                  {userAssets.map((asset, index) => {
                    console.log(asset, "asset");
                    if (asset.balance === "0") return null;
                    return (
                      <Box
                        key={asset.tokenAddress || index}
                        bg="gray.900"
                        p={4}
                        rounded="md"
                        border="1px"
                        borderColor="gray.700"
                      >
                        <VStack align="start" gap={2}>
                          <HStack justify="space-between" w="full">
                            <Text fontWeight="semibold" fontSize="sm">
                              {asset.symbol || asset.name || "Unknown Token"}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              {asset.denom && `(${asset.denom})`}
                            </Text>
                          </HStack>

                          <Text fontSize="lg" fontWeight="bold" color="yellow">
                            {toDisplayAmount(
                              chainAssetsMap[asset.tokenAddress] as Asset,
                              new BigNumber(asset.balance)
                            ).toNumber()}{" "}
                            {asset.symbol}
                          </Text>

                          {asset.name && asset.name !== asset.symbol && (
                            <Text fontSize="xs" color="gray.500">
                              {asset.name}
                            </Text>
                          )}

                          <Text
                            fontSize="xs"
                            color="gray.600"
                            fontFamily="mono"
                            wordBreak="break-all"
                          >
                            {asset.tokenAddress}
                          </Text>
                        </VStack>
                      </Box>
                    );
                  })}
                </SimpleGrid>
              </Box>
            )}

            {account.publicKey && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Public Key:
                </Text>
                <Text
                  fontFamily="mono"
                  fontSize="sm"
                  color="gray.300"
                  wordBreak="break-all"
                  bg="gray.900"
                  p={3}
                  rounded="md"
                >
                  {account.publicKey}
                </Text>
              </Box>
            )}

            {account.validator && (
              <Box>
                <Text fontWeight="semibold" mb={2}>
                  Validator Information:
                </Text>
                <Box bg="gray.900" p={4} rounded="md">
                  <VStack gap={2} align="stretch">
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="semibold">
                        Status:
                      </Text>{" "}
                      {account.validator.status}
                    </Text>
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="semibold">
                        Voting Power:
                      </Text>{" "}
                      {account.validator.votingPower}
                    </Text>
                    <Text fontSize="sm">
                      <Text as="span" fontWeight="semibold">
                        Commission:
                      </Text>{" "}
                      {account.validator.commission}%
                    </Text>
                  </VStack>
                </Box>
              </Box>
            )}
          </VStack>
        </Box>

        {/* Recent Transactions Section */}
        <AccountTransactions address={address!} />
      </VStack>
    </Box>
  );
};
