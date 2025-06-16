import { Box, Container, Flex, Separator, VStack } from "@chakra-ui/react";
import {
  FaCubes,
  FaDiscord,
  FaHouse,
  FaPeopleGroup,
  FaTelegram,
  FaXTwitter,
} from "react-icons/fa6";
import { Outlet } from "react-router";
import { MenuItem } from "./MenuItem";
import { NamadaIcon } from "./NamadaIcon";
import { Navbar } from "./Navbar";

export const Layout = () => {
  return (
    <Flex
      direction="column"
      className="dark"
      background="gray.900"
      color="gray.50"
      minH="100vh"
    >
      <Navbar />
      <Flex flex="1">
        <Container fluid display="flex" gap={3}>
          <VStack
            as="ul"
            w="200px"
            align="stretch"
            borderRight="1px solid"
            borderColor="gray.800"
            pt={6}
            gap={4}
          >
            <MenuItem label="Home" url="/" icon={<FaHouse />} />
            <MenuItem label="Blocks" url="/blocks" icon={<FaCubes />} />
            <MenuItem
              label="Validators"
              url="/validators"
              icon={<FaPeopleGroup />}
            />
            <Separator mr={6} />
            <VStack gap={3} align="start" color="gray.300" fontSize="sm">
              <MenuItem
                label="Namada.net"
                url="https://namada.net"
                icon={
                  <Box w="15px">
                    <NamadaIcon />
                  </Box>
                }
              />
              <MenuItem
                label="X.com"
                url="https://x.com/namada"
                icon={<FaXTwitter />}
              />
              <MenuItem
                label="Discord"
                url="https://discord.com/invite/namada"
                icon={<FaDiscord />}
              />
              <MenuItem
                label="Telegram"
                url="https://t.me/namadaprotocol"
                icon={<FaTelegram />}
              />
            </VStack>
          </VStack>
          <Box flex="1" pt={5} pb={12} px={8} overflow="auto">
            <Outlet />
          </Box>
        </Container>
      </Flex>
    </Flex>
  );
};
