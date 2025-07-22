import { Grid } from "@chakra-ui/react";
import type { ProposalContent } from "../types";
import { Data } from "./Data";

type ProposalContentCardProps = {
  proposalContent: ProposalContent;
};

export const ProposalContentCard = ({
  proposalContent,
}: ProposalContentCardProps) => {
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
      <Data
        title="Title"
        content={proposalContent.title || "-"}
      />
      <Data
        title="Abstract"
        content={proposalContent.abstract || "-"}
      />
      <Data
        title="Authors"
        content={proposalContent.authors || "-"}
      />
      <Data
        title="Created on"
        content={proposalContent.created || "-"}
      />
      <Data
        title="License"
        content={proposalContent.license || "-"}
      />
      <Data
        title="Discussions to"
        content={proposalContent["discussions-to"] || "-"}
      />
      <Data
        title="Details"
        content={
          <span style={{ whiteSpace: 'pre-line' }}>
            {(proposalContent.details || "-").replace(/\\n/g, '\n')}
          </span>
        }
      />
      <Data
        title="Motivation"
        content={proposalContent.motivation || "-"}
      />
    </Grid>
  );
};
