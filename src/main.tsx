import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { Layout } from "./components/Layout";
import "./global.css";
import { Account } from "./pages/Account";
import { BlockDetails } from "./pages/BlockDetails";
import { Blocks } from "./pages/Blocks";
import { Index } from "./pages/Index";
import { Proposals } from "./pages/Proposals";
import { ProposalDetails } from "./pages/ProposalDetails";
import { TransactionDetails } from "./pages/TransactionDetails";
import { Transactions } from "./pages/Transactions";
import { ValidatorDetail } from "./pages/ValidatorDetail";
import { Validators } from "./pages/Validators";
import {
  accountUrl,
  blocksUrl,
  blockUrl,
  transactionsUrl,
  transactionUrl,
  validatorsUrl,
  validatorUrl,
  proposalsUrl,
  proposalUrl,
} from "./routes";
import theme from "./theme";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={theme}>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path={blocksUrl()} element={<Blocks />} />
              <Route path={blockUrl()} element={<BlockDetails />} />
              <Route path={accountUrl()} element={<Account />} />
              <Route path={validatorsUrl()} element={<Validators />} />
              <Route path={validatorUrl()} element={<ValidatorDetail />} />
              <Route path={transactionsUrl()} element={<Transactions />} />
              <Route path={transactionUrl()} element={<TransactionDetails />} />
              <Route path={proposalsUrl()} element={<Proposals />} />
              <Route path={proposalUrl()} element={<ProposalDetails />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  </StrictMode>,
);
