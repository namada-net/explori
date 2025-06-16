import { useParams, useNavigate, useLocation } from "react-router";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  HStack,
  Button,
  Icon,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { FaChevronLeft, FaDiscord, FaGlobe } from "react-icons/fa";
import {
  useValidatorBonds,
  useValidatorUnbonds,
} from "../queries/useValidator";

interface Bond {
  delegatorAddress: string;
  validatorAddress: string;
  amountBonded: string;
  amountBonding?: string;
  amountUnbonding?: string;
}

interface Validator {
  address: string;
  votingPower: string;
  maxCommission: string;
  commission: string;
  state: string;
  name: string;
  email: string;
  website: string;
  description: string;
  discordHandle: string;
  avatar: string;
  validatorId: string;
  rank: number;
}

export const ValidatorDetail = () => {
  const { address } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get validator data from navigation state
  const validator = location.state?.validator as Validator;

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
      (unbond: Bond) => unbond.delegatorAddress === bond.delegatorAddress
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

  if (!validator) {
    return (
      <Box bg="yellow.100" color="yellow.800" p={4} rounded="md">
        <Text fontWeight="semibold">Warning</Text>
        <Text>
          Validator data not available. Please navigate from the validators
          list.
        </Text>
        <Button
          onClick={() => navigate("/validators")}
          mt={2}
          size="sm"
          colorScheme="yellow"
        >
          Go to Validators
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <VStack gap={6} align="stretch">
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

        {isLoading ? (
          <VStack gap={4} align="center" py={8}>
            <Spinner size="lg" color="yellow.400" />
            <Text color="gray.400">Loading validator details...</Text>
          </VStack>
        ) : (
          <>
            {/* Validator Header */}
            <Box bg="gray.800" p={6} rounded="md">
              <HStack align="start" gap={6}>
                <Box
                  width="80px"
                  height="80px"
                  borderRadius="full"
                  overflow="hidden"
                  bg="gray.600"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexShrink={0}
                  position="relative"
                >
                  {validator.avatar ? (
                    <>
                      <Image
                        src={validator.avatar}
                        alt={validator.name || "Validator"}
                        width="80px"
                        height="80px"
                        objectFit="cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                      <Text
                        fontSize="2xl"
                        color="gray.300"
                        position="absolute"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                      >
                        {(validator.name || "U")[0].toUpperCase()}
                      </Text>
                    </>
                  ) : (
                    <Text fontSize="2xl" color="gray.300">
                      {(validator.name || "U")[0].toUpperCase()}
                    </Text>
                  )}
                </Box>

                <VStack align="start" flex={1} gap={3}>
                  <HStack align="center" gap={3}>
                    <Heading as="h1" size="xl" color="white">
                      {validator.name || "Unknown Validator"}
                    </Heading>
                  </HStack>

                  {validator.description && (
                    <Text color="gray.300" maxW="600px">
                      {validator.description}
                    </Text>
                  )}

                  <HStack gap={4}>
                    {validator.website && (
                      <a
                        href={validator.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 12px",
                          fontSize: "14px",
                          border: "1px solid #4A5568",
                          borderRadius: "6px",
                          color: "#A0AEC0",
                          textDecoration: "none",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#2D3748";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#A0AEC0";
                        }}
                      >
                        <Icon as={FaGlobe} />
                        Website
                      </a>
                    )}
                    {validator.discordHandle && (
                      <a
                        href={`https://discord.com/users/${validator.discordHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "6px 12px",
                          fontSize: "14px",
                          border: "1px solid #4A5568",
                          borderRadius: "6px",
                          color: "#A0AEC0",
                          textDecoration: "none",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#2D3748";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = "#A0AEC0";
                        }}
                      >
                        <Icon as={FaDiscord} />
                        Discord
                      </a>
                    )}
                  </HStack>
                </VStack>
              </HStack>
            </Box>

            {/* Validator Stats */}
            <Box bg="gray.800" p={6} rounded="md">
              <Heading as="h2" size="md" mb={4} color="white">
                Validator Statistics
              </Heading>

              <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} gap={6}>
                <Box>
                  <Text fontSize="sm" color="gray.400">
                    Rank
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow">
                    #{validator.rank || "-"}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400">
                    Voting Power
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow">
                    {formatAmount(validator.votingPower)}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    NAM
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400">
                    Commission
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow">
                    {validator.commission
                      ? `${parseFloat(validator.commission).toFixed(2)}%`
                      : "0%"}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400">
                    Max Commission
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow">
                    {validator.maxCommission
                      ? `${parseFloat(validator.maxCommission).toFixed(2)}%`
                      : "0%"}
                  </Text>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.400">
                    Delegators
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="yellow">
                    {processedBonds.length}
                  </Text>
                </Box>
              </SimpleGrid>
            </Box>

            {/* Validator Address */}
            <Box bg="gray.800" p={6} rounded="md">
              <Heading as="h2" size="md" mb={4} color="white">
                Validator Address
              </Heading>
              <Text
                fontFamily="mono"
                fontSize="sm"
                color="gray.300"
                bg="gray.900"
                p={3}
                rounded="md"
                wordBreak="break-all"
              >
                {address}
              </Text>
            </Box>

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
