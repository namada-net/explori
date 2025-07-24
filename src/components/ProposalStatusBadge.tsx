import { Badge } from "@chakra-ui/react";

export const ProposalStatusBadge = ({ status }: { status: string }) => {
  const getBadgeColor = (code: string) => {
    if (code === "pending") return "purple";
    if (code === "votingPeriod") return "yellow";
    if (code === "passed") return "green";
    if (code === "executedrejected") return "red";
    if (code === "executedPassed") return "green";
    return "red"; // executed
  };

  return (
    <Badge variant="outline" colorPalette={getBadgeColor(status)}>
      {status}
    </Badge>
  );
};
