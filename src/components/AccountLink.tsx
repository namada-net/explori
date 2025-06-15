import { accountUrl } from "../routes";
import { shortenHashOrAddress } from "../utils";
import { Box } from "@chakra-ui/react";
import { Link } from "react-router";

export const AccountLink = ({ address }: { address: string }) => {
  return (
    <Link to={accountUrl(address)} onClick={(e) => e.stopPropagation()}>
      <Box as="span" _hover={{ color: "yellow" }}>
        {shortenHashOrAddress(address)}
      </Box>
    </Link>
  );
};
