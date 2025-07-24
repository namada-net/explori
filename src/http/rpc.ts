import { Sdk, getSdk, getNativeToken } from "@namada/sdk/web";
import init from "@namada/sdk/web-init";

// RPC client instance
let rpcClient: Sdk | null = null;
let cryptoMemory: WebAssembly.Memory | null = null;

/**
 * Initialize the Namada RPC client
 */
export const initRpcClient = async (): Promise<Sdk> => {
    if (rpcClient) {
        return rpcClient;
    }

    const rpcUrl = import.meta.env.VITE_RPC_URL || "http://rpc.namada.tududes.com";
    const maspIndexerUrl = import.meta.env.VITE_MASP_INDEXER_URL || "";
    const dbName = "namada-explorer-db";

    try {
        // Initialize WebAssembly memory if not already done
        if (!cryptoMemory) {
            const { cryptoMemory: memory } = await init();
            cryptoMemory = memory;
        }

        // Get native token from the chain
        const nativeToken = await getNativeToken(rpcUrl);

        // Create SDK instance
        rpcClient = getSdk(cryptoMemory, rpcUrl, maspIndexerUrl, dbName, nativeToken);
        return rpcClient;
    } catch (error) {
        console.error("Failed to initialize RPC client:", error);
        throw new Error(`Failed to connect to RPC endpoint: ${rpcUrl}`);
    }
};

/**
 * Get the initialized RPC client or throw an error
 */
export const getRpcClient = (): Sdk => {
    if (!rpcClient) {
        throw new Error("RPC client not initialized. Call initRpcClient() first.");
    }
    return rpcClient;
};

/**
 * Generic RPC query wrapper with error handling
 */
export const rpcQuery = async <T>(
    queryFn: (client: Sdk) => Promise<T>
): Promise<T> => {
    try {
        const client = await initRpcClient();
        return await queryFn(client);
    } catch (error) {
        console.error("RPC query failed:", error);
        throw error;
    }
};

// Specific RPC query functions

/**
 * Get native token information
 */
export const queryNativeToken = async () => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryNativeToken();
    });
};

/**
 * Get all validators
 */
export const queryAllValidators = async () => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryAllValidators();
    });
};

/**
 * Get account balance for specific tokens
 */
export const queryBalance = async (owner: string, tokens: string[], chainId: string) => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryBalance(owner, tokens, chainId);
    });
};

/**
 * Get public key for an address
 */
export const queryPublicKey = async (address: string) => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryPublicKey(address);
    });
};

/**
 * Get total delegations for owners
 */
export const queryTotalDelegations = async (owners: string[], epoch?: bigint) => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryTotalDelegations(owners, epoch);
    });
};

/**
 * Get staking totals by owner addresses
 */
export const queryStakingTotals = async (owners: string[]) => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryStakingTotals(owners);
    });
};

/**
 * Get staking positions by owner addresses
 */
export const queryStakingPositions = async (owners: string[]) => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryStakingPositions(owners);
    });
};

/**
 * Get total bonds for an owner
 */
export const queryTotalBonds = async (owner: string) => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryTotalBonds(owner);
    });
};

/**
 * Get gas costs
 */
export const queryGasCosts = async () => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryGasCosts();
    });
};

/**
 * Get code checksums
 */
export const queryChecksums = async () => {
    return rpcQuery(async (client) => {
        return await client.rpc.queryChecksums();
    });
}; 