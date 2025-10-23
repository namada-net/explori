import { Box, Flex, Heading, SkeletonText, VStack, Text } from "@chakra-ui/react";
import { FaVoteYea } from "react-icons/fa";
import { useState } from "react";
import { useProposals } from "../queries/useProposals";
import { ProposalCard } from "../components/ProposalCard";
import { Pagination } from "../components/Pagination";
import type { ProposalResponse } from "../types";

export const Proposals = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProposals(page);

  const proposalsList: ProposalResponse[] = data?.results || [];
  const totalItems = data?.pagination?.totalItems || 0;
  const perPage = data?.pagination?.perPage || 30;
  const totalPages = data?.pagination?.totalPages || 1;

  return (
    <Box w="100%">
      <Heading as="h1" size="xl" mb={2} color="cyan">
        <Flex gap={2} align="center">
          <FaVoteYea />
          Governance Proposals
        </Flex>
      </Heading>
      {isLoading ? (
        <SkeletonText height="20px" width="100%" noOfLines={4} />
      ) : error ? (
        <Box bg="red.700" color="white" p={4} rounded="md">
          <Text fontWeight="semibold">Error</Text>
          <Text>Failed to load proposals. Please try again.</Text>
        </Box>
      ) : (
        <VStack gap={2} align="start" w="100%">
          {proposalsList.map((p) => (
            <ProposalCard key={p.id} proposal={p} />
          ))}
          {totalPages > 1 && (
            <Pagination
              pageSize={perPage}
              currentPage={page}
              count={totalItems}
              onPageChange={(p) => setPage(p)}
            />
          )}
        </VStack>
      )}
    </Box>
  );
};
