import { Box, Container, Flex, VStack } from "@chakra-ui/react";
import { FaCubes, FaHouse } from "react-icons/fa6";
import { Outlet } from "react-router";
import { Navbar } from "./Navbar";
import { MenuItem } from "./MenuItem";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import { FaMoneyCheckDollar } from "react-icons/fa6";
import { FaPeopleGroup } from "react-icons/fa6";

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
            <MenuItem
              label="Transactions"
              url="/transactions"
              icon={<FaArrowRightArrowLeft />}
            />
            <MenuItem label="Blocks" url="/blocks" icon={<FaCubes />} />
            <MenuItem
              label="Accounts"
              url="/accounts"
              icon={<FaMoneyCheckDollar />}
            />
            <MenuItem
              label="Validators"
              url="/validators"
              icon={<FaPeopleGroup />}
            />
          </VStack>
          <Box flex="1" pt={5} pb={12} px={8}>
            <Outlet />
          </Box>
        </Container>
      </Flex>
    </Flex>
  );
};
