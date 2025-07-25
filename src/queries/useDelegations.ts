import { useQuery } from "@tanstack/react-query";
import { get } from "../http/query";
import { useMemo } from "react";
import type { Bond, Unbond } from "../types";

// Fetch all pages for a given endpoint and concatenate the results
const fetchAllPages = async (endpoint: string, address: string) => {
  const allResults: any[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await get(`${endpoint}/${address}?page=${currentPage}`);
    
    if (response.results && Array.isArray(response.results)) {
      allResults.push(...response.results);
    }

    if (response.pagination) {
      hasMorePages = currentPage < response.pagination.totalPages;
      currentPage++;
    } else {
      hasMorePages = false;
    }
  }

  return allResults;
};

export const useBonds = (address: string, getAllPages: boolean = false) => { 
  return useQuery({
    queryKey: ["bonds", address, getAllPages],
    queryFn: async () => {
      if (!getAllPages) {
        return get("/pos/bond/" + address + "?page=1");
      }
      
      return fetchAllPages("/pos/bond", address);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useUnbonds = (address: string, getAllPages: boolean = false) => { 
  return useQuery({
    queryKey: ["unbonds", address, getAllPages],
    queryFn: async () => {
      if (!getAllPages) {
        return get("/pos/unbond/" + address + "?page=1");
      }
      
      return fetchAllPages("/pos/unbond", address);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useMergedBonds = (address: string, getAllPages: boolean = false) => { 
  return useQuery({
    queryKey: ["merged-bonds", address, getAllPages],
    queryFn: async () => {
      if (!getAllPages) {
        return get("/pos/merged-bonds/" + address + "?page=1");
      }
      
      return fetchAllPages("/pos/merged-bonds", address);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useMergedUnbonds = (address: string, getAllPages: boolean = false) => { 
  return useQuery({
    queryKey: ["merged-unbonds", address, getAllPages],
    queryFn: async () => {
      if (!getAllPages) {
        return get("/pos/merged-unbonds/" + address + "?page=1");
      }
      
      return fetchAllPages("/pos/merged-unbonds", address);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
};

export const useDelegations = (address: string) => {
  const bondsQuery = useBonds(address, true); // getAllPages = true
  const mergedUnbondsQuery = useMergedUnbonds(address, true); // getAllPages = true
  
  const processedDelegations = useMemo(() => {
    if (!bondsQuery.data || !mergedUnbondsQuery.data) {
      return [];
    }
    
    try {
      const allBonds = bondsQuery.data;
      const mergedUnbonds = mergedUnbondsQuery.data;

      // get the pending bonds
      const pendingBonds = allBonds.filter((bond: Bond) => bond.status !== "active");

      // helper function to combine bonds by validator address
      const mergeBondsByValidator = (bonds: Bond[]) => {
        const validatorMap = new Map();
        
        bonds.forEach((bond: Bond) => {
          const validatorAddress = bond.validator.address;
          
          if (validatorMap.has(validatorAddress)) {
            // Add to existing entry
            const existing = validatorMap.get(validatorAddress);
            existing.minDenomAmount = (parseInt(existing.minDenomAmount) + parseInt(bond.minDenomAmount)).toString();
          } else {
            // Create new entry
            validatorMap.set(validatorAddress, { ...bond });
          }
        });
        
        return Array.from(validatorMap.values());
      };

      // combine the bonds by validator and do the same for the pending bonds
      const mergedAllBonds = mergeBondsByValidator(allBonds);
      const mergedPendingBonds = mergeBondsByValidator(pendingBonds);

      return mergedAllBonds.map((allBond: Bond) => {
        const matchingPending = mergedPendingBonds.find((bond: Bond) => bond.validator.address === allBond.validator.address);
        const matchingUnbond = mergedUnbonds.find((bond: Unbond) => bond.validator.address === allBond.validator.address);
        
        return {
          validatorName: allBond.validator.name,
          validatorAddress: allBond.validator.address,
          delegationTotal: parseInt(allBond.minDenomAmount) + (matchingUnbond ? parseInt(matchingUnbond.minDenomAmount) : 0),
          bondingAmount: matchingPending ? parseInt(matchingPending.minDenomAmount) : 0,
          unbondingAmount: matchingUnbond ? parseInt(matchingUnbond.minDenomAmount) : 0,
        };
      });
    } catch(e) {
      console.error(`Error processing delegations: ${e}`);
      return [];
    }
  }, [bondsQuery.data, mergedUnbondsQuery.data]);

  return {
    data: processedDelegations,
    isLoading: bondsQuery.isLoading || mergedUnbondsQuery.isLoading,
    error: bondsQuery.error || mergedUnbondsQuery.error,
  };
};

// Combined bonds and unbonds
export interface CombinedDelegation {
  validatorName: string;
  validatorAddress: string;
  delegationTotal: number; // combination of bonding, unbonding, or bonded
  bondingAmount: number; // pending bonds
  unbondingAmount: number; // pending unbonds
}
