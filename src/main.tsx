import "./global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider } from "@chakra-ui/react";
import { Index } from "./pages/Index";
import { Account } from "./pages/Account";
import { Validators } from "./pages/Validators";
import { ValidatorDetail } from "./pages/ValidatorDetail";
import { Layout } from "./components/Layout";
import { BlockDetails } from "./pages/BlockDetails";
import {
  accountUrl,
  blocksUrl,
  blockUrl,
  transactionUrl,
  validatorsUrl,
  validatorUrl,
} from "./routes";
import theme from "./theme";
import { TransactionDetails } from "./pages/TransactionDetails";
import { Blocks } from "./pages/Blocks";
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
              <Route path={transactionUrl()} element={<TransactionDetails />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ChakraProvider>
    </QueryClientProvider>
  </StrictMode>,
);
