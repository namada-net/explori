import { Box, Text, Stack, HStack, Spinner } from "@chakra-ui/react";
import { useRpcNativeToken, useRpcAllValidators, useRpcGasCosts } from "../queries/useRpcQuery";

/**
 * Example component demonstrating RPC query usage
 * Shows chain information fetched via Namada SDK RPC queries
 */
export const ChainInfo = () => {
    const {
        data: nativeToken,
        isLoading: isLoadingToken,
        error: tokenError,
    } = useRpcNativeToken();

    const {
        data: validators,
        isLoading: isLoadingValidators,
        error: validatorsError,
    } = useRpcAllValidators();

    const {
        data: gasCosts,
        isLoading: isLoadingGas,
        error: gasError,
    } = useRpcGasCosts();

    const isLoading = isLoadingToken || isLoadingValidators || isLoadingGas;
    const hasError = tokenError || validatorsError || gasError;

    if (isLoading) {
        return (
            <Box p={4}>
                <HStack>
                    <Spinner size="sm" />
                    <Text>Loading chain information...</Text>
                </HStack>
            </Box>
        );
    }

    if (hasError) {
        return (
            <Box p={4} bg="red.50" borderRadius="md" borderColor="red.200" borderWidth="1px">
                <Text color="red.600">
                    Failed to load chain information. Check your RPC connection.
                </Text>
            </Box>
        );
    }

    return (
        <Box p={4} borderWidth="1px" borderRadius="md">
            <Stack gap={4}>
                <Text fontSize="lg" fontWeight="bold">
                    Chain Information (RPC)
                </Text>

                {nativeToken && (
                    <HStack>
                        <Text fontWeight="semibold">Native Token:</Text>
                        <Text fontFamily="mono" fontSize="sm">
                            {nativeToken}
                        </Text>
                    </HStack>
                )}

                {validators && (
                    <HStack>
                        <Text fontWeight="semibold">Total Validators:</Text>
                        <Text>{validators.length}</Text>
                    </HStack>
                )}

                {gasCosts && Object.keys(gasCosts).length > 0 && (
                    <Stack gap={2}>
                        <Text fontWeight="semibold">Gas Costs:</Text>
                        <Box pl={4}>
                            {Object.entries(gasCosts).slice(0, 3).map(([token, cost]) => (
                                <HStack key={token}>
                                    <Text fontSize="sm" fontFamily="mono">
                                        {token}:
                                    </Text>
                                    <Text fontSize="sm">{cost}</Text>
                                </HStack>
                            ))}
                            {Object.keys(gasCosts).length > 3 && (
                                <Text fontSize="sm" color="gray.500">
                                    ... and {Object.keys(gasCosts).length - 3} more
                                </Text>
                            )}
                        </Box>
                    </Stack>
                )}
            </Stack>
        </Box>
    );
}; 