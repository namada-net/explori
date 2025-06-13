import { ChakraProvider, Box } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import BlockDetails from './pages/BlockDetails'
import AccountDetails from './pages/AccountDetails'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        <Router>
          <Box minH="100vh" bg="gray.50">
            <Navbar />
            <Box maxW="1200px" mx="auto" px={4} py={8}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/block/:height" element={<BlockDetails />} />
                <Route path="/account/:address" element={<AccountDetails />} />
              </Routes>
            </Box>
          </Box>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  )
}

export default App
