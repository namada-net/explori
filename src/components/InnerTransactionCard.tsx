import { Grid, Text, Box } from "@chakra-ui/react";
import type { InnerTransaction } from "../types";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { TransactionDetailsData } from "./TransactionDetailsData";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { decodeHexAscii } from "../utils/transactions";
import { useBlockResults } from '../queries/useBlockResults';
import { IbcEventDecoder } from '../utils/ibc-decoder';

// Map of transaction kinds to their display aliases
const TX_KIND_ALIASES: Record<string, string> = {
  bond: "Bond (Stake)",
  unshieldingTransfer: "Unshield",
  shieldingTransfer: "Shield",
  revealPk: "Reveal Public Key",
  transparentTransfer: "Transparent Transfer",
  unbond: "Unbond (Unstake)",
  ibcMsgTransfer: "Unknown IBC Message", // TODO: placeholder
  ibcTransparentTransfer: "IBC Transfer",
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
  blockHeight?: number;
};

export const InnerTransactionCard = ({
  innerTransaction,
  wrapperTxData,
  blockHeight,
}: InnerTransactionCardProps) => {
  const displayKind = TX_KIND_ALIASES[innerTransaction.kind] || innerTransaction.kind || "unknown";
  const { data: blockResults } = useBlockResults(blockHeight);

  // Check if we need to parse and/or decode the IBC events from the block results
  const isIbcTransfer = innerTransaction.kind === "ibcMsgTransfer";
  let decodedEvent: any = null;
  if (isIbcTransfer) {
    // Decode IBC event from block results if possible
    decodedEvent = IbcEventDecoder.decodeIbcEventByTxHash(
      innerTransaction.txId ?? "", 
      blockResults
    );
  }

  // Add IBC event display
  const formattedIbcEvent = (decodedEvent: any) => {
    if (decodedEvent) {
      return <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
        {JSON.stringify(decodedEvent, null, 2)}
      </pre>;
    }
    return <span>No IBC event found</span>;
  };

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
        <Data
          title="IBC event"
          content={formattedIbcEvent(decodedEvent)}
        />
        {/* Memo field - placed last */}
        <Data title="Memo" content={decodeHexAscii(innerTransaction.memo || "") || "-"} />
      </Grid>
    </Box>
  );
};
