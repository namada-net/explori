import { get } from "../http/query";
import { useQuery } from "@tanstack/react-query";

export const useProposal = (id: number) => {
  return useQuery({
    queryKey: ["proposals", id],
    queryFn: async () => {
        return get("/gov/proposal/" + id);
      },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
