import { useQuery } from "@tanstack/react-query";
import {
    queryNativeToken,
    queryAllValidators,
    queryBalance,
    queryPublicKey,
    queryTotalDelegations,
    queryStakingTotals,
    queryStakingPositions,
    queryTotalBonds,
    queryGasCosts,
    queryChecksums,
} from "../http/rpc";

/**
 * Hook to get native token information
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcNativeToken = () => {
    return useQuery({
        queryKey: ["rpc", "nativeToken"],
        queryFn: queryNativeToken,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get all validators
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcAllValidators = () => {
    return useQuery({
        queryKey: ["rpc", "allValidators"],
        queryFn: queryAllValidators,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get account balance for specific tokens
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcBalance = (
    owner: string | null | undefined,
    tokens: string[],
    chainId: string
) => {
    const isValid = owner && tokens.length > 0 && chainId;

    return useQuery({
        queryKey: ["rpc", "balance", owner, tokens, chainId],
        queryFn: async () => {
            if (!owner) {
                throw new Error("Owner address is required");
            }
            return queryBalance(owner, tokens, chainId);
        },
        enabled: !!isValid,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get public key for an address
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcPublicKey = (address: string | null | undefined) => {
    const isValid = address && address.length > 0;

    return useQuery({
        queryKey: ["rpc", "publicKey", address],
        queryFn: async () => {
            if (!address) {
                throw new Error("Address is required");
            }
            return queryPublicKey(address);
        },
        enabled: !!isValid,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get total delegations for owners
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcTotalDelegations = (
    owners: string[],
    epoch?: bigint
) => {
    const isValid = owners.length > 0;

    return useQuery({
        queryKey: ["rpc", "totalDelegations", owners, epoch?.toString()],
        queryFn: async () => {
            return queryTotalDelegations(owners, epoch);
        },
        enabled: isValid,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get staking totals for owners
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcStakingTotals = (owners: string[]) => {
    const isValid = owners.length > 0;

    return useQuery({
        queryKey: ["rpc", "stakingTotals", owners],
        queryFn: async () => {
            return queryStakingTotals(owners);
        },
        enabled: isValid,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get staking positions for owners
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcStakingPositions = (owners: string[]) => {
    const isValid = owners.length > 0;

    return useQuery({
        queryKey: ["rpc", "stakingPositions", owners],
        queryFn: async () => {
            return queryStakingPositions(owners);
        },
        enabled: isValid,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get total bonds for an owner
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcTotalBonds = (owner: string | null | undefined) => {
    const isValid = owner && owner.length > 0;

    return useQuery({
        queryKey: ["rpc", "totalBonds", owner],
        queryFn: async () => {
            if (!owner) {
                throw new Error("Owner address is required");
            }
            return queryTotalBonds(owner);
        },
        enabled: !!isValid,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get gas costs
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcGasCosts = () => {
    return useQuery({
        queryKey: ["rpc", "gasCosts"],
        queryFn: queryGasCosts,
        staleTime: Infinity,
        gcTime: Infinity,
    });
};

/**
 * Hook to get code checksums
 * Data is fetched once and cached indefinitely (static)
 */
export const useRpcChecksums = () => {
    return useQuery({
        queryKey: ["rpc", "checksums"],
        queryFn: queryChecksums,
        staleTime: Infinity,
        gcTime: Infinity,
    });
}; 