import { Badge } from "@chakra-ui/react";

export const TransactionStatusBadge = ({ exitCode }: { exitCode: string }) => {
  const getBadgeColor = (code: string) => {
    if (code === "applied") return "green";
    if (code === "partial") return "yellow";
    return "red";
  };

  return (
    <Badge variant="outline" colorPalette={getBadgeColor(exitCode)}>
      {exitCode}
    </Badge>
  );
};
