import { useSimpleGet } from "./useSimpleGet";
import { useMemo } from "react";
import type { ProposalResponse } from "../types";

export const useProposalFromList = (proposalId: number) => {
  // Get the first page to understand pagination structure
  const { data: firstPage, isLoading: isLoadingFirst } = useSimpleGet(
    "proposals-page-1", 
    "/gov/proposal?page=1"
  );

  const perPage = firstPage?.pagination?.perPage || 30;
  
  // Calculate which page the proposal is likely on
  // Assuming proposals are ordered by ID descending (newest first)
  const estimatedPage = Math.max(1, Math.ceil((firstPage?.pagination?.totalItems || 0 - proposalId + 1) / perPage));
  
  // Fetch the estimated page
  const { data: targetPage, isLoading: isLoadingTarget } = useSimpleGet(
    `proposals-page-${estimatedPage}`, 
    `/gov/proposal?page=${estimatedPage}`,
    undefined,
    !isLoadingFirst // Only fetch when we have the first page data
  );

  const proposal = useMemo(() => {
    // Search in the target page first
    if (targetPage?.results) {
      const found = targetPage.results.find((p: ProposalResponse) => parseInt(p.id) === proposalId);
      if (found) return found;
    }
    
    // Fallback to first page if not found in target page
    if (firstPage?.results) {
      return firstPage.results.find((p: ProposalResponse) => parseInt(p.id) === proposalId);
    }
    
    return null;
  }, [firstPage, targetPage, proposalId]);

  return {
    data: proposal,
    isLoading: isLoadingFirst || isLoadingTarget,
    error: null
  };
};
