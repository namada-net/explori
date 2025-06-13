import {
  Box,
  Heading,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import type { TransactionDetails, InnerTransaction } from '../types/transaction'
import { formatTimestamp, formatAmount } from '../types/transaction'

function InnerTransactionRow({ tx }: { tx: InnerTransaction }) {
  let sender = '-'
  let token = '-'
  try {
    const data = JSON.parse(tx.data)
    if (data.sources && data.sources.length > 0) {
      sender = data.sources[0].owner
      token = data.sources[0].token === 'tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7' ? 'NAM' : data.sources[0].token
    }
  } catch (e) {
    console.error('Error parsing transaction data:', e)
  }

  return (
    <Tr>
      <Td>{tx.txId}</Td>
      <Td>
        <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
          {tx.kind}
        </Badge>
      </Td>
      <Td>
        <Badge colorScheme={tx.exitCode === 'applied' ? 'green' : 'red'}>
          {tx.exitCode}
        </Badge>
      </Td>
      <Td>
        <VStack align="start" spacing={1}>
          <Text fontSize="sm"><strong>Sender:</strong> {sender}</Text>
          <Text fontSize="sm"><strong>Token:</strong> {token}</Text>
        </VStack>
      </Td>
      <Td>{tx.memo || '-'}</Td>
    </Tr>
  )
}

export default function AccountDetails() {
  const { address } = useParams<{ address: string }>()
  const toast = useToast()

  const { data: account, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['account', address],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/account/${address}`)
      return response.data
    },
    enabled: !!address
  })

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions', address],
    queryFn: async () => {
      if (!address) return []
      const response = await axios.get(`${API_BASE_URL}/api/v1/chain/history?addresses=${address}`)
      return response.data.results || []
    },
    enabled: !!address
  })

  if (isLoadingAccount || isLoadingTransactions) {
    return <Text>Loading...</Text>
  }

  return (
    <VStack spacing={6} align="stretch" p={4}>
      <Box>
        <Heading size="lg">Account Details</Heading>
        {account && Array.isArray(account) ? (
          <VStack align="start" spacing={2} mt={4}>
            <Text><strong>Address:</strong> {address}</Text>
            <Text><strong>Balances:</strong></Text>
            <VStack align="start" pl={4} spacing={1}>
              {account.filter((b: any) => b.minDenomAmount !== "0").map((b: any) => {
                const tokenName = b.tokenAddress === 'tnam1q9gr66cvu4hrzm0sd5kmlnjje82gs3xlfg3v6nu7' ? 'NAM' : b.tokenAddress
                return (
                  <Text key={b.tokenAddress} fontSize="sm">
                    {formatAmount(b.minDenomAmount)} {tokenName}
                  </Text>
                )
              })}
            </VStack>
            <Text><strong>Total Transactions:</strong> {/* Optionally fetch or display if available */}</Text>
          </VStack>
        ) : (
          <Text color="red.500" mt={4}>Account not found</Text>
        )}
      </Box>

      {transactions && transactions.length > 0 && (
        <Box>
          <Heading size="md" mb={4}>Transaction History</Heading>
          <Accordion allowMultiple>
            {transactions.map((item: any) => (
              <AccordionItem key={item.tx.txId}>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">Transaction: {item.tx.txId}</Text>
                    <Text fontSize="sm">
                      Kind: {item.tx.kind} | Block Height: {item.blockHeight} | Status: 
                      <Badge ml={2} colorScheme={item.tx.exitCode === 'applied' ? 'green' : 'red'}>
                        {item.tx.exitCode}
                      </Badge>
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Table size="sm">
                    <Thead>
                      <Tr>
                        <Th>Transaction ID</Th>
                        <Th>Kind</Th>
                        <Th>Status</Th>
                        <Th>Data</Th>
                        <Th>Memo</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>{item.tx.txId}</Td>
                        <Td>
                          <Badge colorScheme="blue" fontSize="sm" px={2} py={1}>
                            {item.tx.kind}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={item.tx.exitCode === 'applied' ? 'green' : 'red'}>
                            {item.tx.exitCode}
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="xs" maxW="300px" whiteSpace="pre-wrap" wordBreak="break-all">
                            {item.tx.data}
                          </Text>
                        </Td>
                        <Td>{item.tx.memo || '-'}</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </Box>
      )}
    </VStack>
  )
} 