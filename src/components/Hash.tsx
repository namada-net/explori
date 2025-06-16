import { Box, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { FaCheck, FaCopy } from "react-icons/fa6";
import { shortenHashOrAddress } from "../utils";

type HashProps = {
  hash: string;
  enableCopy?: boolean;
};

export const Hash = ({ hash, enableCopy }: HashProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    if (!enableCopy) return;
    e.stopPropagation();
    navigator.clipboard
      .writeText(hash)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      })
      .catch((err) => {
        console.error("Failed to copy hash: ", err);
      });
  };

  return (
    <Flex
      cursor={enableCopy ? "pointer" : "inherit"}
      alignItems="center"
      color="gray.400"
      as="span"
      fontSize="sm"
      lineHeight="shorter"
      _hover={enableCopy ? { color: "gray.200" } : {}}
      onClick={handleCopy}
      overflow="auto"
    >
      <Box as="span" overflow="auto">
        {shortenHashOrAddress(hash, 20)}
      </Box>
      {enableCopy && (
        <Box as="span" ml={2} cursor="pointer" title="Copy to clipboard">
          {copied ? <FaCheck /> : <FaCopy />}
        </Box>
      )}
    </Flex>
  );
};
