import { Flex, Heading, SkeletonText, VStack } from "@chakra-ui/react";

type OverviewCardProps = {
  title: string;
  isLoading?: boolean;
} & React.PropsWithChildren;

export const OverviewCard = ({
  title,
  children,
  isLoading,
}: OverviewCardProps) => {
  return (
    <VStack
      bg="gray.800"
      px={4}
      py={2}
      minW="150px"
      align="start"
      gap={1}
      rounded="sm"
    >
      <Heading as="h3" size="sm">
        {title}
      </Heading>
      <Flex 
        w="100%" 
        minH="6" 
        alignItems="center" 
        fontSize="sm"
        wordBreak="break-all"
        whiteSpace="normal"
      >
        {isLoading ? (
          <SkeletonText
            variant="shine"
            noOfLines={1}
            height="4"
            width="100%"
            css={{
              "--start-color": "colors.gray.700",
              "--end-color": "colors.gray.800",
            }}
          />
        ) : (
          children
        )}
      </Flex>
    </VStack>
  );
};
