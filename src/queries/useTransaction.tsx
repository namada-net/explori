import { get } from "../http/query";
import { useQuery } from "@tanstack/react-query";

export const useTransaction = (hash: string) => {
  return useQuery({
    queryKey: ["transactions", hash],
    queryFn: async () => {
      if (hash === "") return {};
      try {
        const wrapper = await get("/chain/wrapper/" + hash);
        return {
          type: "wrapper",
          ...wrapper,
        };
      } catch {
        try {
          const inner = await get("/chain/inner/" + hash);
          return {
            type: "inner",
            ...inner,
          };
        } catch {
          throw new Error("Transaction not found");
        }
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};
