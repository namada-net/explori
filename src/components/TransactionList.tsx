import { Text, VStack } from "@chakra-ui/react";
import { TransactionCard } from "./TransactionCard";

type TransactionListProps = {
  txHashes: string[];
};

export const TransactionList = ({ txHashes }: TransactionListProps) => {
  if (!txHashes || txHashes.length === 0) {
    return <Text color="gray.500">No transactions available</Text>;
  }

  return (
    <VStack gap={2} align="start">
      {txHashes.map((hash) => (
        <TransactionCard key={hash} hash={hash} />
      ))}
    </VStack>
  );
};
