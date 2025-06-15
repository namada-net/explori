import { Box, Heading, VStack } from "@chakra-ui/react";

type DataType = {
  title: string;
  content: React.ReactNode;
};

export const Data = ({ title, content }: DataType) => {
  return (
    <VStack align="start" gap={1}>
      <Heading as="h3" size="xs" fontStyle="bold">
        {title}
      </Heading>
      <Box fontSize="sm">{content}</Box>
    </VStack>
  );
};
