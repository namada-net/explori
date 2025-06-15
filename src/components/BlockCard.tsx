import { useBlockInfo } from "../queries/useBlockInfo";
import { Grid } from "@chakra-ui/react";
import { Data } from "./Data";
import { fromUnixTime } from "date-fns";
import { useNavigate } from "react-router";
import { blockUrl } from "../routes";
import { formatTimestamp } from "../utils";
import { Hash } from "./Hash";

type BlockCardProps = {
  blockHeight: number;
};

export const BlockCard = ({ blockHeight }: BlockCardProps) => {
  const block = useBlockInfo(blockHeight);
  const navigate = useNavigate();

  if (block.isLoading && !block.data) {
    return <></>;
  }

  return (
    <Grid
      gap={4}
      w="100%"
      bg="gray.800"
      py={4}
      px={6}
      rounded="sm"
      cursor="pointer"
      templateColumns="60% 1fr 1fr"
      _hover={{ bg: "gray.700" }}
      onClick={() => navigate(blockUrl(blockHeight))}
    >
      <Data
        title={`Block #${blockHeight}`}
        content={<Hash hash={block.data?.hash} />}
      />
      <Data
        title="Created at"
        content={formatTimestamp(block.data?.timestamp)}
      />
      <Data
        title="Number of Txs"
        content={block.data?.transactions.length || 0}
      />
    </Grid>
  );
};
