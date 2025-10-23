import { useSimpleGet } from "./useSimpleGet";

export const useProposals = (page: number = 1) => {
  const queryParams = new URLSearchParams();
  if (page !== undefined) {
    queryParams.append("page", page.toString());
  }
  const queryString = queryParams.toString();
  const url = `/gov/proposal${queryString ? `?${queryString}` : ""}`;

  return useSimpleGet("proposals", url, undefined, true);
};
