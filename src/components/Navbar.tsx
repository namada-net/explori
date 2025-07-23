import { Box, Button, Container, Flex, Icon, Link, Stack } from "@chakra-ui/react";
import { FaExternalLinkAlt } from "react-icons/fa";
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

          <Link
            href="https://metrics.namada.net"
            target="_blank"
            rel="noopener noreferrer"
            _hover={{ textDecoration: "none" }}
          >
            <Button
              colorScheme="cyan"
              variant="solid"
              size="sm"
              bg="cyan.600"
              color="white"
              _hover={{ bg: "cyan.500" }}
              _active={{ bg: "cyan.700" }}
            >
              View shielded pool metrics
              <Icon as={FaExternalLinkAlt} ml={2} />
            </Button>
          </Link>

          <Box maxW="lg" flex="1">
            <Search />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};
