import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";

export type MaspTransaction = {
  txId: string; // wrapper tx id
  innerTxId: string; // inner tx id
  blockHeight: number;
  kind: string; // inner tx kind
  exitCode: string; // inner tx exit code
  feePayer?: string; // from wrapper
  timestamp?: string; // block timestamp for age calculation
  source?: string; // from inner transaction data
  target?: string; // from inner transaction data
  amount?: string; // from inner transaction data
  token?: string; // from inner transaction data
};

const MASP_KINDS = new Set([
  "shieldedTransfer",
  "shieldingTransfer",
  "unshieldingTransfer",
  "ibcShieldingTransfer",
  "ibcUnshieldingTransfer",
]);

// Static version of latest block hook that doesn't auto-refetch
const useStaticLatestBlock = () => {
  return useQuery({
    queryKey: ["static-latest-block"],
    queryFn: async () => {
      return get("/chain/block/latest");
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: false, // Disable automatic refetching
  });
};

const fetchMaspTransactionsPage = async (
  latestBlockHeight: number,
  page: number,
  blocksPerPage: number,
): Promise<MaspTransaction[]> => {
  const startBlock = Math.max(latestBlockHeight - (page - 1) * blocksPerPage, 1);
  const endBlock = Math.max(startBlock - blocksPerPage + 1, 1);

  const blockHeights: number[] = [];
  for (let n = startBlock; n >= endBlock; n--) {
    blockHeights.push(n);
  }

  const blocks = await Promise.all(
    blockHeights.map((h) => get("/block/height/" + h)),
  );

  // For each block, fetch wrapper transactions and filter inner by MASP kinds
  const wrapperFetches: Array<Promise<any[]>> = blocks.map(async (block, idx) => {
    const bHeight = blockHeights[idx];
    const txHashes: string[] = Array.isArray(block?.transactions)
      ? block.transactions
      : [];
    if (txHashes.length === 0) return [];

    const wrappers = await Promise.all(
      txHashes.map(async (hash) => {
        try {
          const wrapper = await get("/chain/wrapper/" + hash);
          return { wrapper, hash };
        } catch (e) {
          // If wrapper not found, try inner (unlikely for block tx list), skip if also fails
          try {
            const inner = await get("/chain/inner/" + hash);
            return { wrapper: inner, hash };
          } catch {
            return null;
          }
        }
      }),
    );

    const valid = wrappers.filter((w) => w !== null) as Array<{ wrapper: any; hash: string }>;

    const results: MaspTransaction[] = [];
    for (const { wrapper } of valid) {
      const innerList: Array<{ kind: string; exitCode: string; data?: string; txId?: string }> = wrapper?.innerTransactions || [];
      for (const inner of innerList) {
        if (MASP_KINDS.has(inner.kind)) {
          // Parse inner transaction data to extract source, target, amount, token
          let source, target, amount, token;
          
          // For shielded transfers, source and target are both MASP
          if (inner.kind === "shieldedTransfer") {
            source = "MASP";
            target = "MASP";
          } else if (inner.data) {
                          try {
                const parsedData = JSON.parse(inner.data);
                // Handle different data structures based on transaction type
                if (Array.isArray(parsedData)) {
                  // Look for sources and targets in the array
                  const sourceSection = parsedData.find((section: any) => section.sources);
                  const targetSection = parsedData.find((section: any) => section.targets);
                  
                  if (sourceSection?.sources?.[0]) {
                    source = sourceSection.sources[0].owner;
                    amount = sourceSection.sources[0].amount;
                    token = sourceSection.sources[0].token;
                  }
                  
                  if (targetSection?.targets?.[0]) {
                    target = targetSection.targets[0].owner;
                    // Use target amount if source amount not found
                    if (!amount) {
                      amount = targetSection.targets[0].amount;
                    }
                    if (!token) {
                      token = targetSection.targets[0].token;
                    }
                  }
                } else if (parsedData.sources?.[0] || parsedData.targets?.[0]) {
                  // Direct sources/targets structure (like unshielding transactions)
                  if (parsedData.sources?.[0]) {
                    source = parsedData.sources[0].owner;
                    amount = parsedData.sources[0].amount;
                    token = parsedData.sources[0].token;
                  }
                  
                  if (parsedData.targets?.[0]) {
                    target = parsedData.targets[0].owner;
                    // Use target amount if source amount not found
                    if (!amount) {
                      amount = parsedData.targets[0].amount;
                    }
                    if (!token) {
                      token = parsedData.targets[0].token;
                    }
                  }
                }
              } catch (e) {
                // If parsing fails, continue without the additional data
              }
          }

          results.push({
            txId: wrapper?.txId ?? wrapper?.wrapperId ?? "",
            innerTxId: inner?.txId ?? "",
            blockHeight: bHeight,
            kind: inner.kind,
            exitCode: inner.exitCode,
            feePayer: wrapper?.feePayer,
            timestamp: block?.timestamp,
            source,
            target,
            amount,
            token,
          });
        }
      }
    }
    return results;
  });

  const perBlockResults = await Promise.all(wrapperFetches);
  // Flatten and keep block-descending order as built above
  return perBlockResults.flat();
};

export const useMaspTransactionsPage = (
  page: number,
  blocksPerPage: number = 100,
) => {
  const latestBlock = useStaticLatestBlock();
  const latestBlockHeight: number | undefined = latestBlock.data?.block;

  const transactionsQuery = useQuery({
    queryKey: ["masp-transactions-page", page, blocksPerPage, latestBlockHeight],
    queryFn: async () => {
      if (!latestBlockHeight || latestBlockHeight <= 0) {
        throw new Error("Latest block not available");
      }
      return fetchMaspTransactionsPage(latestBlockHeight, page, blocksPerPage);
    },
    enabled: !!latestBlockHeight,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchInterval: false, // Disable automatic refetching
  });

  return {
    ...transactionsQuery,
    latestBlockHeight,
  };
};
