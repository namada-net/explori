import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Box,
  Heading,
  Text,
  VStack,
  Spinner,
  HStack,
  Button,
  ButtonGroup,
  Icon,
  Badge,
  Image,
} from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { FaChevronUp, FaChevronDown, FaDiscord, FaGlobe } from "react-icons/fa";
import { useAllValidators } from "../queries/useAllValidators";
import { camelCaseToTitleCase } from "../utils";

const VALIDATOR_STATES = [
  { value: "all", label: "All" },
  { value: "consensus", label: "Consensus" },
  { value: "belowCapacity", label: "Below Capacity" },
  { value: "belowThreshold", label: "Below Threshold" },
  { value: "inactive", label: "Inactive" },
  { value: "jailed", label: "Jailed" },
  { value: "unknown", label: "Unknown" },
  { value: "unjailing", label: "Unjailing" },
  { value: "deactivating", label: "Deactivating" },
  { value: "reactivating", label: "Reactivating" },
];

type SortField = "votingPower" | "commission" | "rank";
type SortOrder = "asc" | "desc";

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

export const Validators = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [state, setState] = useState("all");
  const [sortField, setSortField] = useState<SortField | undefined>("rank");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const {
    data: validators,
    isLoading,
    error,
  } = useAllValidators(page, state, sortField, sortOrder);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "rank" ? "asc" : "desc");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "consensus":
        return "green";
      case "belowcapacity":
        return "yellow";
      case "belowthreshold":
        return "orange";
      case "inactive":
        return "gray";
      case "jailed":
        return "red";
      case "unjailing":
        return "blue";
      case "deactivating":
        return "orange";
      case "reactivating":
        return "blue";
      default:
        return "gray";
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return (
      <Icon
        as={sortOrder === "asc" ? FaChevronUp : FaChevronDown}
        ml={1}
        boxSize={3}
      />
    );
  };

  if (error) {
    return (
      <Box bg="red.100" color="red.800" p={4} rounded="md">
        <Text fontWeight="semibold">Error</Text>
        <Text>Failed to load validators. Please try again.</Text>
      </Box>
    );
  }

  console.log(validators, "validators");
  const validatorsList = validators?.results || [];
  const totalValidators = validators?.pagination?.totalItems || 0;
  const currentPage = validators?.pagination?.currentPage || 1;
  const totalPages = validators?.pagination?.totalPages || 1;

  return (
    <Box>
      <VStack gap={6} align="stretch">
        <Box>
          <Heading as="h1" size="xl" mb={2}>
            Validators
          </Heading>
          <Text color="gray.400" fontSize="sm">
            {totalValidators} validators found
          </Text>
        </Box>

        <Box bg="gray.800" p={6} rounded="md">
          <VStack gap={6} align="stretch">
            {/* Controls */}
            <HStack justify="space-between" align="center" wrap="wrap" gap={4}>
              <HStack gap={4}>
                <Box>
                  <Text fontSize="sm" color="gray.400" mb={1}>
                    Filter by Status
                  </Text>
                  <select
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setPage(1);
                    }}
                    style={{
                      backgroundColor: "#1A202C",
                      borderColor: "#4A5568",
                      border: "1px solid",
                      borderRadius: "6px",
                      padding: "8px",
                      color: "white",
                      fontSize: "14px",
                      width: "200px",
                    }}
                  >
                    {VALIDATOR_STATES.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                        style={{ backgroundColor: "#1A202C" }}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Box>
              </HStack>
            </HStack>

            {/* Validators Table */}
            <Box overflowX="auto" bg="gray.900" rounded="md">
              <Table.Root variant="outline" size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader
                      color="gray.300"
                      cursor="pointer"
                      onClick={() => handleSort("rank")}
                      _hover={{
                        color: "white",
                        bg: "gray.700",
                        "& .sort-icon": { opacity: 1 },
                      }}
                      position="relative"
                      userSelect="none"
                    >
                      <HStack justify="space-between" width="100%">
                        <Text>Rank</Text>
                        <Box
                          className="sort-icon"
                          opacity={0}
                          transition="opacity 0.2s"
                        >
                          {renderSortIcon("rank")}
                        </Box>
                      </HStack>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">
                      Validator
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300">
                      Status
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color="gray.300"
                      textAlign="right"
                      cursor="pointer"
                      onClick={() => handleSort("votingPower")}
                      _hover={{
                        color: "white",
                        bg: "gray.700",
                        "& .sort-icon": { opacity: 1 },
                      }}
                      position="relative"
                      userSelect="none"
                    >
                      <HStack justify="flex-end" width="100%">
                        <Text>Voting Power</Text>
                        <Box
                          className="sort-icon"
                          opacity={0}
                          transition="opacity 0.2s"
                        >
                          {renderSortIcon("votingPower")}
                        </Box>
                      </HStack>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color="gray.300"
                      textAlign="right"
                      cursor="pointer"
                      onClick={() => handleSort("commission")}
                      _hover={{
                        color: "white",
                        bg: "gray.700",
                        "& .sort-icon": { opacity: 1 },
                      }}
                      position="relative"
                      userSelect="none"
                    >
                      <HStack justify="flex-end" width="100%">
                        <Text>Commission</Text>
                        <Box
                          className="sort-icon"
                          opacity={0}
                          transition="opacity 0.2s"
                        >
                          {renderSortIcon("commission")}
                        </Box>
                      </HStack>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader color="gray.300" textAlign="center">
                      Links
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {isLoading ? (
                    <Table.Row>
                      <Table.Cell colSpan={7} textAlign="center" py={8}>
                        <VStack gap={3}>
                          <Spinner size="lg" color="yellow.400" />
                          <Text color="gray.400">Loading validators...</Text>
                        </VStack>
                      </Table.Cell>
                    </Table.Row>
                  ) : validatorsList.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={7} textAlign="center" py={8}>
                        <Text color="gray.400">No validators found</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    validatorsList.map(
                      (validator: Validator, index: number) => (
                        <Table.Row
                          key={validator.address || index}
                          cursor="pointer"
                          _hover={{ bg: "gray.800" }}
                          onClick={() =>
                            navigate(`/validator/${validator.address}`, {
                              state: { validator },
                            })
                          }
                        >
                          <Table.Cell color="gray.300" fontSize="sm">
                            {validator.rank || "-"}
                          </Table.Cell>
                          <Table.Cell>
                            <HStack align="start" gap={3}>
                              <Box
                                width="32px"
                                height="32px"
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
                                      width="32px"
                                      height="32px"
                                      objectFit="cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  </>
                                ) : (
                                  <Text fontSize="xs" color="gray.300">
                                    {(validator.name || "U")[0].toUpperCase()}
                                  </Text>
                                )}
                              </Box>
                              <VStack align="start" gap={1}>
                                <Text
                                  fontWeight="semibold"
                                  fontSize="sm"
                                  color="white"
                                >
                                  {validator.name || "Unknown Validator"}
                                </Text>
                                {validator.description && (
                                  <Text
                                    fontSize="xs"
                                    color="gray.400"
                                    maxW="300px"
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {validator.description}
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              variant="subtle"
                              backgroundColor={
                                getStatusColor(validator.state) + ".500"
                              }
                              fontSize="xs"
                            >
                              {validator.state
                                ? camelCaseToTitleCase(validator.state)
                                : "Unknown"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell
                            textAlign="right"
                            color="yellow.400"
                            fontWeight="semibold"
                          >
                            {validator.votingPower
                              ? parseFloat(
                                  validator.votingPower
                                ).toLocaleString()
                              : "0"}
                          </Table.Cell>
                          <Table.Cell textAlign="right" color="gray.300">
                            {validator.commission
                              ? `${parseFloat(validator.commission).toFixed(
                                  2
                                )}%`
                              : "0%"}
                          </Table.Cell>
                          <Table.Cell textAlign="center">
                            <HStack justify="center" gap={2}>
                              {validator.website && (
                                <a
                                  href={validator.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#A0AEC0" }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#63B3ED";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#A0AEC0";
                                  }}
                                  title="Website"
                                >
                                  <Icon as={FaGlobe} boxSize={4} />
                                </a>
                              )}
                              {validator.discordHandle && (
                                <a
                                  href={`https://discord.com/users/${validator.discordHandle}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: "#A0AEC0" }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "#B794F6";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "#A0AEC0";
                                  }}
                                  title="Discord"
                                >
                                  <Icon as={FaDiscord} boxSize={4} />
                                </a>
                              )}
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      )
                    )
                  )}
                </Table.Body>
              </Table.Root>
            </Box>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <HStack justify="space-between" align="center">
                <Text fontSize="sm" color="gray.400">
                  Page {currentPage} of {totalPages}
                </Text>

                <ButtonGroup size="sm" attached variant="outline">
                  <Button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    borderColor="gray.600"
                    color="gray.300"
                    _hover={{ bg: "gray.700" }}
                  >
                    Previous
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                    if (pageNum > totalPages) return null;

                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        variant={page === pageNum ? "solid" : "outline"}
                        bg={page === pageNum ? "yellow.400" : "transparent"}
                        color={page === pageNum ? "black" : "gray.300"}
                        borderColor="gray.600"
                        _hover={{
                          bg: page === pageNum ? "yellow.500" : "gray.700",
                        }}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  <Button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    borderColor="gray.600"
                    color="gray.300"
                    _hover={{ bg: "gray.700" }}
                  >
                    Next
                  </Button>
                </ButtonGroup>
              </HStack>
            )}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};
