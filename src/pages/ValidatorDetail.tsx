import { useParams, useNavigate } from "react-router";
{
  /* Validator Header */
}
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Icon,
  Skeleton,
} from "@chakra-ui/react";

import { Table } from "@chakra-ui/react";
import { FaChevronLeft } from "react-icons/fa";
import { FaWallet } from "react-icons/fa6";
import {
  useValidatorBonds,
  useValidatorUnbonds,
} from "../queries/useValidator";
import { useAllValidators } from "../queries/useAllValidators";
import type { Validator } from "../types";
import { ValidatorHeader } from "../components/ValidatorHeader";
import { useMemo } from "react";
import { ValidatorInfo } from "../components/ValidatorInfo";
import { useVotingRecord, type VotingRecord } from "../queries/useVotingRecord";

interface Bond {
  delegatorAddress: string;
  validatorAddress: string;
  amountBonded: string;
  amountBonding?: string;
  amountUnbonding?: string;
}

export const ValidatorDetail = () => {
  const navigate = useNavigate();
  const { address } = useParams<{ address: string }>();

  // We currently don't have an endpoint to fetch a single validator by address,
  const validators = useAllValidators({ refetchInterval: undefined });

  const validator = useMemo(
    () => validators.data?.find((v: Validator) => v.address === address),
    [validators.data, address],
  );

  const {
    data: bonds,
    isLoading: bondsLoading,
    error: bondsError,
  } = useValidatorBonds(address!);

  const {
    data: unbonds,
    isLoading: unbondsLoading,
    error: unbondsError,
  } = useValidatorUnbonds(address!);

  const { data: votingRecord, isLoading: votingRecordLoading } = useVotingRecord(address ?? "");

  const isLoading = bondsLoading || unbondsLoading;

  const formatAmount = (amount: string | number) => {
    if (!amount) return "0";
    return parseFloat(amount.toString()).toLocaleString(undefined, {
      minimumFractionDigits: 6,
    });
  };

  // Merge bonds and unbonds data for the table
  const bondData = bonds?.results || bonds || [];
  const unbondData = unbonds?.results || unbonds || [];

  // Create a comprehensive bonds table combining bonded, bonding, and unbonding amounts
  const processedBonds = bondData.map((bond: Bond) => {
    const matchingUnbond = unbondData.find(
      (unbond: Bond) => unbond.delegatorAddress === bond.delegatorAddress,
    );
    return {
      ...bond,
      amountUnbonding: matchingUnbond?.amountUnbonding || "0",
    };
  });

  if (bondsError || unbondsError) {
    return (
      <Box bg="red.700" color="white" p={4} rounded="md">
        <Text fontWeight="semibold">Error</Text>
        <Text>Failed to load validator bonds data. Please try again.</Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={4} align="stretch">
        {/* Header with back button */}
        <HStack>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/validators")}
            color="gray.400"
            _hover={{ color: "white", bg: "gray.700" }}
          >
            <Icon as={FaChevronLeft} mr={2} />
            Back to Validators
          </Button>
        </HStack>

        {isLoading || !validator ? (
          <Skeleton height="90px" width="100%" />
        ) : (
          <>
            <ValidatorHeader validator={validator} />
            <ValidatorInfo
              validator={validator}
              numDelegators={processedBonds.length}
            />

            {/* Link to Account Page */}
            <Box
              bg="gray.900"
              border="1px solid"
              borderColor="gray.800"
              p={3}
              rounded="md"
            >
              <HStack gap={3} align="start">
                <Box flexShrink={0}>
                  <FaWallet />
                </Box>
                <VStack gap={1} align="start" flex={1}>
                  <Text>
                    This validator also has an account page
                  </Text>
                  <Text
                    color="blue.300"
                    cursor="pointer"
                    fontSize="sm"
                    _hover={{
                      color: "blue.200",
                      textDecoration: "underline",
                    }}
                    onClick={() => navigate(`/account/${address}`)}
                  >
                    View account page →
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Delegators and Governance Voting Record side by side */}
            <HStack gap={6} align="start">
              {/* Bonds Table - Left Side */}
              <Box bg="gray.800" p={6} rounded="md" flex="2">
                <Heading as="h2" size="md" mb={4} color="white">
                  Delegators ({processedBonds.length})
                </Heading>

                <Box overflowX="auto" bg="gray.900" rounded="md">
                  <Table.Root variant="outline" size="sm">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader color="gray.300">
                          Delegator Account
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.300" textAlign="right">
                          Bond Amount
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.300" textAlign="right">
                          Bonding Amount
                        </Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.300" textAlign="right">
                          Unbonding Amount
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {processedBonds.length === 0 ? (
                        <Table.Row>
                          <Table.Cell colSpan={4} textAlign="center" py={8}>
                            <Text color="gray.400">No delegators found</Text>
                          </Table.Cell>
                        </Table.Row>
                      ) : (
                        processedBonds.map((bond: Bond, index: number) => (
                          <Table.Row key={bond.delegatorAddress || index}>
                            <Table.Cell>
                              <Text
                                fontFamily="mono"
                                fontSize="sm"
                                color="blue.300"
                                cursor="pointer"
                                _hover={{
                                  color: "blue.200",
                                  textDecoration: "underline",
                                }}
                                onClick={() =>
                                  navigate(`/account/${bond.delegatorAddress}`)
                                }
                              >
                                {bond.delegatorAddress}
                              </Text>
                            </Table.Cell>
                            <Table.Cell
                              textAlign="right"
                              color="yellow.400"
                              fontWeight="semibold"
                            >
                              {formatAmount(bond.amountBonded)}
                            </Table.Cell>
                            <Table.Cell textAlign="right" color="green.400">
                              {formatAmount(bond.amountBonding || "0")}
                            </Table.Cell>
                            <Table.Cell textAlign="right" color="orange.400">
                              {formatAmount(bond.amountUnbonding || "0")}
                            </Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Box>

              {/* Governance Voting Record - Right Side */}
              <VStack gap={3} align="stretch" flex="1" minW="300px">
                <Heading as="h2" size="md" color="white">
                  Governance Voting Record
                </Heading>
                {votingRecordLoading ? (
                  <Skeleton height="60px" width="100%" />
                ) : !votingRecord || votingRecord.length === 0 ? (
                  <Box bg="gray.900" p={4} rounded="md">
                    <Text color="gray.400">No voting record found</Text>
                  </Box>
                ) : (
                  <Box
                    bg="gray.900"
                    p={4}
                    rounded="md"
                    maxHeight="300px"
                    overflowY="auto"
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '8px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#2D3748',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#4A5568',
                        borderRadius: '4px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#718096',
                      },
                    }}
                  >
                    <VStack align="start" gap={2}>
                      {(votingRecord as VotingRecord[])
                        .sort((a, b) => b.proposalId - a.proposalId) // Sort by proposal ID descending
                        .map((vote, index) => (
                          <Text key={index} fontSize="sm">
                            Prop {vote.proposalId}:{" "}
                            <Text
                              as="span"
                              color={
                                vote.vote === "yay"
                                  ? "green.300"
                                  : vote.vote === "nay"
                                    ? "red.300"
                                    : "gray.200"
                              }
                              fontWeight="medium"
                            >
                              {vote.vote}
                            </Text>
                          </Text>
                        ))
                      }
                    </VStack>
                  </Box>
                )}
              </VStack>
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
};
