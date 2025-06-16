import { useLatestBlock } from "../queries/useLatestBlock";
import { OverviewCard } from "../components/OverviewCard";
import {
  Box,
  Flex,
  Heading,
  HStack,
  SkeletonText,
  VStack,
} from "@chakra-ui/react";
import { useLatestEpoch } from "../queries/useLatestEpoch";
import { BlockList } from "../components/BlockList";
import { FaListAlt } from "react-icons/fa";
import { FaCubes } from "react-icons/fa6";

export const Index = () => {
  const latestBlock = useLatestBlock();
  const latestEpoch = useLatestEpoch();
  return (
    <VStack gap={8} align="start">
      <Box>
        <Heading as="h1" size="xl" mb={3}>
          <Flex gap={2} align="center" color="cyan">
            <FaListAlt />
            Overview
          </Flex>
        </Heading>
        <HStack columns={3}>
          <OverviewCard title="Latest Block" isLoading={latestBlock.isLoading}>
            {latestBlock.data?.block}
          </OverviewCard>
          <OverviewCard title="Latest Epoch" isLoading={latestEpoch.isLoading}>
            {latestEpoch.data?.epoch}
          </OverviewCard>
        </HStack>
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
