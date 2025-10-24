import { formatTimestamp } from "../utils";
import { OverviewCard } from "../components/OverviewCard";
import { useBlockInfo } from "../queries/useBlockInfo";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
  Alert,
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { Hash } from "../components/Hash";
import { TransactionList } from "../components/TransactionList";
import { FaCubes } from "react-icons/fa6";
import { blockUrl } from "../routes";
import { useLatestBlock } from "../queries/useLatestBlock";
import { PageLink } from "../components/PageLink";
import { useMemo } from "react";
import { useAverageBlockTime } from "../queries/useAverageBlockTime";

export const BlockDetails = () => {
  const params = useParams();
  const latestBlock = useLatestBlock();
  const currentBlock = parseInt(params.block || "1");
  const blockDetails = useBlockInfo(parseInt(params.block || "1"));

  // Get average block time using the reusable hook
  const { avgBlockTime, isLoading: blockTimeLoading, latestBlockHeight } = useAverageBlockTime();

  // Check if this is a future block and calculate predicted time
  const isFutureBlock = latestBlockHeight && currentBlock > latestBlockHeight;
  const predictedTime = useMemo(() => {
    if (!isFutureBlock || !avgBlockTime || !latestBlockHeight) {
      return null;
    }
    const blocksAhead = currentBlock - latestBlockHeight;
    const timeAheadSeconds = blocksAhead * avgBlockTime; // avgBlockTime is already in seconds
    const currentTimeSeconds = Math.floor(Date.now() / 1000); // Convert current time to seconds since epoch
    return currentTimeSeconds + timeAheadSeconds; // Result in seconds, which formatTimestamp expects
  }, [isFutureBlock, avgBlockTime, latestBlockHeight, currentBlock]);
  return (
    <>
      <Heading
        as="h1"
        gap={2}
        size="xl"
        mb={4}
        color="cyan"
        position="relative"
      >
        <Flex gap={2} align="center" color="cyan">
          <FaCubes /> Block #{currentBlock}
        </Flex>

        <HStack
          gap={6}
          position="absolute"
          top={0}
          right={0}
          height="100%"
          fontSize="sm"
          color="gray.300"
        >
          {currentBlock !== parseInt(latestBlock.data?.block) && (
            <PageLink to={blockUrl(currentBlock + 1)}>
              Next
            </PageLink>
          )}
          {currentBlock > 1 && (
            <PageLink to={blockUrl(currentBlock - 1)}>
              Previous
            </PageLink>
          )}
        </HStack>
      </Heading>
      {blockDetails.isLoading && <Skeleton height="60px" width="100%" mb={4} />}

      {/* Show future block prediction */}
      {isFutureBlock && (
        <Alert.Root status="info" mb={4}>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Future Block Prediction</Alert.Title>
            <Alert.Description>
              This block hasn't been mined yet. Based on the current average block time of {blockTimeLoading ? 'calculating...' : avgBlockTime ? `${avgBlockTime.toFixed(1)}s` : 'calculating...'},
              this block is estimated to be created {predictedTime ? `at ${formatTimestamp(predictedTime)}` : 'soon'}.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Show prediction cards for future blocks */}
      {isFutureBlock && predictedTime && (
        <VStack gap={8} align="start">
          <HStack>
            <OverviewCard title="Estimated Creation Time" isLoading={false}>
              {formatTimestamp(predictedTime)}
            </OverviewCard>
            <OverviewCard title="Blocks Ahead" isLoading={false}>
              {latestBlockHeight ? currentBlock - latestBlockHeight : 0}
            </OverviewCard>
          </HStack>
          <Box w="100%" flex="1">
            <Text color="gray.500" fontSize="sm">
              This block hasn't been created yet. The information above is a prediction based on current block timing.
            </Text>
          </Box>
        </VStack>
      )}

      {blockDetails.data && (
        <VStack gap={8} align="start">
          <HStack>
            <OverviewCard title="Created at" isLoading={blockDetails.isLoading}>
              {formatTimestamp(blockDetails.data?.timestamp)}
            </OverviewCard>
            <OverviewCard title="Hash" isLoading={blockDetails.isLoading}>
              <Hash hash={blockDetails.data?.hash} enableCopy={true} />
            </OverviewCard>
          </HStack>
          <Box w="100%" flex="1">
            <Heading as="h2" size="lg" mb={2}>
              Transactions
            </Heading>
            {blockDetails.data?.transactions.length === 0 ? (
              <Text color="gray.500" fontSize="sm">
                No transactions in this block
              </Text>
            ) : (
              <TransactionList txHashes={blockDetails.data?.transactions} />
            )}
          </Box>
        </VStack>
      )}
    </>
  );
};
