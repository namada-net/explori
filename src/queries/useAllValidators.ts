import { useSimpleGet } from "./useSimpleGet";

export const useAllValidators = (
  page?: number,
  state?: string,
  sortField?: string,
  sortOrder?: string
) => {
  const queryParams = new URLSearchParams();

  if (page !== undefined) {
    queryParams.append("page", page.toString());
  }

  if (state && state !== "all") {
    queryParams.append("state", state);
  }

  if (sortField) {
    queryParams.append("sortField", sortField);
  }

  if (sortOrder) {
    queryParams.append("sortOrder", sortOrder);
  }

  const queryString = queryParams.toString();
  const url = `/pos/validator${queryString ? `?${queryString}` : ""}`;

  return useSimpleGet("validators", url);
};
