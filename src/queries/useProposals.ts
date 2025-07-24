import { get } from "../http/query";
import { useQuery } from "@tanstack/react-query";

export const useProposals = () => {
  return useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
        return get("/gov/proposal/all");
      },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
