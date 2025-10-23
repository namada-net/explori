import { VStack } from "@chakra-ui/react";
import { ProposalCard } from "./ProposalCard";
import { useState } from "react";
import { Pagination } from "./Pagination";
import type { ProposalResponse } from "../types";

type ProposalListProps = {
  proposals: ProposalResponse[];
  proposalsPerPage?: number;
};

export const ProposalList = ({
  proposals,
  proposalsPerPage = 10,
}: ProposalListProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const renderProposals = (page: number) => {
    const startIndex = (page - 1) * proposalsPerPage;
    const endIndex = startIndex + proposalsPerPage;
    return proposals.slice(startIndex, endIndex).map((proposal) => (
      <ProposalCard key={proposal.id} proposal={proposal} />
    ));
  };

  return (
    <VStack gap={2} align="start" w="100%">
      {renderProposals(currentPage)}
      <Pagination
        count={proposals.length}
        currentPage={currentPage}
        pageSize={proposalsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </VStack>
  );
};
