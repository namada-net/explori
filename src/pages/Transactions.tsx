import { Box, Flex, Grid, Heading, Spinner, VStack } from "@chakra-ui/react";
import { IoSwapHorizontal } from "react-icons/io5";
import { Data } from "../components/Data";
import { PageLink } from "../components/PageLink";
import { TransactionStatusBadge } from "../components/TransactionStatusBadge";
import { useBlockInfo } from "../queries/useBlockInfo";
import { useLatestBlock } from "../queries/useLatestBlock";
import { useTransaction } from "../queries/useTransaction";
import { blockUrl, transactionUrl } from "../routes";
import { shortenHashOrAddress } from "../utils";

const TransactionEntry = ({ txId }: { txId: string }) => {
  const { data, isLoading } = useTransaction(txId);

  if (isLoading || !data) {
    return <></>;
  }

  return (
    <Box width="100%" height={73} bg="gray.800" rounded="sm" py={4} px={6}>
      <Grid gap={4} templateColumns="60% 1fr 1fr">
        <Data
          title="Transaction hash"
          content={
            <PageLink to={transactionUrl(data.txId)}>
              {shortenHashOrAddress(data.txId, 15)}
            </PageLink>
          }
        />
        <Data
          title="Block #"
          content={
            <PageLink to={blockUrl(data.blockHeight)}>
              {data.blockHeight}
            </PageLink>
          }
        />
        <Data
          title="Exit Code"
          content={<TransactionStatusBadge exitCode={data.exitCode} />}
        />
      </Grid>
    </Box>
  );
};

const BlockTransactions = ({ blockHeight }: { blockHeight: number }) => {
  const block = useBlockInfo(blockHeight);
  if (block.isLoading || !block.data) {
    return <></>;
  }
  return (
    <>
      {block.data.transactions.map((txHash: string) => (
        <TransactionEntry key={txHash} txId={txHash} />
      ))}
    </>
  );
};

const LatestBlockTransactions = ({
  lastBlockNumber,
  blocksPerPage = 10,
}: {
  lastBlockNumber: number;
  blocksPerPage?: number;
}) => {
  const renderBlocks = (page: number) => {
    const startBlock = lastBlockNumber - (page - 1) * blocksPerPage;
    const endBlock = Math.max(startBlock - blocksPerPage + 1, 1);
    const blocks = [];
    for (let n = startBlock; n >= endBlock; n--) {
      blocks.push(<BlockTransactions key={n} blockHeight={n} />);
    }
    return blocks;
  };
  return (
    <VStack gap={2} align="start" w="100%">
      {renderBlocks(1)}
    </VStack>
  );
};

export const Transactions = () => {
  const latestBlock = useLatestBlock();
  return (
    <Box w="100%">
      <Heading as="h1" size="xl" mb={2} color="cyan">
        <Flex gap={2} align="center">
          <IoSwapHorizontal />
          Latest transactions
        </Flex>
      </Heading>
      {latestBlock.isLoading ? (
        <Spinner />
      ) : (
        <LatestBlockTransactions lastBlockNumber={latestBlock.data?.block} />
      )}
    </Box>
  );
};
