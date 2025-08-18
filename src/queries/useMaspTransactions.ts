import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import { useLatestBlock } from "./useLatestBlock";

export type MaspTransaction = {
  txId: string; // wrapper tx id
  blockHeight: number;
  kind: string; // inner tx kind
  exitCode: string; // inner tx exit code
  feePayer?: string; // from wrapper
};

const MASP_KINDS = new Set([
  "shieldedTransfer",
  "shieldingTransfer",
  "unshieldingTransfer",
  "ibcShieldingTransfer",
  "ibcUnshieldingTransfer",
]);

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
      const innerList: Array<{ kind: string; exitCode: string }> = wrapper?.innerTransactions || [];
      for (const inner of innerList) {
        if (MASP_KINDS.has(inner.kind)) {
          results.push({
            txId: wrapper?.txId ?? wrapper?.wrapperId ?? "",
            blockHeight: bHeight,
            kind: inner.kind,
            exitCode: inner.exitCode,
            feePayer: wrapper?.feePayer,
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
  blocksPerPage: number = 10,
) => {
  const latestBlock = useLatestBlock();
  const latestBlockHeight: number | undefined = latestBlock.data?.block;

  return useQuery({
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
  });
};
