import { Flex } from "@chakra-ui/react";
import { Link } from "react-router";

type MenuItemProps = {
  label: string;
  url: string;
  icon?: React.ReactNode;
};

export const MenuItem = ({ label, url, icon }: MenuItemProps) => {
  const target = url.startsWith("http") ? "_blank" : undefined;
  const rel = url.startsWith("http") ? "noopener noreferrer" : undefined;
  return (
    <li>
      <Link to={url} target={target} rel={rel}>
        <Flex alignItems="center" gap={3} _hover={{ color: "yellow" }}>
          {icon && <i>{icon}</i>}
          {label}
        </Flex>
      </Link>
    </li>
  );
};
