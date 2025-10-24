import { useSimpleGet } from "./useSimpleGet";

export type VotingRecord = {
    proposalId: number;
    vote: "yay" | "nay" | "abstain";
    voterAddress: string;
};

export const useVotingRecord = (address: string) => {
    return useSimpleGet(
        `voting-record-${address}`,
        `/gov/voter/${address}/votes`,
        undefined,
        !!address // Only fetch if we have a valid address
    );
};
