import { Grid, Text, Box, useDisclosure } from "@chakra-ui/react";
import type { InnerTransaction } from "../types";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { TransactionDetailsData } from "./TransactionDetailsData";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { decodeHexAscii } from "../utils/transactions";
import { IbcDecoder, type IbcDisplayEvent } from "../utils/ibcDecoder";

// Map of transaction kinds to their display aliases
const TX_KIND_ALIASES: Record<string, string> = {
  bond: "Bond (Stake)",
  unshieldingTransfer: "Unshield",
  shieldingTransfer: "Shield",
  revealPk: "Reveal Public Key",
  transparentTransfer: "Transparent Transfer",
  unbond: "Unbond (Unstake)",
  ibcMsgTransfer: "Unknown IBC Message", // To be replaced with a more descriptive name after decoding the IBC event
  ibcUnshieldingTransfer: "IBC Unshielding Transfer",
  ibcShieldingTransfer: "IBC Shielding Transfer",
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
  const { open, onToggle } = useDisclosure({ defaultOpen: false });

  // Check if we need to parse and/or decode the IBC events from the block results
  const isIbcTransfer = innerTransaction.kind === "ibcMsgTransfer";

  let ibcDisplayEvent: IbcDisplayEvent | null = null;
  if (isIbcTransfer) {
    // decode the 'data' hex string into an ibc message
    const parsedData = JSON.parse(innerTransaction.data);
    ibcDisplayEvent = IbcDecoder.decodeIbcDisplayEvent(parsedData.data);
  }

  // Use IBC event name if available, otherwise use the transaction kind alias
  const displayKind = ibcDisplayEvent?.name || TX_KIND_ALIASES[innerTransaction.kind] || innerTransaction.kind || "unknown";

  // IBC event display with expandable functionality
  const formattedIbcEvent = (ibcEvent: IbcDisplayEvent) => {
    const jsonString = JSON.stringify(ibcEvent.message, null, 2);
    const lines = jsonString.split('\n');
    const previewLines = lines.slice(0, 5); // Show first 5 lines as preview
    const hasMoreLines = lines.length > 5;

    return (
      <Box
        cursor={hasMoreLines ? 'pointer' : 'default'}
        onClick={hasMoreLines ? onToggle : undefined}
        _hover={hasMoreLines ? { bg: 'gray.700' } : {}}
        p={2}
        rounded="md"
        transition="background-color 0.2s"
        position="relative"
        minWidth={400}
      >
        <Box position="relative">
          <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: open ? 'none' : '120px' }}>
            {open ? jsonString : (
              <>
                {previewLines.map((line, index) => (
                  <div
                    key={index}
                    style={{
                      color: `rgba(255, 255, 255, ${1 - (index * 0.15)})`,
                    }}
                  >
                    {line}
                  </div>
                ))}
              </>
            )}
          </pre>
          {!open && hasMoreLines && (
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              height="40px"
              background="linear-gradient(transparent, gray.800)"
              pointerEvents="none"
            />
          )}
        </Box>
        {!open && hasMoreLines && (
          <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
            {`(${lines.length - 5} more lines, click to expand)`}
          </Text>
        )}

      </Box>
    );
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
        {!ibcDisplayEvent &&
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
        }
        {ibcDisplayEvent &&
          <Data
            title="IBC Event Description"
            content={ibcDisplayEvent.description ?? "Not available"}
          />
        }
        {/* Memo field - placed last */}
        <Data title="Memo" content={decodeHexAscii(innerTransaction.memo || "") || "-"} />
        {ibcDisplayEvent &&
          <Data
            title="IBC Event Contents"
            content={formattedIbcEvent(ibcDisplayEvent)}
          />
        }
      </Grid>
    </Box>
  );
};
