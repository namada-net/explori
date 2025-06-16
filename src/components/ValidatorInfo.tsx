import { Grid, GridItem } from "@chakra-ui/react";
import type { Validator } from "../types";
import { OverviewCard } from "./OverviewCard";
import { Hash } from "./Hash";

export const ValidatorInfo = ({
  validator,
  numDelegators,
}: {
  validator: Validator;
  numDelegators: number;
}) => {
  const formatAmount = (amount: string | number) => {
    if (!amount) return "0";
    return parseFloat(amount.toString()).toLocaleString(undefined, {
      minimumFractionDigits: 6,
    });
  };

  const formatPercentage = (value: string) => {
    return `${(parseFloat(value) * 100).toFixed()}%`;
  };

  return (
    <Grid templateColumns="1fr 1fr 1fr 1fr" gap={2}>
      <GridItem colSpan={2}>
        <OverviewCard title="Address">
          <Hash hash={validator.address} enableCopy />
        </OverviewCard>
      </GridItem>
      <OverviewCard title="Rank">#{validator.rank || "-"}</OverviewCard>
      <OverviewCard title="Voting Power">
        {formatAmount(validator.votingPower)} NAM
      </OverviewCard>
      <OverviewCard title="Commission">
        {validator.commission ? formatPercentage(validator.commission) : "0%"}
      </OverviewCard>
      <OverviewCard title="Max Commission">
        {validator.maxCommission
          ? formatPercentage(validator.maxCommission)
          : "0%"}
      </OverviewCard>
      <OverviewCard title="Delegators">{numDelegators}</OverviewCard>
    </Grid>
  );
};
