import { useSimpleGet } from "./useSimpleGet";
import Fuse from "fuse.js";
import { useMemo } from "react";
import type { Validator } from "../types";

export const useAllValidators = () => {
  return useSimpleGet("all-validators", `/pos/validator/all`);
};

// Fuzzy search hook for validator names using Fuse.js
export const useValidatorNameMatchesFuzzy = (query: string) => {
  const all = useAllValidators();

  const index = useMemo(() => {
    if (!all.data) return null;
    const validators = all.data as Validator[];
    return new Fuse(validators, {
      includeScore: true,
      threshold: 0.2,
      ignoreLocation: true,
      minMatchCharLength: 3,
      keys: [
        {
          name: "name",
          weight: 1,
        },
      ],
    });
  }, [all.data]);

  const matches = useMemo(() => {
    const q = query.trim();
    if (!q || q.length < 3 || !index) return [] as Validator[];
    const results = index.search(q) as Array<{ item: Validator; score?: number }>;
    let items = results
      .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
      .map((r) => r.item);

    // If the query exactly matches a validator address, include that validator
    const lower = q.toLowerCase();
    const allValidators = (all.data as Validator[]) ?? [];
    const exactByAddress = allValidators.find(
      (v) => v.address?.toLowerCase() === lower,
    );
    if (exactByAddress && !items.some((v) => v.address === exactByAddress.address)) {
      items = [exactByAddress, ...items];
    }

    return items.slice(0, 5);
  }, [query, index]);

  return {
    matches,
    isLoading: all.isLoading,
    error: all.error,
  };
};
