import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import type { AccountResponse } from "../types";

export const useAccount = (address: string) => {
	return useQuery({
		queryKey: ["account", address],
		queryFn: async () => {
			const data = await get(`/account/${address}`);
			if (Array.isArray(data)) {
				return data.map((item: AccountResponse[0]) => ({
					...item,
					tokenAddress: item?.token?.address ?? "",
					trace: item?.token?.trace,
				}));
			}
			return data;
		},
		refetchInterval: undefined,
	});
};