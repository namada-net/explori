import { Flex } from "@chakra-ui/react";
import { Link } from "react-router";

type MenuItemProps = {
  label: string;
  url: string;
  icon: React.ReactNode;
};

export const MenuItem = ({ label, url, icon }: MenuItemProps) => {
  return (
    <li>
      <Link to={url}>
        <Flex alignItems="center" gap={3} _hover={{ color: "yellow" }}>
          <i>{icon}</i>
          {label}
        </Flex>
      </Link>
    </li>
  );
};
