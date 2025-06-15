import { Link as ChakraLink, type LinkProps } from "@chakra-ui/react";
import { Link } from "react-router";

type PageLinkProps = {
  to: string;
  children?: React.ReactNode;
} & LinkProps;

export const PageLink = ({ to, ...props }: PageLinkProps) => {
  return (
    <ChakraLink textDecoration="none" color="current" {...props}>
      <Link to={to}>{props.children}</Link>
    </ChakraLink>
  );
};
