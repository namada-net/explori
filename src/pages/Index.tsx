import { useLatestBlock } from "../queries/useLatestBlock";
import { OverviewCard } from "../components/OverviewCard";
import {
  Box,
  Flex,
  Grid,
  Heading,
  SkeletonText,
  VStack,
} from "@chakra-ui/react";
import { useLatestEpoch } from "../queries/useLatestEpoch";
import { useChainParameters } from "../queries/useChainParameters";
import { useAccount } from "../queries/useAccount";
import { useTokenSupply } from "../queries/useTokenSupply";
import { useVotingPower } from "../queries/useVotingPower";
import { useOsmosisPrices } from "../queries/useOsmosisPrices";
import { BlockList } from "../components/BlockList";
import { FaListAlt } from "react-icons/fa";
import { FaCubes } from "react-icons/fa6";
import { NAMADA_ADDRESS, PGF_ADDRESS, toDisplayAmount, toDisplayAmountFancy, formatNumberWithCommas, MASP_ADDRESS } from "../utils";
import namadaAssets from "@namada/chain-registry/namada/assetlist.json";
import type { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { useMemo } from "react";
import { useChainAssetsMap } from "../queries/useChainAssetsMap";
import { useAverageBlockTime } from "../queries/useAverageBlockTime";

export const Index = () => {
  const latestBlock = useLatestBlock();
  const latestEpoch = useLatestEpoch();
  const chainParameters = useChainParameters();
  const pgfBalance = useAccount(PGF_ADDRESS);
  const maspBalances = useAccount(MASP_ADDRESS);
  const namSupply = useTokenSupply(NAMADA_ADDRESS);
  const votingPower = useVotingPower();
  const { data: prices, isLoading: pricesLoading, error: pricesError } = useOsmosisPrices(0); // disable automatic refetch
  const { data: chainAssetsMap } = useChainAssetsMap();
  const { avgBlockTime, isLoading: blockTimeLoading } = useAverageBlockTime();

  // Calculate masp tvl for non-native and native assets separately
  const { maspTvlNonNative, maspTvlNative } = useMemo(() => {
    if (!maspBalances.data || !prices || !chainAssetsMap) {
      return { maspTvlNonNative: null, maspTvlNative: null };
    }

    let nonNativeTvl = 0;
    let nativeTvl = 0;

    for (const balance of maspBalances.data) {
      // Find the matching asset in chain assets map
      const asset = chainAssetsMap[balance.tokenAddress];
      if (!asset) {
        console.warn(`Asset not found for token address: ${balance.tokenAddress}`);
        continue;
      }

      // Find the matching price entry
      const priceEntry = prices.find(price => price.address === balance.tokenAddress);
      if (!priceEntry || !priceEntry.priceUsdc) {
        console.warn(`Price not found for token: ${asset.symbol || balance.tokenAddress}`);
        continue;
      }

      // Find the asset in namada assets for toDisplayAmount function
      const namadaAsset = namadaAssets.assets.find(namadaAsset =>
        namadaAsset.address === balance.tokenAddress
      ) as Asset | undefined;

      if (!namadaAsset) {
        console.warn(`Namada asset not found for token: ${balance.tokenAddress}`);
        continue;
      }

      // Calculate denominated amount
      const denominatedAmt = toDisplayAmount(namadaAsset, new BigNumber(balance.minDenomAmount)).toNumber();

      // Calculate value in USDC
      const value = denominatedAmt * priceEntry.priceUsdc;

      // Add to appropriate total based on whether it's NAM or not
      if (balance.tokenAddress === NAMADA_ADDRESS) {
        nativeTvl += value;
      } else {
        nonNativeTvl += value;
      }
    }

    return { maspTvlNonNative: nonNativeTvl, maspTvlNative: nativeTvl };
  }, [maspBalances.data, prices, chainAssetsMap]);

  const pgfBalanceNam = pgfBalance.data?.find((b: any) => b.tokenAddress === NAMADA_ADDRESS)?.minDenomAmount ?? null;

  // Calculate staked NAM percentage
  const stakedNam = votingPower.data?.totalVotingPower ?? null;
  const denomSupply = useMemo(() => {
    if (!namSupply.data?.effectiveSupply) return 0;
    return toDisplayAmount(namadaAssets.assets[0] as Asset, new BigNumber(namSupply.data.effectiveSupply)).toNumber();
  }, [namSupply.data?.effectiveSupply]);
  const stakedNamPercentage = useMemo(() => {
    return stakedNam && denomSupply ? (stakedNam / denomSupply * 100).toFixed(2) : null;
  }, [stakedNam, denomSupply]);


  return (
    <VStack gap={8} align="start">
      <Box>
        <Heading as="h1" size="xl" mb={3}>
          <Flex gap={2} align="center" color="cyan">
            <FaListAlt />
            Overview
          </Flex>
        </Heading>

        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)"
          }}
          gap={2}
          w="100%"
        >
          <OverviewCard title="Chain ID" isLoading={chainParameters.isLoading}>
            {chainParameters.data?.chainId}
          </OverviewCard>
          <OverviewCard title="Latest Block" isLoading={latestBlock.isLoading}>
            {latestBlock.data?.block}
          </OverviewCard>
          <OverviewCard title="Latest Epoch" isLoading={latestEpoch.isLoading}>
            {latestEpoch.data?.epoch}
          </OverviewCard>
          <OverviewCard title="Block Time" isLoading={blockTimeLoading}>
            {avgBlockTime ? `${avgBlockTime.toFixed(1)}s` : ""}
          </OverviewCard>
          <OverviewCard title="Effective Supply (NAM)" isLoading={namSupply.isLoading}>
            {toDisplayAmountFancy(namadaAssets.assets[0] as Asset, new BigNumber(namSupply.data?.effectiveSupply))}
          </OverviewCard>
          <OverviewCard title="MASP TVL (Non-native)" isLoading={pricesLoading}>
            {maspTvlNonNative && !pricesError ? maspTvlNonNative
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) : "Not available"}
          </OverviewCard>
          <OverviewCard title="MASP TVL (Native)" isLoading={pricesLoading}>
            {maspTvlNative && !pricesError ? maspTvlNative
              .toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) : "Not available"}
          </OverviewCard>
          <OverviewCard title="Staked (NAM)" isLoading={votingPower.isLoading || namSupply.isLoading}>
            {formatNumberWithCommas(votingPower.data?.totalVotingPower ?? 0)} ({stakedNamPercentage}%)
          </OverviewCard>
          <OverviewCard title="Staking APR" isLoading={chainParameters.isLoading}>
            {(chainParameters.data?.apr * 100).toFixed(2)}%
          </OverviewCard>
          <OverviewCard title="PGF Balance" isLoading={pgfBalance.isLoading}>
            {toDisplayAmountFancy(namadaAssets.assets[0] as Asset, new BigNumber(pgfBalanceNam))}
          </OverviewCard>
        </Grid>
      </Box>

      <Box w="100%">
        <Heading as="h1" size="xl" mb={3} color="cyan">
          <Flex gap={2} align="center">
            <FaCubes />
            Latest blocks
          </Flex>
        </Heading>
        {latestBlock.isLoading ? (
          <SkeletonText height="20px" width="100%" noOfLines={4} />
        ) : (
          <BlockList
            lastBlockNumber={latestBlock.data?.block}
            blocksPerPage={10}
          />
        )}
      </Box>
    </VStack>
  );
};
