import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";

export const useAccount = (address: string) => {
	return useQuery({
		queryKey: ["account", address],
		queryFn: async () => {
			const data = await get(`/account/${address}`);
			if (Array.isArray(data)) {
				return data.map((item: any) => ({
					...item,
					tokenAddress:
						typeof item?.tokenAddress === "string"
							? item.tokenAddress
							: item?.tokenAddress?.address ?? "",
				}));
			}
			return data;
		},
		refetchInterval: undefined,
	});
};