import { Box, Flex, Heading, SkeletonText } from "@chakra-ui/react";
import { FaVoteYea } from "react-icons/fa";
import { useProposals } from "../queries/useProposals";
import { ProposalList } from "../components/ProposalList";

export const Proposals = () => {
  const proposals = useProposals();
  return (
    <Box w="100%">
      <Heading as="h1" size="xl" mb={2} color="cyan">
        <Flex gap={2} align="center">
          <FaVoteYea />
          Governance Proposals
        </Flex>
      </Heading>
      {proposals.isLoading ? (
        <SkeletonText height="20px" width="100%" noOfLines={4} />
      ) : (
        <ProposalList
          proposals={proposals.data ?? []}
          proposalsPerPage={10}
        />
      )}
    </Box>
  );
};
