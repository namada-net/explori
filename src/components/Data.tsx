import { Box, Heading, VStack } from "@chakra-ui/react";
import React from "react";
import { linkifyText } from "../utils/linkify";

type DataType = {
  title?: string;
  content: unknown;
};

function renderAnything(value: unknown): React.ReactNode {
  if (React.isValidElement(value)) {
    return value;
  }

  if (typeof value === "string") {
    // Always attempt to linkify strings - function will return original string if no URLs found
    return linkifyText(value);
  }

  if (
    typeof value === "number" ||
    value === null ||
    value === undefined ||
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
