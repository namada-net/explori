import { useLatestBlock } from "../queries/useLatestBlock";
import { OverviewCard } from "../components/OverviewCard";
import { Box, Heading, HStack } from "@chakra-ui/react";
import { useLatestEpoch } from "../queries/useLatestEpoch";

export const Index = () => {
  const latestBlock = useLatestBlock();
  const latestEpoch = useLatestEpoch();
  return (
    <Box>
      <Box>
        <Heading as="h1" size="xl" mb={2}>
          Overview
        </Heading>
        <HStack columns={3}>
          <OverviewCard title="Latest Block" isLoading={latestBlock.isLoading}>
            {latestBlock.data?.block}
          </OverviewCard>
          <OverviewCard title="Latest Epoch" isLoading={latestEpoch.isLoading}>
            {latestEpoch.data?.epoch}
          </OverviewCard>
        </HStack>
      </Box>
    </Box>
  );
};
