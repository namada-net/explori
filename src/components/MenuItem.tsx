import { Flex } from "@chakra-ui/react";
import { Link, useLocation, useNavigate } from "react-router";

type MenuItemProps = {
  label: string;
  url: string;
  icon?: React.ReactNode;
};

export const MenuItem = ({ label, url, icon }: MenuItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const target = url.startsWith("http") ? "_blank" : undefined;
  const rel = url.startsWith("http") ? "noopener noreferrer" : undefined;
  
  const handleClick = (e: React.MouseEvent) => {
    // For internal routes, if we're already on the same path, replace to clear query params
    if (!url.startsWith("http") && location.pathname === url) {
      e.preventDefault();
      navigate(url, { replace: true });
    }
  };
  
  return (
    <li>
      <Link to={url} target={target} rel={rel} onClick={handleClick}>
        <Flex alignItems="center" gap={3} _hover={{ color: "yellow" }}>
          {icon && <i>{icon}</i>}
          {label}
        </Flex>
      </Link>
    </li>
  );
};
