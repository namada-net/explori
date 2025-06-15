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
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { Hash } from "../components/Hash";
import { TransactionList } from "../components/TransactionList";
import { FaCubes } from "react-icons/fa6";

export const BlockDetails = () => {
  const params = useParams();
  const blockDetails = useBlockInfo(parseInt(params.block || "1"));

  return (
    <>
      <Heading as="h1" gap={2} size="xl" mb={4} color="cyan">
        <Flex gap={2} align="center" color="cyan">
          <FaCubes /> Block #{params.block}
        </Flex>
      </Heading>
      {blockDetails.isLoading && <Skeleton height="60px" width="100%" mb={4} />}
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
              <Text color="gray.500">No transactions in this block</Text>
            ) : (
              <TransactionList txHashes={blockDetails.data?.transactions} />
            )}
          </Box>
        </VStack>
      )}
    </>
  );
};
