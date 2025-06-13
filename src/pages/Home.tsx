import { Box, Heading, Text, VStack, Input, Button, List, ListItem, useToast } from '@chakra-ui/react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import { useNavigate } from 'react-router-dom'

interface Block {
  height: number
  hash: string
  timestamp: string
}

const Home = () => {
  const [searchAddress, setSearchAddress] = useState('')
  const navigate = useNavigate()
  const toast = useToast()

  const { data: latestBlock, isLoading: blockLoading } = useQuery({
    queryKey: ['latestBlock'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/chain/block/latest`)
      return response.data
    },
    refetchInterval: 10000, // Refetch every 10 seconds
  })

  const { data: blocks, isLoading: blocksLoading } = useQuery({
    queryKey: ['blocks', latestBlock?.block],
    queryFn: async () => {
      if (!latestBlock?.block) return []
      
      const latestHeight = parseInt(latestBlock.block)
      const blockPromises = []
      
      // Fetch the latest 10 blocks in descending order
      for (let i = 0; i < 10; i++) {
        const height = latestHeight - i
        if (height > 0) {
          blockPromises.push(
            axios.get(`${API_BASE_URL}/api/v1/block/height/${height}`)
              .then(response => response.data)
              .catch(() => null)
          )
        }
      }
      
      const results = await Promise.all(blockPromises)
      return results.filter(block => block !== null) as Block[]
    },
    enabled: !!latestBlock?.block,
  })

  const handleSearch = () => {
    if (!searchAddress) {
      toast({
        title: 'Error',
        description: 'Please enter an address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }
    navigate(`/account/${searchAddress}`)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000) // Convert Unix timestamp to milliseconds
    return date.toLocaleString()
  }

  return (
    <Box p={4}>
      <VStack align="stretch" gap={8}>
        <Box>
          <Heading size="lg">Namada Block Explorer</Heading>
          <Text color="gray.600" mt={2}>
            Current Block Height: {blockLoading ? 'Loading...' : latestBlock?.block || 'Not available'}
          </Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Search Account</Heading>
          <VStack gap={4}>
            <Input
              placeholder="Enter account address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <Button colorScheme="blue" onClick={handleSearch}>
              Search
            </Button>
          </VStack>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Latest Blocks</Heading>
          {blocksLoading ? (
            <Text>Loading blocks...</Text>
          ) : blocks && blocks.length > 0 ? (
            <List spacing={3}>
              {blocks.map((block: Block) => (
                <ListItem 
                  key={block.hash}
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  cursor="pointer"
                  onClick={() => navigate(`/block/${block.height}`)}
                  _hover={{ bg: 'gray.50' }}
                >
                  <VStack align="start" spacing={1}>
                    <Text><strong>Block #{block.height}</strong></Text>
                    <Text fontSize="sm">Hash: {block.hash}</Text>
                    <Text fontSize="sm">Time: {formatTimestamp(block.timestamp)}</Text>
                  </VStack>
                </ListItem>
              ))}
            </List>
          ) : (
            <Text>No blocks found</Text>
          )}
        </Box>
      </VStack>
    </Box>
  )
}

export default Home 