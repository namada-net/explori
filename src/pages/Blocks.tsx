import { Box, Flex, Heading, SkeletonText } from "@chakra-ui/react";
import { FaCubes } from "react-icons/fa6";
import { useLatestBlock } from "../queries/useLatestBlock";
import { BlockList } from "../components/BlockList";

export const Blocks = () => {
  const latestBlock = useLatestBlock();
  return (
    <Box w="100%">
      <Heading as="h1" size="xl" mb={2} color="cyan">
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
  );
};
