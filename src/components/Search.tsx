import { Input, InputGroup } from "@chakra-ui/react";
import { LuSearch } from "react-icons/lu";

export const Search = () => (
  <InputGroup flex="1" startElement={<LuSearch />}>
    <Input placeholder="Search by address, blocks or transactions hash" />
  </InputGroup>
);
