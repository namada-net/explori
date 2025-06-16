import { useParams, useNavigate, useLocation } from "react-router";
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
  SimpleGrid,
  Skeleton,
} from "@chakra-ui/react";

import { Table } from "@chakra-ui/react";
import { FaChevronLeft } from "react-icons/fa";
import {
  useValidatorBonds,
  useValidatorUnbonds,
} from "../queries/useValidator";
import { useAllValidators } from "../queries/useAllValidators";
import type { Validator } from "../types";
import { ValidatorHeader } from "../components/ValidatorHeader";
import { useMemo } from "react";
import { ValidatorInfo } from "../components/ValidatorInfo";

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
  const validators = useAllValidators();

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
      <Box bg="red.100" color="red.800" p={4} rounded="md">
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

            {/* Bonds Table */}
            <Box bg="gray.800" p={6} rounded="md">
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
          </>
        )}
      </VStack>
    </Box>
  );
};
