import { Grid, Text, Box } from "@chakra-ui/react";
import type { InnerTransaction } from "../types";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { TransactionDetailsData } from "./TransactionDetailsData";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { decodeHexAscii } from "../utils/transactions";

// Map of transaction kinds to their display aliases
const TX_KIND_ALIASES: Record<string, string> = {
  bond: "Bond (Stake)",
  unshieldingTransfer: "Unshield",
  shieldingTransfer: "Shield",
  revealPk: "Reveal Public Key",
  transparentTransfer: "Transparent Transfer",
  unbond: "Unbond (Unstake)",
  ibcTransparentTransfer: "IBC Transfer (transparent)",
  claimRewards: "Claim Staking Rewards",
};

type WrapperTxData = {
  kind?: string;
  feePayer?: string;
  amountPerGasUnit?: string;
  gasLimit?: string;
  feeToken?: string;
};

type InnerTransactionCardProps = {
  innerTransaction: InnerTransaction;
  wrapperTxData?: WrapperTxData;
};

export const InnerTransactionCard = ({
  innerTransaction,
  wrapperTxData,
}: InnerTransactionCardProps) => {
  const displayKind = TX_KIND_ALIASES[innerTransaction.kind] || innerTransaction.kind || "unknown";

  return (
    <Box
      w="100%"
      py={4}
      px={4}
      rounded="sm"
      bg="gray.800"
      borderLeft="2px solid"
      borderColor="yellow"
      overflow="auto"
      position="relative"
    >
      {/* Transaction Kind - Top Left Corner */}
      <Text
        color="cyan"
        fontSize="lg"
        fontWeight="semibold"
        mb={4}
      >
        {displayKind}
      </Text>

      <Grid
        templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
        gap={4}
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
        <TransactionDetailsData
          details={JSON.parse(innerTransaction.data)}
          wrapperContext={{
            kind: innerTransaction.kind,  // This should be the inner tx kind like "unshieldingTransfer"
            feePayer: wrapperTxData?.feePayer,
            amountPerGasUnit: wrapperTxData?.amountPerGasUnit,
            gasLimit: wrapperTxData?.gasLimit,
            feeToken: wrapperTxData?.feeToken,
          }}
        />
        {/* Memo field - placed last */}
        <Data title="Memo" content={decodeHexAscii(innerTransaction.memo || "") || "-"} />
      </Grid>
    </Box>
  );
};
