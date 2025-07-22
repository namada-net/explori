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
  
  // Find the highest ID from the proposals array
  const lastProposalId = proposals.length > 0 
    ? Math.max(...proposals.map(proposal => parseInt(proposal.id)))
    : 0;

  const renderProposals = (page: number) => {
    const startProposal = lastProposalId - (page - 1) * proposalsPerPage;
    const endProposal = Math.max(startProposal - proposalsPerPage + 1, 1);
    const proposalsToRender = [];
    for (let n = startProposal; n >= endProposal; n--) {
      proposalsToRender.push(<ProposalCard key={n} proposalId={n} />);
    }
    return proposalsToRender;
  };

  return (
    <VStack gap={2} align="start" w="100%">
      {renderProposals(currentPage)}
      <Pagination
        count={lastProposalId}
        currentPage={currentPage}
        pageSize={proposalsPerPage}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </VStack>
  );
};
