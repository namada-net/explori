type GridProps = React.PropsWithChildren;
import { Grid as ChakraGrid } from "@chakra-ui/react";

export const Grid = ({ children }: GridProps) => {
  return (
    <ChakraGrid h="100%" flex="1" templateColumns="repeat(12, 1fr)" gap={3}>
      {children}
    </ChakraGrid>
  );
};
