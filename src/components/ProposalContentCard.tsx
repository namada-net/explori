import { Grid } from "@chakra-ui/react";
import type { ProposalContent } from "../types";
import { Data } from "./Data";
import { linkifyText } from "../utils/linkify";

type ProposalContentCardProps = {
  proposalContent: ProposalContent;
};

export const ProposalContentCard = ({
  proposalContent,
}: ProposalContentCardProps) => {
  const hasContent = (value: string | undefined | null) => {
    return value && value.trim() !== "";
  };

  return (
    <Grid
      templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
      gap={4}
      w="100%"
      py={4}
      px={4}
      rounded="sm"
      bg="gray.800"
      borderLeft="2px solid"
      borderColor="yellow"
      overflow="auto"
    >
      {hasContent(proposalContent.title) && (
        <Data
          title="Title"
          content={proposalContent.title}
        />
      )}
      {hasContent(proposalContent.abstract) && (
        <Data
          title="Abstract"
          content={proposalContent.abstract}
        />
      )}
      {hasContent(proposalContent.authors) && (
        <Data
          title="Authors"
          content={proposalContent.authors}
        />
      )}
      {hasContent(proposalContent.created) && (
        <Data
          title="Created on"
          content={proposalContent.created}
        />
      )}
      {hasContent(proposalContent.license) && (
        <Data
          title="License"
          content={proposalContent.license}
        />
      )}
      {hasContent(proposalContent["discussions-to"]) && (
        <Data
          title="Discussions to"
          content={proposalContent["discussions-to"]}
        />
      )}
      {hasContent(proposalContent.details) && (
        <Data
          title="Details"
          content={
            <span style={{ whiteSpace: 'pre-line' }}>
              {linkifyText(proposalContent.details!.replace(/\\n/g, '\n'))}
            </span>
          }
        />
      )}
      {hasContent(proposalContent.motivation) && (
        <Data
          title="Motivation"
          content={proposalContent.motivation}
        />
      )}
    </Grid>
  );
};
