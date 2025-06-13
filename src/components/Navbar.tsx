import { Box, Flex, Link, Heading } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'

const Navbar = () => {
  return (
    <Box bg="white" px={4} shadow="sm">
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        <Heading size="md" color="blue.600">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            Namada Explorer
          </Link>
        </Heading>
        <Flex gap={4}>
          <Link as={RouterLink} to="/" color="gray.600" _hover={{ color: 'blue.600' }}>
            Home
          </Link>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Navbar 