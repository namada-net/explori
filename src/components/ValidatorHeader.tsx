import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Image,
  Button,
} from "@chakra-ui/react";
import type { Validator } from "../types";
import { FaDiscord, FaGlobe } from "react-icons/fa6";

type ValidatorProps = {
  validator: Validator;
};

export const ValidatorHeader = ({ validator }: ValidatorProps) => {
  return (
    <Box bg="gray.800" p={6} rounded="md">
      <HStack align="start" gap={6}>
        <Box
          width="80px"
          height="80px"
          borderRadius="full"
          overflow="hidden"
          bg="gray.600"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          position="relative"
        >
          {validator.avatar ? (
            <>
              <Image
                src={validator.avatar}
                alt={validator.name || "Validator"}
                width="80px"
                height="80px"
                objectFit="cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </>
          ) : (
            <Text fontSize="2xl" color="gray.300">
              {(validator.name || "U")[0].toUpperCase()}
            </Text>
          )}
        </Box>

        <VStack align="start" flex={1} gap={3}>
          <HStack align="center" gap={3}>
            <Heading as="h1" size="xl" color="white">
              {validator.name || "Unknown Validator"}
            </Heading>
          </HStack>

          {validator.description && (
            <Text color="gray.300" maxW="600px">
              {validator.description}
            </Text>
          )}

          <HStack gap={2}>
            {validator.website && (
              <Button
                asChild
                colorPalette="gray"
                variant="surface"
                _hover={{ bg: "yellow", color: "black" }}
              >
                <a
                  href={validator.website}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon as={FaGlobe} />
                  Website
                </a>
              </Button>
            )}

            {validator.discordHandle && (
              <Button
                asChild
                colorPalette="gray"
                variant="surface"
                _hover={{ bg: "yellow", color: "black" }}
              >
                <a
                  href={`https://discord.com/users/${validator.discordHandle}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon as={FaDiscord} />
                  Discord
                </a>
              </Button>
            )}
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};
