import { useMemo } from "react";
import { useBlockInfo } from "./useBlockInfo";
import { useLatestBlock } from "./useLatestBlock";

export const useAverageBlockTime = () => {
    const latestBlock = useLatestBlock();
    const windowSize = 5;
    const latestBlockHeight = latestBlock.data?.block ? parseInt(latestBlock.data.block) : null;
    const latestBlockInfo = useBlockInfo(latestBlockHeight ? latestBlockHeight - 1 : null);
    const previousBlockInfo = useBlockInfo(latestBlockHeight ? latestBlockHeight - 1 - windowSize : null);

    const avgBlockTime = useMemo(() => {
        if (!latestBlockInfo?.data?.timestamp || !previousBlockInfo?.data?.timestamp) {
            return null;
        }
        return (latestBlockInfo.data.timestamp - previousBlockInfo.data.timestamp) / windowSize;
    }, [latestBlockInfo?.data?.timestamp, previousBlockInfo?.data?.timestamp, windowSize]);

    return {
        avgBlockTime,
        isLoading: latestBlockInfo?.isLoading || previousBlockInfo?.isLoading,
        latestBlockHeight
    };
};
