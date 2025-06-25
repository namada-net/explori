import { Grid } from "@chakra-ui/react";
import type { InnerTransaction } from "../types";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { TransactionDetailsData } from "./TransactionDetailsData";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { decodeHexAscii } from "../utils/transactions";

type InnerTransactionCardProps = {
  innerTransaction: InnerTransaction;
};

export const InnerTransactionCard = ({
  innerTransaction,
}: InnerTransactionCardProps) => {
  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
      gap={4}
      w="100%"
      py={4}
      px={4}
      rounded="sm"
      bg="gray.800"
      borderLeft="2px solid"
      borderColor="yellow"
      overflow="auto"
    >
      <Data
        title="Inner TX Hash"
        content={<Hash hash={innerTransaction.txId} enableCopy={true} />}
      />
      <Data
        title="Exit Code"
        content={
          <TransactionStatusBadge
            exitCode={innerTransaction.exitCode || "unknown"}
          />
        }
      />
      <Data title="Kind" content={innerTransaction.kind || "unknown"} />
      <Data title="Memo" content={decodeHexAscii(innerTransaction.memo || "") || "-"} />
      <TransactionDetailsData details={JSON.parse(innerTransaction.data)} />
    </Grid>
  );
};
