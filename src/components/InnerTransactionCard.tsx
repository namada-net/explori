import { Box, Grid, GridItem } from "@chakra-ui/react";
import type { InnerTransaction } from "../types";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { TransactionStatusBadge } from "./TransactionStatusBadge";

type InnerTransactionCardProps = {
  innerTransaction: InnerTransaction;
};

export const InnerTransactionCard = ({
  innerTransaction,
}: InnerTransactionCardProps) => {
  return (
    <Grid
      templateColumns="60% 1fr 1fr"
      gap={4}
      w="100%"
      py={4}
      px={4}
      rounded="sm"
      bg="gray.800"
      borderLeft="4px solid"
      borderColor="yellow"
    >
      <Box bg="gray.800">
        <Data
          title="Inner TX Hash"
          content={<Hash hash={innerTransaction.txId} enableCopy={true} />}
        />
      </Box>
      <Data title="Kind" content={innerTransaction.kind || "unknown"} />
      <Data
        title="Exit Code"
        content={
          <TransactionStatusBadge
            exitCode={innerTransaction.exitCode || "unknown"}
          />
        }
      />
      <GridItem colSpan={3}>
        <Data title="Memo" content={innerTransaction.memo || "-"} />
      </GridItem>
      <GridItem colSpan={3}>
        <Data
          title="Data"
          content={
            <Box
              fontFamily="monospace"
              wordBreak="break-all"
              color="gray.300"
              bgColor="gray.900"
              p={2}
              rounded="sm"
              fontSize="sm"
            >
              {innerTransaction.data}
            </Box>
          }
        />
      </GridItem>
    </Grid>
  );
};
