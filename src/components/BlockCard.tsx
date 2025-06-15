import { useBlockInfo } from "../queries/useBlockInfo";
import { Box, Grid } from "@chakra-ui/react";
import { Data } from "./Data";
import { fromUnixTime } from "date-fns";

type BlockCardProps = {
  blockHeight: number;
};

export const BlockCard = ({ blockHeight }: BlockCardProps) => {
  const block = useBlockInfo(blockHeight);

  if (block.isLoading && !block.data) {
    return <></>;
  }

  const date = fromUnixTime(block.data?.timestamp);
  return (
    <Grid
      gap={4}
      w="100%"
      bg="gray.800"
      py={4}
      px={6}
      rounded="sm"
      templateColumns="60% 1fr 1fr"
    >
      <Data
        title={`Block #${blockHeight}`}
        content={
          <Box color="gray.400" as="span">
            {block.data?.hash}
          </Box>
        }
      />
      <Data title="Created at" content={date.toLocaleString()} />
      <Data
        title="Number of Txs"
        content={block.data?.transactions.length || 0}
      />
    </Grid>
  );
};
