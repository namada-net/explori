import { VStack } from "@chakra-ui/react";
import { BlockCard } from "./BlockCard";
import { useState } from "react";
import { Pagination } from "./Pagination";

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
    <VStack gap={2} align="start" w="100%">
      {renderBlocks(currentPage)}
      <Pagination
        count={lastBlockNumber}
        currentPage={currentPage}
        pageSize={blocksPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </VStack>
  );
};
