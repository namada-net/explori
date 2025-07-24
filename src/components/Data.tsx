import { Box, Heading, VStack } from "@chakra-ui/react";
import React from "react";

type DataType = {
  title?: string;
  content: unknown;
};

function renderAnything(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return "-";
  }

  if (
    React.isValidElement(value) ||
    typeof value === "string" ||
    typeof value === "number" ||
    value === false
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => (
      <React.Fragment key={index}>{renderAnything(item)}</React.Fragment>
    ));
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export const Data = ({ title, content }: DataType) => {
  return (
    <VStack align="start" gap={1} overflow="auto">
      <Heading as="h3" size="xs" fontStyle="bold">
        {title}
      </Heading>
      <Box fontSize="sm" maxW="100%" overflow="auto">
        {renderAnything(content)}
      </Box>
    </VStack>
  );
};
