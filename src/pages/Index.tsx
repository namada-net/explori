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
import { useBlockInfo } from "../queries/useBlockInfo";
import { BlockList } from "../components/BlockList";
import { FaListAlt } from "react-icons/fa";
import { FaCubes } from "react-icons/fa6";
import { NAMADA_ADDRESS, PGF_ADDRESS, toDisplayAmount, toDisplayAmountFancy, formatNumberWithCommas } from "../utils";
import namadaAssets from "@namada/chain-registry/namada/assetlist.json";
import type { Asset } from "@chain-registry/types";
import BigNumber from "bignumber.js";
import { useMemo } from "react";

export const Index = () => {
  const latestBlock = useLatestBlock();
  const latestEpoch = useLatestEpoch();
  const chainParameters = useChainParameters();
  const pgfBalance = useAccount(PGF_ADDRESS);
  const namSupply = useTokenSupply(NAMADA_ADDRESS);
  const votingPower = useVotingPower();

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

  // Calculate average block time
  const windowSize = 5;
  const latestBlockInfo = useBlockInfo(latestBlock.data?.block - 1);
  const previousBlockInfo = useBlockInfo(latestBlock.data?.block ? latestBlock.data?.block - 1 - windowSize : null);
  const avgBlockTime = latestBlockInfo?.data?.timestamp && previousBlockInfo?.data?.timestamp ? 
    (latestBlockInfo.data.timestamp - previousBlockInfo.data.timestamp) / windowSize : null;
  
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
          <OverviewCard title="Block Time" isLoading={previousBlockInfo?.isLoading}>
            {avgBlockTime ? `${avgBlockTime.toFixed(1)}s` : ""}
          </OverviewCard>
          <OverviewCard title="Effective Supply (NAM)" isLoading={namSupply.isLoading}>
            {toDisplayAmountFancy(namadaAssets.assets[0] as Asset, new BigNumber(namSupply.data?.effectiveSupply))}
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
