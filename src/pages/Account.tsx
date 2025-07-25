import { useParams, useNavigate } from "react-router";
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
  Flex,
  Grid,
  GridItem,
  Table,
  Skeleton,
} from "@chakra-ui/react";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { toDisplayAmount, formatNumberWithCommasAndDecimals } from "../utils";
import type { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { AccountTransactions } from "../components/AccountTransactions";
import { FaWallet } from "react-icons/fa6";
import { OverviewCard } from "../components/OverviewCard";
import { Hash } from "../components/Hash";
import { useAccountTransactions } from "../queries/useAccountTransactions";
import { useDelegations } from "../queries/useDelegations";
import type { CombinedDelegation } from "../queries/useDelegations";

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
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>();

  const {
    data: account,
    isLoading: accountLoading,
    error: accountError,
  } = useAccount(address!);

  const { data: chainAssetsMap, isLoading: chainAssetsLoading } =
    useChainAssetsMap();

  const { data: delegations, error: delegationsError, isLoading: delegationsLoading } =
    useDelegations(address!);

  const { data: transactionsData } = useAccountTransactions(address ?? "");

  const isLoading = accountLoading || chainAssetsLoading;
  const totalTransactionCount = transactionsData?.pagination.totalItems || 0;

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
        asset.symbol === "NAM" || asset.name?.toLowerCase().includes("namada"),
    );

    return nativeAsset?.balance || "0";
  }, [userAssets]);

  const formatAmount = (amount: string | number) => {
    if (!amount) return "0";
    return (parseFloat(amount.toString()) / 10 ** 6).toLocaleString(undefined, {
      minimumFractionDigits: 6,
    });
  };

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
    <>
      <Heading as="h1" size="xl" color="cyan" mb={3}>
        <Flex gap={2} align="center">
          <FaWallet />
          Account Details
        </Flex>
      </Heading>

      <VStack gap={8} align="stretch">
        <Grid templateColumns="1fr 1fr 1fr 1fr 1fr" gap={2}>
          <GridItem colSpan={2}>
            <OverviewCard title="Address">
              <Hash hash={address || "-"} enableCopy />
            </OverviewCard>
          </GridItem>
          <OverviewCard title="Balance (Native Token)">
            {toDisplayAmount(
              namadaAssets.assets[0] as Asset,
              new BigNumber(nativeTokenBalance),
            ).toFixed(3)}{" "}
            NAM
          </OverviewCard>
          <OverviewCard title="Transaction Count">
            {totalTransactionCount || 0}
          </OverviewCard>
          <OverviewCard title="Total Assets">
            {userAssets.filter((asset) => asset.balance !== "0").length}
          </OverviewCard>
        </Grid>

        <VStack gap={3} align="start">
          <Heading as="h2" size="lg" color="white">
            User Assets
          </Heading>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "1fr 1fr",
              lg: "1fr 1fr 1fr 1fr",
            }}
            gap={2}
          >
            {/* Assets List */}
            {userAssets.length > 0 &&
              userAssets.map((asset) => {
                if (asset.balance === "0") return null;
                return (
                  <Box
                    key={asset.tokenAddress}
                    bg="gray.950"
                    p={4}
                    rounded="sm"
                  >
                    <VStack align="start" gap={2}>
                      <HStack justify="space-between" w="full">
                        <Text
                          color="yellow"
                          fontWeight="semibold"
                          fontSize="sm"
                        >
                          {asset.symbol || asset.name || "Unknown Token"}
                        </Text>
                        <Text fontSize="xs" color="gray.400">
                          {asset.denom && `(${asset.denom})`}
                        </Text>
                      </HStack>

                      <Text fontSize="lg">
                        {formatNumberWithCommasAndDecimals(toDisplayAmount(
                          chainAssetsMap[asset.tokenAddress] as Asset,
                          new BigNumber(asset.balance),
                        ))}{" "}
                        {asset.symbol}
                      </Text>

                      {asset.name && asset.name !== asset.symbol && (
                        <Text fontSize="sm" color="gray.400">
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
          </Grid>
        </VStack>

        <VStack gap={3} align="strech">
          <Heading as="h2" size="lg" color="white">
            Recent Transactions
          </Heading>
          <AccountTransactions address={address} />
        </VStack>

        {/* Bonds Table */}

        <Heading as="h2" size="lg" color="white">
          Delegations ({delegations.length})
        </Heading>

        {delegationsError ?
          (
            <Box bg="red.700" color="white" p={4} rounded="md" width="fit-content">
              <Text fontWeight="semibold">Error</Text>
              <Text>
                Failed to load account delegations. Please try again later.
              </Text>
            </Box>
          ) :
          delegationsLoading || !address ? (
            <Skeleton height="90px" width="100%" />
          ) : (
            <Box overflowX="auto" bg="gray.900" rounded="md">
              <Table.Root variant="outline" size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader color="gray.300">
                      Validator
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300" textAlign="right">
                      Total Delegation
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300" textAlign="right">
                      Bonding
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300" textAlign="right">
                      Unbonding
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {delegations.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={4} textAlign="center" py={8}>
                        <Text color="gray.400">No delegations found</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    delegations.map((bond: CombinedDelegation, index: number) => (
                      <Table.Row key={bond.validatorAddress || index}>
                        <Table.Cell>
                          <Text
                            fontFamily="mono"
                            fontSize="sm"
                            color="blue.300"
                            cursor="pointer"
                            _hover={{
                              color: "blue.200",
                              textDecoration: "underline",
                            }}
                            onClick={() =>
                              navigate(`/validators/${bond.validatorAddress}`)
                            }
                          >
                            {bond.validatorName}
                          </Text>
                        </Table.Cell>
                        <Table.Cell
                          textAlign="right"
                          color="yellow.400"
                          fontWeight="semibold"
                        >
                          {formatAmount(bond.delegationTotal)}
                        </Table.Cell>
                        <Table.Cell textAlign="right" color="green.400">
                          {bond.bondingAmount ? formatAmount(bond.bondingAmount) : ""}
                        </Table.Cell>
                        <Table.Cell textAlign="right" color="orange.400">
                          {bond.unbondingAmount ? formatAmount(bond.unbondingAmount) : ""}
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          )}

      </VStack>
    </>
  );
};
