import { formatTimestamp } from "../utils";
import { OverviewCard } from "../components/OverviewCard";
import { useProposal } from "../queries/useProposal";
import {
  Grid,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Text,
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { FaVoteYea } from "react-icons/fa";
import { proposalUrl } from "../routes";
import { PageLink } from "../components/PageLink";
import { useProposals } from "../queries/useProposals";
import { Hash } from "../components/Hash";
import { ProposalStatusBadge } from "../components/ProposalStatusBadge";
import type { ProposalContent } from "../types";
import { ProposalContentCard } from "../components/ProposalContentCard";

export const ProposalDetails = () => {
  const params = useParams();
  const proposals = useProposals();
  const lastProposalId = proposals.data?.length > 0
    ? Math.max(...proposals.data.map((proposal: any) => parseInt(proposal.id)))
    : 0;
  const currentProposal = parseInt(params.id || "1");
  const proposalInfo = useProposal(parseInt(params.id || "1"));
  const proposalContent = proposalInfo.data?.content
    ? JSON.parse(proposalInfo.data.content) as ProposalContent
    : null;
  const votesAsPercent = (votes: string) => {
    const totalVotes = proposalInfo.data
      ? parseInt(proposalInfo.data.yayVotes) +
      parseInt(proposalInfo.data.nayVotes) +
      parseInt(proposalInfo.data.abstainVotes)
      : 0;
    return totalVotes === 0 ? 0 : Number((parseInt(votes) / totalVotes * 100).toFixed(2));
  };

  return (
    <>
      <Heading
        as="h1"
        gap={2}
        size="xl"
        mb={4}
        color="cyan"
        position="relative"
      >
        <Flex gap={2} align="center" color="cyan">
          <FaVoteYea /> Proposal #{currentProposal}:
          {proposalContent?.title &&
            <Text ml={2}>{proposalContent.title}</Text>
          }
        </Flex>

        <HStack
          gap={6}
          position="absolute"
          top={0}
          right={0}
          height="100%"
          fontSize="sm"
          color="gray.300"
        >
          {!proposals.isLoading && currentProposal !== lastProposalId && lastProposalId > 0 && (
            <PageLink to={proposalUrl(currentProposal + 1)}>
              Next
            </PageLink>
          )}
          {currentProposal > 0 && (
            <PageLink to={proposalUrl(currentProposal - 1)}>
              Previous
            </PageLink>
          )}
        </HStack>
      </Heading>
      {proposalInfo.isLoading && <Skeleton height="60px" width="100%" mb={4} />}
      {proposalInfo.data && (
        <>
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={1} mb={8}>
            <OverviewCard title="Voting start" isLoading={proposalInfo.isLoading}>
              {formatTimestamp(proposalInfo.data?.startTime)}
              <Text color="gray.400" ml="4">(Epoch {proposalInfo.data?.startEpoch})</Text>
            </OverviewCard>
            <OverviewCard title="Voting end" isLoading={proposalInfo.isLoading}>
              {formatTimestamp(proposalInfo.data?.startTime)}
              <Text color="gray.400" ml="4">(Epoch {proposalInfo.data?.endEpoch})</Text>
            </OverviewCard>
            <OverviewCard title="Activation time" isLoading={proposalInfo.isLoading}>
              {formatTimestamp(proposalInfo.data?.startTime)}
              <Text color="gray.400" ml="4">(Epoch {proposalInfo.data?.activationEpoch})</Text>
            </OverviewCard>
            <OverviewCard title="Status" isLoading={proposalInfo.isLoading}>
              <ProposalStatusBadge status={proposalInfo.data?.status} />
            </OverviewCard>
            <OverviewCard title="Yay votes" isLoading={proposalInfo.isLoading}>
              {proposalInfo.data?.yayVotes}
              <Text color="gray.400" ml="4">({votesAsPercent(proposalInfo.data?.yayVotes)}%)</Text>
            </OverviewCard>
            <OverviewCard title="Nay votes" isLoading={proposalInfo.isLoading}>
              {proposalInfo.data?.nayVotes}
              <Text color="gray.400" ml="4">({votesAsPercent(proposalInfo.data?.nayVotes)}%)</Text>
            </OverviewCard>
            <OverviewCard title="Abstain votes" isLoading={proposalInfo.isLoading}>
              {proposalInfo.data?.abstainVotes}
              <Text color="gray.400" ml="4">({votesAsPercent(proposalInfo.data?.abstainVotes)}%)</Text>
            </OverviewCard>
            <OverviewCard title="Author" isLoading={proposalInfo.isLoading}>
              {<Hash hash={proposalInfo.data?.author} enableCopy={true} />}
            </OverviewCard>
            <OverviewCard title="Type" isLoading={proposalInfo.isLoading}>
              {proposalInfo.data?.type}
            </OverviewCard>
            <OverviewCard title="Wasm data hash" isLoading={proposalInfo.isLoading}>
              {<Hash hash={proposalInfo.data?.data ?? ""} enableCopy={proposalInfo.data?.data ? true : false}></Hash>}
            </OverviewCard>
          </Grid>
          {proposalContent &&
            <ProposalContentCard proposalContent={proposalContent} />
          }
        </>
      )}
    </>
  );
};
