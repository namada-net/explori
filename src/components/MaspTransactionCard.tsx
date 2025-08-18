import { Box, Grid, Skeleton, VStack } from "@chakra-ui/react";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { AccountLink } from "./AccountLink";
import { useNavigate } from "react-router";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { transactionUrl } from "../routes";

type MaspTransactionCardProps = {
  hash: string;
  // Placeholder props - will be replaced with actual MASP transaction data
  isLoading?: boolean;
  isError?: boolean;
  data?: {
    txId: string;
    exitCode: string;
    feePayer: string;
    maspType: string; // e.g., "transfer", "conversion", "mint", "burn"
    asset: string;
    amount: string;
  };
};

export const MaspTransactionCard = ({ 
  hash, 
  isLoading = false, 
  isError = false, 
  data 
}: MaspTransactionCardProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <Skeleton h="60px" w="100%" />;
  }

  if (isError) {
    return <Box>Error loading MASP transaction</Box>;
  }

  return (
    <Grid
      gap={2}
      w="100%"
      bg="gray.800"
      py={4}
      px={6}
      rounded="sm"
      templateColumns="2fr 1fr 1fr 1fr 1fr"
      cursor="pointer"
      _hover={{ bg: "gray.700" }}
      onClick={() => navigate(transactionUrl(hash))}
    >
      <Data
        title="Hash"
        content={
          <VStack align="start" gap={1}>
            <Hash hash={data?.txId || hash} />
          </VStack>
        }
      />
      <Data
        title="MASP Type"
        content={data?.maspType || "Unknown"}
      />
      <Data
        title="Status"
        content={
          <TransactionStatusBadge
            exitCode={data?.exitCode || "unknown"}
          />
        }
      />
      <Data
        title="Asset"
        content={data?.asset || "Unknown"}
      />
      <Data
        title="Fee payer"
        content={<AccountLink address={data?.feePayer || "Unknown"} />}
      />
    </Grid>
  );
};
