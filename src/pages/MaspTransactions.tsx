import { Box, Flex, Heading, Text, VStack, Spinner, Badge } from "@chakra-ui/react";
import { Table } from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { FaShieldAlt } from "react-icons/fa";
import { useMaspTransactionsPage } from "../queries/useMaspTransactions";
import { useLatestBlock } from "../queries/useLatestBlock";
import { Pagination } from "../components/Pagination";
import { Hash } from "../components/Hash";
import { PageLink } from "../components/PageLink";
import { blockUrl, transactionUrl } from "../routes";
import { camelCaseToTitleCase } from "../utils";

export const MaspTransactions = () => {
	const navigate = useNavigate();
	const [currentPage, setCurrentPage] = useState(1);
	const blocksPerPage = 10;

	const latestBlock = useLatestBlock();
	const latestBlockHeight: number | undefined = latestBlock.data?.block;

	const { data, isLoading, error } = useMaspTransactionsPage(currentPage, blocksPerPage);

	const transactions = data || [];
	const totalPages = latestBlockHeight ? Math.ceil(latestBlockHeight / blocksPerPage) : 0;

	if (isLoading && currentPage === 1) {
		return (
			<Box w="100%">
				<Heading as="h1" size="xl" mb={2} color="cyan">
					<Flex gap={2} align="center">
						<FaShieldAlt />
						Recent MASP Transactions
					</Flex>
				</Heading>
				<VStack gap={4} align="center" py={8} bg="gray.800" rounded="md">
					<Spinner size="lg" />
					<Text color="gray.400">Loading MASP transactions...</Text>
				</VStack>
			</Box>
		);
	}

	if (error) {
		return (
			<Box w="100%">
				<Heading as="h1" size="xl" mb={2} color="cyan">
					<Flex gap={2} align="center">
						<FaShieldAlt />
						Recent MASP Transactions
					</Flex>
				</Heading>
				<Box bg="red.100" color="red.800" p={4} rounded="md">
					<Text fontWeight="semibold">Error</Text>
					<Text>Failed to load MASP transactions. Please try again.</Text>
				</Box>
			</Box>
		);
	}

	return (
		<Box w="100%">
			<Heading as="h1" size="xl" mb={2} color="cyan">
				<Flex gap={2} align="center">
					<FaShieldAlt />
					Recent MASP Transactions
				</Flex>
			</Heading>

			{(isLoading && currentPage > 1) ? (
				<VStack gap={4} align="center" py={8} bg="gray.800" rounded="md">
					<Spinner size="lg" />
					<Text color="gray.400">Loading MASP transactions...</Text>
				</VStack>
			) : (
				<>
					<Box overflowX="auto">
						<Table.Root variant="outline" size="sm">
							<Table.Header>
								<Table.Row>
									<Table.ColumnHeader color="gray.300">Hash</Table.ColumnHeader>
									<Table.ColumnHeader color="gray.300">Type</Table.ColumnHeader>
									<Table.ColumnHeader color="gray.300">Status</Table.ColumnHeader>
									<Table.ColumnHeader color="gray.300">Block</Table.ColumnHeader>
									<Table.ColumnHeader color="gray.300">Fee Payer</Table.ColumnHeader>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{transactions.map((tx) => (
									<Table.Row
										key={`${tx.txId}-${tx.kind}-${tx.blockHeight}`}
										_hover={{ bg: "gray.800" }}
										transition="all 0.1s ease-in-out"
										cursor="pointer"
										onClick={() => navigate(transactionUrl(tx.txId))}
									>
										<Table.Cell py={4}>
											<Hash hash={tx.txId} />
										</Table.Cell>
										<Table.Cell>
											<Badge
												variant="subtle"
												colorScheme="gray"
												fontSize="xs"
												textTransform="capitalize"
												fontWeight="medium"
											>
												{camelCaseToTitleCase(tx.kind)}
											</Badge>
										</Table.Cell>
										<Table.Cell>
											<Badge
												variant="subtle"
												backgroundColor={tx.exitCode === "applied" ? "green.500" : "red.500"}
												fontSize="xs"
												textTransform="capitalize"
											>
												{tx.exitCode}
											</Badge>
										</Table.Cell>
										<Table.Cell>
											<PageLink to={blockUrl(tx.blockHeight)}>{tx.blockHeight}</PageLink>
										</Table.Cell>
										<Table.Cell>
											{tx.feePayer ? <Text>{tx.feePayer}</Text> : <Text color="gray.500">-</Text>}
										</Table.Cell>
									</Table.Row>
								))}
							</Table.Body>
						</Table.Root>
					</Box>

					{totalPages > 1 && latestBlockHeight && (
						<Box>
							<Pagination
								currentPage={currentPage}
								count={latestBlockHeight}
								pageSize={blocksPerPage}
								onPageChange={(page) => setCurrentPage(page)}
							/>
						</Box>
					)}
				</>
			)}
		</Box>
	);
};
