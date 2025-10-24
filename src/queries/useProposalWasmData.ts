import { useSimpleGet } from "./useSimpleGet";

export const useProposalWasmData = (proposalId: number) => {
    return useSimpleGet(
        `proposal-wasm-data-${proposalId}`,
        `/gov/proposal/${proposalId}/data`,
        undefined,
        proposalId > 0 // Only fetch if we have a valid proposal ID
    );
};
