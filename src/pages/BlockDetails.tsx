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
  AccordionIcon,
  Code
} from '@chakra-ui/react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { API_BASE_URL } from '../config'
import type { TransactionDetails, InnerTransaction } from '../types/transaction'
import { formatTimestamp, formatAmount } from '../types/transaction'

interface Block {
  height: number
  hash: string
  timestamp: string
  transactions: string[]
}

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

export default function BlockDetails() {
  const { height } = useParams<{ height: string }>()
  const toast = useToast()

  const { data: block, isLoading: isLoadingBlock } = useQuery<Block>({
    queryKey: ['block', height],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/api/v1/block/height/${height}`)
      return response.data
    },
    enabled: !!height
  })

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<TransactionDetails[]>({
    queryKey: ['transactions', block?.transactions],
    queryFn: async () => {
      if (!block?.transactions) return []
      const txPromises = block.transactions.map(txHash =>
        axios.get(`${API_BASE_URL}/api/v1/chain/wrapper/${txHash}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching transaction ${txHash}:`, error)
            return null
          })
      )
      const results = await Promise.all(txPromises)
      return results.filter((tx): tx is TransactionDetails => tx !== null)
    },
    enabled: !!block?.transactions
  })

  if (isLoadingBlock || isLoadingTransactions) {
    return <Text>Loading...</Text>
  }

  if (!block || !transactions) {
    return <Text>Block not found</Text>
  }

  return (
    <VStack spacing={6} align="stretch" p={4}>
      <Box>
        <Heading size="lg">Block Details</Heading>
        <Text>Height: {block.height}</Text>
        <Text>Hash: {block.hash}</Text>
        <Text>Timestamp: {formatTimestamp(block.timestamp)}</Text>
      </Box>

      <Box>
        <Heading size="md" mb={4}>Transactions</Heading>
        <Accordion allowMultiple>
          {transactions.map((tx) => (
            <AccordionItem key={tx.txId}>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="bold">Transaction: {tx.txId}</Text>
                  <Text fontSize="sm">
                    Fee Payer: {tx.feePayer} | Gas Used: {tx.gasUsed}/{tx.gasLimit} | 
                    Amount/Gas: {tx.amountPerGasUnit} | Status: 
                    <Badge ml={2} colorScheme={tx.exitCode === 'applied' ? 'green' : 'red'}>
                      {tx.exitCode}
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
                    {tx.innerTransactions.map((innerTx) => (
                      <InnerTransactionRow key={innerTx.txId} tx={innerTx} />
                    ))}
                  </Tbody>
                </Table>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </VStack>
  )
} 