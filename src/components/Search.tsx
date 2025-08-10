import { Box, Flex, Input, InputGroup, Text, VStack } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useSearchValue } from "../queries/useSearchValue";
import {
  FaArrowRightArrowLeft,
  FaCubes,
  FaRegFaceFrown,
  FaWallet,
  FaUser,
} from "react-icons/fa6";
import { useNavigate } from "react-router";
import { accountUrl, blockUrl, transactionUrl, validatorUrl } from "../routes";
import { Hash } from "./Hash";
import { useValidatorNameMatchesFuzzy } from "../queries/useAllValidators";
import type { Validator } from "../types";

type SearchResultProps = {
  onClick?: () => void;
} & React.PropsWithChildren;

const SearchResult = ({ onClick, children }: SearchResultProps) => {
  return (
    <Flex
      gap={3}
      alignItems="center"
      py={2}
      px={4}
      w="100%"
      rounded="sm"
      _hover={{ bg: "gray.800", cursor: "pointer" }}
      onClick={onClick}
    >
      {children}
    </Flex>
  );
};

export const Search = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedSearch] = useDebounce(searchValue, 500);
  const search = useSearchValue(debouncedSearch.toLowerCase());
  const { matches: matchedValidators } = useValidatorNameMatchesFuzzy(
    debouncedSearch,
  );
  const emptyResults =
    search.isSuccess &&
    search.data.transactions.length +
      search.data.blocks.length +
      search.data.accounts.length +
      matchedValidators.length ===
      0;

  useEffect(() => {
    document.addEventListener("click", () => {
      setIsFocused(false);
    });
  }, []);

  const goTo = (url: string) => {
    navigate(url);
    setSearchValue("");
    setIsFocused(false);
  };

  return (
    <Box position="relative" onClick={(e) => e.stopPropagation()}>
      <InputGroup flex="1" startElement={<LuSearch />}>
        <Input
          placeholder="Search by address, block number, tx hash, or validator name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
        />
      </InputGroup>
      {isFocused && searchValue.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          mt={2}
          right="0"
          w="110%"
          bg="gray.950"
          rounded="sm"
          px={2}
          py={2}
          fontSize="sm"
          color="gray.200"
          zIndex={10}
        >
          {search.isPending && (
            <Text px={4} py={2}>
              Searching for results...
            </Text>
          )}

          {emptyResults && (
            <Flex alignItems="center" gap={2} px={4} py={2}>
              <FaRegFaceFrown />
              No results found
            </Flex>
          )}

          {!!search.data?.accounts.length && (
            <VStack gap={2} alignItems="start">
              {search.data.accounts.map((account) => (
                <SearchResult
                  key={account}
                  onClick={() => goTo(accountUrl(account))}
                >
                  <Box as="span" color="yellow">
                    <FaWallet />
                  </Box>
                  <Text>
                    Account:
                    <br />
                    {account}
                  </Text>
                </SearchResult>
              ))}
            </VStack>
          )}

          {!!search.data?.transactions.length && (
            <VStack gap={2} alignItems="start">
              {search.data.transactions.map((tx) => (
                <SearchResult key={tx} onClick={() => goTo(transactionUrl(tx))}>
                  <Box as="span" color="yellow">
                    <FaArrowRightArrowLeft />
                  </Box>
                  <Text>
                    Transaction:
                    <br /> <Hash hash={tx} />
                  </Text>
                </SearchResult>
              ))}
            </VStack>
          )}

          {!!search.data?.blocks.length && (
            <VStack gap={2} alignItems="start">
              {search.data.blocks.map((block) => (
                <SearchResult key={block} onClick={() => goTo(blockUrl(block))}>
                  <Box as="span" color="yellow">
                    <FaCubes />
                  </Box>
                  <Text>Block #{block}</Text>
                </SearchResult>
              ))}
            </VStack>
          )}

          {!!matchedValidators.length && (
            <VStack gap={2} alignItems="start">
              {matchedValidators.map((v: Validator) => (
                <SearchResult
                  key={v.address}
                  onClick={() => goTo(validatorUrl(v.address))}
                >
                  <Box as="span" color="yellow">
                    <FaUser />
                  </Box>
                  <Text>
                    Validator:
                    <br />
                    {v.name}
                    <br />
                    <Hash hash={v.address} />
                  </Text>
                </SearchResult>
              ))}
            </VStack>
          )}
        </Box>
      )}
    </Box>
  );
};
