import { formatTimestamp, formatNumberWithCommas } from "../utils";
import { OverviewCard } from "../components/OverviewCard";
import { useProposalFromList } from "../queries/useProposalFromList";
import {
  Box,
  Grid,
  Flex,
  Heading,
  HStack,
  Skeleton,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useParams } from "react-router";
import { FaVoteYea } from "react-icons/fa";
import { proposalUrl } from "../routes";
import { PageLink } from "../components/PageLink";
import { useSimpleGet } from "../queries/useSimpleGet";
import { Hash } from "../components/Hash";
import { ProposalStatusBadge } from "../components/ProposalStatusBadge";
import type { ProposalContent } from "../types";
import { ProposalContentCard } from "../components/ProposalContentCard";
import { useVotingPower } from "../queries/useVotingPower";
import { useProposalWasmData } from "../queries/useProposalWasmData";

export const ProposalDetails = () => {
  const params = useParams();
  const currentProposal = parseInt(params.id || "1");
  const proposalInfo = useProposalFromList(currentProposal);
  const votingPowerData = useVotingPower();
  const wasmData = useProposalWasmData(currentProposal);

  // Extract wasm hash directly from API response
  const wasmHash = (proposalInfo.data?.type === "defaultWithWasm" &&
    wasmData.data &&
    typeof wasmData.data === 'object' &&
    wasmData.data.hash) ? wasmData.data.hash : '';

  // Get first page to determine latest proposal ID for navigation
  const { data: firstPage } = useSimpleGet("proposals-first-page", "/gov/proposal?page=1");
  const lastProposalId = firstPage?.results?.length > 0
    ? Math.max(...firstPage.results.map((proposal: any) => parseInt(proposal.id)))
    : 0;

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

  const votingQuorum = () => {
    const totalVotes = proposalInfo.data
      ? parseInt(proposalInfo.data.yayVotes) +
      parseInt(proposalInfo.data.nayVotes) +
      parseInt(proposalInfo.data.abstainVotes)
      : 0;
    const totalVotingPower = votingPowerData.data?.totalVotingPower;

    if (!totalVotingPower || totalVotingPower === 0) return 0;

    return Number((totalVotes / totalVotingPower * 100).toFixed(2));
  };

  const getVotingThreshold = () => {
    if (!proposalInfo.data?.type) return null;

    const proposalType = proposalInfo.data.type;

    // Based on Namada governance documentation
    switch (proposalType) {
      case "default":
      case "defaultWithWasm":
        return "40%";  // Default proposals require 40% participation
      case "pgfSteward":
        return "33.33%";  // PGF steward proposals require 1/3 participation
      case "pgfFunding":
        return "33.33%";  // PGF funding proposals require 1/3 participation (or for veto)
      default:
        return "40%";  // Default fallback
    }
  };

  const getValidatorVotingPeriod = () => {
    if (!proposalInfo.data?.startEpoch || !proposalInfo.data?.endEpoch ||
      !proposalInfo.data?.startTime || !proposalInfo.data?.endTime) return null;

    const startEpoch = parseInt(proposalInfo.data.startEpoch);
    const endEpoch = parseInt(proposalInfo.data.endEpoch);
    const startTime = parseInt(proposalInfo.data.startTime);
    const endTime = parseInt(proposalInfo.data.endTime);

    // Calculate (voting_start_epoch + 2*voting_end_epoch)/3
    const calculatedEpoch = (startEpoch + 2 * endEpoch) / 3;

    let validatorVotingEpoch: number;

    // Check if it's a fraction
    if (calculatedEpoch % 1 !== 0) {
      // If fraction ending in .333 or .666, round up
      const fraction = calculatedEpoch % 1;
      if (Math.abs(fraction - 0.333) < 0.001 || Math.abs(fraction - 0.666) < 0.001) {
        validatorVotingEpoch = Math.ceil(calculatedEpoch);
      } else {
        validatorVotingEpoch = Math.round(calculatedEpoch);
      }
    } else {
      // If whole number, add 1
      validatorVotingEpoch = calculatedEpoch + 1;
    }

    // Calculate the timestamp by interpolating between start and end times
    const epochDuration = endEpoch - startEpoch;
    const timeDuration = endTime - startTime;
    const epochProgress = (validatorVotingEpoch - startEpoch) / epochDuration;
    const validatorVotingTime = startTime + (timeDuration * epochProgress);

    return {
      epoch: validatorVotingEpoch,
      time: Math.round(validatorVotingTime)
    };
  };

  const getProposalTypeDescription = () => {
    if (!proposalInfo.data?.type) return null;

    switch (proposalInfo.data.type) {
      case "default":
        return "Signaling proposal";
      case "defaultWithWasm":
        return "WASM-executable proposal";
      case "pgfFunding":
        return "Funding proposal";
      case "pgfSteward":
        return "PGF Steward proposal";
      default:
        return proposalInfo.data.type;
    }
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
        {(getProposalTypeDescription() || proposalInfo.data?.author) && (
          <Flex gap={4} align="center" fontSize="md" mt={1}>
            {getProposalTypeDescription() && (
              <Text color="green.400" fontWeight="medium">
                {getProposalTypeDescription()}
              </Text>
            )}
            {proposalInfo.data?.author && (
              <Flex gap={2} align="center" color="gray.200">
                <Text>submitted by</Text>
                <Hash hash={proposalInfo.data.author} enableCopy={true} />
              </Flex>
            )}
          </Flex>
        )}

        <HStack
          gap={6}
          position="absolute"
          top={0}
          right={0}
          height="100%"
          fontSize="sm"
          color="gray.300"
        >
          {!proposalInfo.isLoading && currentProposal !== lastProposalId && lastProposalId > 0 && (
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
          {/* Vote results section */}
          <Heading as="h2" size="md" mb={2} color="purple.400">
            Vote results
          </Heading>
          <Grid templateColumns="repeat(5, 1fr)" gap={1} mb={6}>
            <OverviewCard title="Status" isLoading={proposalInfo.isLoading}>
              <ProposalStatusBadge status={proposalInfo.data?.status} />
            </OverviewCard>
            <VStack
              bg="gray.800"
              px={4}
              py={2}
              minW="150px"
              align="start"
              gap={1}
              rounded="sm"
            >
              <Flex justify="space-between" align="center" width="100%">
                <Heading as="h3" size="sm">
                  Voting quorum
                </Heading>
                {getVotingThreshold() && (
                  <Heading as="h3" size="sm" color="gray.400">
                    (Threshold)
                  </Heading>
                )}
              </Flex>
              <Flex
                w="100%"
                minH="6"
                alignItems="center"
                fontSize="sm"
                justify="space-between"
              >
                {proposalInfo.isLoading || votingPowerData.isLoading ? (
                  <Skeleton height="4" width="100%" />
                ) : (
                  <>
                    <Text>{votingQuorum()}%</Text>
                    {getVotingThreshold() && (
                      <Text color="gray.300">
                        {getVotingThreshold()}
                      </Text>
                    )}
                  </>
                )}
              </Flex>
            </VStack>
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
          </Grid>

          {/* Voting periods section */}
          <Heading as="h2" size="md" mb={2} color="purple.400">
            Voting periods
          </Heading>
          <Grid templateColumns="repeat(4, 1fr)" gap={1} mb={6}>
            <OverviewCard title="Voting start" isLoading={proposalInfo.isLoading}>
              {formatTimestamp(proposalInfo.data?.startTime)}
              <Text color="gray.400" ml="4">(Epoch {proposalInfo.data?.startEpoch})</Text>
            </OverviewCard>
            <OverviewCard title="Voting end" isLoading={proposalInfo.isLoading}>
              {formatTimestamp(proposalInfo.data?.endTime)}
              <Text color="gray.400" ml="4">(Epoch {proposalInfo.data?.endEpoch})</Text>
            </OverviewCard>
            <OverviewCard title="Validator-only voting end" isLoading={proposalInfo.isLoading}>
              {(() => {
                const validatorPeriod = getValidatorVotingPeriod();
                return validatorPeriod ? (
                  <>
                    {formatTimestamp(validatorPeriod.time)}
                    <Text color="gray.400" ml="4">(Epoch {validatorPeriod.epoch})</Text>
                  </>
                ) : (
                  <Text>-</Text>
                );
              })()}
            </OverviewCard>
            <OverviewCard title="Activation time" isLoading={proposalInfo.isLoading}>
              {formatTimestamp(proposalInfo.data?.activationTime)}
              <Text color="gray.400" ml="4">(Epoch {proposalInfo.data?.activationEpoch})</Text>
            </OverviewCard>
          </Grid>

          {/* Conditional sections based on proposal type */}
          {proposalInfo.data?.type === "defaultWithWasm" && (
            <>
              <Heading as="h2" size="md" mb={2} color="purple.400">
                Wasm data hash
              </Heading>
              <Grid templateColumns="1fr" gap={1} mb={8} maxW="400px">
                <OverviewCard
                  title="Wasm code hash"
                  isLoading={wasmData.isLoading}
                >
                  {wasmHash ? (
                    <Hash hash={wasmHash} enableCopy={true} />
                  ) : wasmData.isError ? (
                    <Text color="red.400">No wasm data found</Text>
                  ) : (
                    <Text color="gray.500">Loading wasm data...</Text>
                  )}
                </OverviewCard>
              </Grid>
            </>
          )}

          {/* Note: 'default' type has no additional section */}

          {/* Content section */}
          {proposalContent && (
            <>
              <Heading as="h2" size="md" mb={2} color="purple.400">
                Content
              </Heading>
              <ProposalContentCard proposalContent={proposalContent} />
            </>
          )}

          {/* PGF data sections after content */}
          {proposalInfo.data?.type === "pgfFunding" && (
            <>
              <Heading as="h2" size="md" mb={2} mt={6} color="purple.400">
                Funding data
              </Heading>
              <Box
                w="100%"
                py={4}
                px={4}
                rounded="sm"
                bg="gray.800"
                borderLeft="2px solid"
                borderColor="purple.400"
                overflow="auto"
                mb={8}
              >
                {wasmData.data && wasmData.data.data ? (
                  (() => {
                    try {
                      const fundingData = JSON.parse(wasmData.data.data);
                      const retroFunding: Array<{ target: string, amount: string }> = [];
                      const continuousAddFunding: Array<{ target: string, amount: string }> = [];
                      const continuousRemoveFunding: Array<{ target: string, amount: string }> = [];

                      // Parse the funding data array
                      if (Array.isArray(fundingData)) {
                        fundingData.forEach((item: any) => {
                          // Handle Retro funding
                          if (item.Retro && item.Retro.Internal) {
                            retroFunding.push({
                              target: item.Retro.Internal.target,
                              amount: item.Retro.Internal.amount
                            });
                          }

                          // Handle Continuous funding
                          if (item.Continuous) {
                            if (item.Continuous.Add && item.Continuous.Add.Internal) {
                              continuousAddFunding.push({
                                target: item.Continuous.Add.Internal.target,
                                amount: item.Continuous.Add.Internal.amount
                              });
                            }
                            if (item.Continuous.Remove && item.Continuous.Remove.Internal) {
                              continuousRemoveFunding.push({
                                target: item.Continuous.Remove.Internal.target,
                                amount: item.Continuous.Remove.Internal.amount
                              });
                            }
                          }
                        });
                      }

                      return (
                        <>
                          {retroFunding.length > 0 && (
                            <Box mb={4}>
                              <Heading as="h3" size="sm" color="cyan.300" mb={2}>
                                Retro
                              </Heading>
                              <Grid templateColumns="400px 200px" gap={4} rowGap={1}>
                                {retroFunding.map((funding: { target: string, amount: string }, index: number) => (
                                  <>
                                    <Box key={`retro-addr-${index}`}>
                                      <Hash hash={funding.target} enableCopy={true} />
                                    </Box>
                                    <Box key={`retro-amount-${index}`} textAlign="left">
                                      <Text color="green.300" fontWeight="medium">
                                        {formatNumberWithCommas(parseInt(funding.amount) / 1000000)} NAM
                                      </Text>
                                    </Box>
                                  </>
                                ))}
                              </Grid>
                            </Box>
                          )}

                          {continuousAddFunding.length > 0 && (
                            <Box mb={4}>
                              <Heading as="h3" size="sm" color="cyan.300" mb={2}>
                                Continuous Add
                              </Heading>
                              <Grid templateColumns="400px 200px" gap={4} rowGap={1}>
                                {continuousAddFunding.map((funding: { target: string, amount: string }, index: number) => (
                                  <>
                                    <Box key={`add-addr-${index}`}>
                                      <Hash hash={funding.target} enableCopy={true} />
                                    </Box>
                                    <Box key={`add-amount-${index}`} textAlign="left">
                                      <Text color="green.300">
                                        {formatNumberWithCommas(parseInt(funding.amount) / 1000000)} NAM / epoch
                                      </Text>
                                    </Box>
                                  </>
                                ))}
                              </Grid>
                            </Box>
                          )}

                          {continuousRemoveFunding.length > 0 && (
                            <Box mb={4}>
                              <Heading as="h3" size="sm" color="cyan.300" mb={2}>
                                Continuous Remove
                              </Heading>
                              <Grid templateColumns="400px 200px" gap={4} rowGap={1}>
                                {continuousRemoveFunding.map((funding: { target: string, amount: string }, index: number) => (
                                  <>
                                    <Box key={`remove-addr-${index}`}>
                                      <Hash hash={funding.target} enableCopy={true} />
                                    </Box>
                                    <Box key={`remove-amount-${index}`} textAlign="left">
                                      <Text color="red.300">
                                        {formatNumberWithCommas(parseInt(funding.amount) / 1000000)} NAM / epoch
                                      </Text>
                                    </Box>
                                  </>
                                ))}
                              </Grid>
                            </Box>
                          )}

                          {retroFunding.length === 0 && continuousAddFunding.length === 0 && continuousRemoveFunding.length === 0 && (
                            <Text color="gray.400">No funding data found</Text>
                          )}
                        </>
                      );
                    } catch (error) {
                      return (
                        <Box>
                          <Text color="red.400" mb={2}>Error parsing funding data:</Text>
                          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#e2e8f0' }}>
                            {wasmData.data.data}
                          </pre>
                        </Box>
                      );
                    }
                  })()
                ) : wasmData.isLoading ? (
                  <Text color="gray.400">Loading funding data...</Text>
                ) : (
                  <Text color="red.400">No funding data found</Text>
                )}
              </Box>
            </>
          )}

          {proposalInfo.data?.type === "pgfSteward" && (
            <>
              <Heading as="h2" size="md" mb={2} color="purple.400">
                PGF Steward data
              </Heading>
              <Box
                w="100%"
                py={4}
                px={4}
                rounded="sm"
                bg="gray.800"
                borderLeft="2px solid"
                borderColor="purple.400"
                overflow="auto"
                mb={8}
              >
                {wasmData.data ? (
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', color: '#e2e8f0' }}>
                    {typeof wasmData.data === 'string'
                      ? wasmData.data
                      : JSON.stringify(wasmData.data, null, 2)
                    }
                  </pre>
                ) : wasmData.isLoading ? (
                  <Text color="gray.400">Loading steward data...</Text>
                ) : (
                  <Text color="red.400">No steward data found</Text>
                )}
              </Box>
            </>
          )}
        </>
      )}
    </>
  );
};
