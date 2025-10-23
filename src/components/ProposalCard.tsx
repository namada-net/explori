import { Grid } from "@chakra-ui/react";
import { Data } from "./Data";
import { useNavigate } from "react-router";
import { proposalUrl } from "../routes";
import { formatTimestamp } from "../utils";
import type { ProposalContent, ProposalResponse } from "../types";
import { ProposalStatusBadge } from "./ProposalStatusBadge";

interface ProposalCardProps {
  proposal: ProposalResponse;
}

export const ProposalCard = ({ proposal }: ProposalCardProps) => {
  const navigate = useNavigate();
  const proposalContent = proposal?.content
    ? (JSON.parse(proposal.content) as ProposalContent)
    : null;

  const proposalIdNum = parseInt(proposal.id);

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
      onClick={() => navigate(proposalUrl(proposalIdNum))}
    >
      <Data
        title={`Proposal #${proposalIdNum}`}
        content={proposalContent?.title ?? "-"}
      />
      <Data title="Type" content={proposal.type} />
      <Data
        title="Status"
        content={<ProposalStatusBadge status={proposal.status} />}
      />
      <Data title="Voting end" content={formatTimestamp(parseInt(proposal.endTime))} />
    </Grid>
  );
};
