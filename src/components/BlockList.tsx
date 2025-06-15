import { VStack } from "@chakra-ui/react";
import { BlockCard } from "./BlockCard";
import { useState } from "react";
import { BlockPagination } from "./BlockPagination";

type BlockListProps = {
  lastBlockNumber: number;
  blocksPerPage?: number;
};

export const BlockList = ({
  lastBlockNumber,
  blocksPerPage = 10,
}: BlockListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const renderBlocks = (page: number) => {
    const startBlock = lastBlockNumber - (page - 1) * blocksPerPage;
    const endBlock = Math.max(startBlock - blocksPerPage + 1, 1);
    const blocks = [];
    for (let n = startBlock; n >= endBlock; n--) {
      blocks.push(<BlockCard key={n} blockHeight={n} />);
    }
    return blocks;
  };

  return (
    <VStack gap={3} align="start" w="100%">
      {renderBlocks(currentPage)}
      <BlockPagination
        lastBlockNumber={lastBlockNumber}
        blocksPerPage={blocksPerPage}
        currentPage={currentPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </VStack>
  );
};
