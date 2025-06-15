import { get } from "../http/query";
import { useQuery } from "@tanstack/react-query";

export const useSimpleGet = (
  id: string,
  url: string,
  refetchInterval: number | undefined = 10000
) => {
  return useQuery({
    queryKey: [id, url],
    queryFn: async () => {
      return get(url);
    },
    refetchInterval,
  });
};
