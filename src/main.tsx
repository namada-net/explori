import "./global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import { ChakraProvider } from "@chakra-ui/react";
import { Index } from "./pages/Index";
import { Layout } from "./components/Layout";
import theme from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider value={theme}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
);
