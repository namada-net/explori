import { ButtonGroup, IconButton, Pagination } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

type PaginationProps = {
  lastBlockNumber: number;
  blocksPerPage: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export const BlockPagination = ({
  lastBlockNumber,
  blocksPerPage,
  currentPage,
  onPageChange,
}: PaginationProps) => {
  return (
    <Pagination.Root
      mt={2}
      w="100%"
      display="flex"
      justifyContent="center"
      count={lastBlockNumber}
      pageSize={blocksPerPage}
      page={currentPage}
      defaultPage={1}
      onPageChange={(e) => onPageChange(e.page)}
    >
      <ButtonGroup size="sm">
        <Pagination.PrevTrigger asChild>
          <IconButton>
            <LuChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(page) => (
            <IconButton _selected={{ bg: "yellow", color: "black" }}>
              {page.value}
            </IconButton>
          )}
        />
        <Pagination.NextTrigger asChild>
          <IconButton>
            <LuChevronRight />
          </IconButton>
        </Pagination.NextTrigger>
      </ButtonGroup>
    </Pagination.Root>
  );
};
