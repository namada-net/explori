import { useProposal } from "../queries/useProposal";
import { Grid } from "@chakra-ui/react";
import { Data } from "./Data";
import { useNavigate } from "react-router";
import { proposalUrl } from "../routes";
import { formatTimestamp } from "../utils";
import type { ProposalContent } from "../types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

type ProposalCard = {
  proposalId: number;
};

export const ProposalCard = ({ proposalId }: ProposalCard) => {
  const proposal = useProposal(proposalId);
  const proposalContent = proposal.data?.content 
    ? JSON.parse(proposal.data.content) as ProposalContent
    : null;
  const navigate = useNavigate();

  if (proposal.isLoading && !proposal.data) {
    return <></>;
  }

  return (
    <Grid
      gap={4}
      w="100%"
      bg="gray.800"
      py={4}
      px={6}
      rounded="sm"
      cursor="pointer"
      templateColumns="50% 1fr 1fr 1fr"
      _hover={{ bg: "gray.700" }}
      onClick={() => navigate(proposalUrl(proposalId))}
    >
      <Data
        title={`Proposal #${proposalId}`}
        content={proposalContent?.title ?? "-"}
      />
      <Data
        title="Type"
        content={proposal.data?.type}
      />
      <Data
        title="Status"
        content={<ProposalStatusBadge status={proposal.data?.status} />}
      />
      <Data
        title="Voting end"
        content={formatTimestamp(proposal.data?.endTime)}
      />
    </Grid>
  );
};
