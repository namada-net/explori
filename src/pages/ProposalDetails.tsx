import { formatTimestamp, formatNumberWithCommas } from "../utils";
import { OverviewCard } from "../components/OverviewCard";
import { useProposal } from "../queries/useProposal";
import {
  Box,
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
            {(proposalInfo.data?.type === "default" || proposalInfo.data?.type === "defaultWithWasm") && (
              <OverviewCard title="Wasm data hash" isLoading={proposalInfo.isLoading}>
                {<Hash hash={proposalInfo.data?.data ?? ""} enableCopy={proposalInfo.data?.data ? true : false}></Hash>}
              </OverviewCard>
            )}
          </Grid>
          {proposalContent &&
            <ProposalContentCard proposalContent={proposalContent} />
          }
          {proposalInfo.data?.type === "pgfFunding" && proposalInfo.data?.data && (
            <Box
              w="100%"
              py={4}
              px={4}
              rounded="sm"
              bg="gray.800"
              borderLeft="2px solid"
              borderColor="purple.400"
              overflow="auto"
              mt={4}
            >
              <Heading as="h3" size="md" color="purple.400" mb={4}>
                PGF Data
              </Heading>
              {(() => {
                try {
                  const parsedData = JSON.parse(proposalInfo.data.data);
                  const retroFunding: Array<{ target: string, amount: string }> = [];
                  const continuousFunding: Array<{ target: string, amount: string }> = [];

                  // Debug: log the structure to understand it better
                  console.log("PGF Data structure:", parsedData);

                  // PGF data is an array of funding objects
                  if (Array.isArray(parsedData)) {
                    parsedData.forEach((fundingItem: any) => {
                      // Check for Retroactive funding
                      if (fundingItem.Retro) {
                        // Navigate through Internal/Ibc level
                        Object.values(fundingItem.Retro).forEach((funding: any) => {
                          if (funding && funding.target && funding.amount) {
                            retroFunding.push({ target: funding.target, amount: funding.amount });
                          }
                        });
                      }

                      // Check for Continuous funding  
                      if (fundingItem.Continuous) {
                        // Navigate through Internal/Ibc level
                        Object.values(fundingItem.Continuous).forEach((funding: any) => {
                          if (funding && funding.target && funding.amount) {
                            continuousFunding.push({ target: funding.target, amount: funding.amount });
                          }
                        });
                      }
                    });
                  }

                  return (
                    <>
                      {retroFunding.length > 0 && (
                        <Box mb={6}>
                          <Heading as="h4" size="sm" color="cyan.300" mb={3}>
                            Retroactive Funding Targets
                          </Heading>
                          {retroFunding.map((funding, index) => (
                            <Box key={index} mb={2} p={3} bg="gray.900" rounded="md">
                              <Flex align="center" wrap="wrap" gap={10}>
                                <Box width="400px">
                                  <Hash hash={funding.target} enableCopy={true} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.400" mb={1}>Amount</Text>
                                  <Text fontWeight="semibold" color="green.300">
                                    {formatNumberWithCommas(parseInt(funding.amount) / 1000000)} NAM
                                  </Text>
                                </Box>
                              </Flex>
                            </Box>
                          ))}
                        </Box>
                      )}
                      {continuousFunding.length > 0 && (
                        <Box>
                          <Heading as="h4" size="sm" color="cyan.300" mb={3}>
                            Continuous Funding Targets
                          </Heading>
                          {continuousFunding.map((funding, index) => (
                            <Box key={index} mb={2} p={3} bg="gray.900" rounded="md">
                              <Flex align="center" wrap="wrap" gap={10}>
                                <Box width="400px">
                                  <Hash hash={funding.target} enableCopy={true} />
                                </Box>
                                <Box>
                                  <Text fontSize="xs" color="gray.400" mb={1}>Amount</Text>
                                  <Text fontWeight="semibold" color="green.300">
                                    {formatNumberWithCommas(parseInt(funding.amount) / 1000000)} NAM
                                  </Text>
                                </Box>
                              </Flex>
                            </Box>
                          ))}
                        </Box>
                      )}
                      {retroFunding.length === 0 && continuousFunding.length === 0 && (
                        <Box>
                          <Box bg="gray.900" p={4} rounded="md" mb={4}>
                            <Text fontSize="sm" color="gray.400" mb={2}>
                              No funding data found. Raw structure:
                            </Text>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#e2e8f0' }}>
                              {JSON.stringify(parsedData, null, 2)}
                            </pre>
                          </Box>
                        </Box>
                      )}
                    </>
                  );
                } catch (error) {
                  return (
                    <Box bg="gray.900" p={4} rounded="md">
                      <Text fontSize="sm" color="red.300" mb={2}>
                        Error parsing PGF data:
                      </Text>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#e2e8f0' }}>
                        {proposalInfo.data.data}
                      </pre>
                    </Box>
                  );
                }
              })()}
            </Box>
          )}
        </>
      )}
    </>
  );
};
