import {
  ButtonGroup,
  IconButton,
  Pagination as ChakraPagination,
} from "@chakra-ui/react";

type PaginationProps = {
  pageSize: number;
  currentPage: number;
  count: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  pageSize,
  currentPage,
  count,
  onPageChange,
}: PaginationProps) => {
  const props = {
    px: 3,
    _hover: { bg: "gray.800", color: "white" },
    borderColor: "gray.700",
    color: "gray.300",
  };

  return (
    <ChakraPagination.Root
      count={count}
      pageSize={pageSize}
      defaultPage={1}
      page={currentPage}
      onPageChange={(e) => onPageChange(e.page)}
      ml="auto"
      mt={4}
    >
      <ButtonGroup attached variant="outline" size="md">
        <ChakraPagination.PrevTrigger>
          <IconButton {...props} disabled={currentPage <= 1}>
            Previous
          </IconButton>
        </ChakraPagination.PrevTrigger>

        <ChakraPagination.Items
          {...props}
          render={(page) => (
            <IconButton
              variant={{ base: "outline", _selected: "solid" }}
              _selected={{
                bg: "yellow",
                color: "black",
                _hover: { bg: "yellow", color: "black" },
              }}
            >
              {page.value}
            </IconButton>
          )}
        />
        <ChakraPagination.NextTrigger>
          <IconButton {...props} disabled={currentPage >= count / pageSize}>
            Next
          </IconButton>
        </ChakraPagination.NextTrigger>
      </ButtonGroup>
    </ChakraPagination.Root>
  );
};
