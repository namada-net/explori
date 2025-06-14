import { Box, Container, Flex, Stack } from "@chakra-ui/react";
import { NamadaIcon } from "./NamadaIcon";
import { Search } from "./Search";

export const Navbar = () => {
  return (
    <Box as="nav" borderBottom={1} borderStyle="solid" borderColor="gray.800">
      <Container fluid>
        <Stack
          divideColor="red"
          as="header"
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          h={16}
          py={2}
        >
          <Flex color="yellow" fontSize="lg" alignItems="center" gap={3}>
            <Box as="i" w={10}>
              <NamadaIcon />
            </Box>
            Namada Explorer
          </Flex>
          <Box maxW="lg" flex="1">
            <Search />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
