import type { Asset } from "@chain-registry/types";
import { VStack } from "@chakra-ui/react";
import BigNumber from "bignumber.js";
import { accountUrl, validatorUrl } from "../routes";
import { shortenHashOrAddress, toDisplayAmount } from "../utils";
import { Data } from "./Data";
import { Hash } from "./Hash";
import { PageLink } from "./PageLink";

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const valueMap: Record<string, Function | undefined> = {
  validator: (address: string) => (
    <PageLink to={validatorUrl(address)} _hover={{ color: "yellow" }}>
      {shortenHashOrAddress(address)}
    </PageLink>
  ),
  source: (address: string) => (
    <PageLink to={accountUrl(address)} _hover={{ color: "yellow" }}>
      {shortenHashOrAddress(address)}
    </PageLink>
  ),
  amount: (value: string, asset?: Asset) => {
    if (asset) {
      const amount = toDisplayAmount(asset, BigNumber(value));
      return <span>{amount.toString()}</span>;
    }
    return <span>{value}</span>;
  },
  owner: (value: string) => {
    return <Hash hash={value} enableCopy={true} />;
  },
  token: (value: string) => {
    return <Hash hash={value} enableCopy={true} />;
  },
  shielded_section_hash: (value: string) => {
    return <>{JSON.stringify(value)}</>;
  },
};

const keyMap = (key: string) => {
  return String(key).charAt(0).toUpperCase() + String(key).slice(1);
};

export const TransactionDetailsData = ({ details }: { details: unknown }) => {
  if (Array.isArray(details)) {
    return details
      .sort()
      .map((item, index) => (
        <TransactionDetailsData details={item} key={index} />
      ));
  }

  if (typeof details === "object" && details !== null) {
    return Object.entries(details).map(([key, value]) => (
      <Data
        key={key}
        title={keyMap(key)}
        content={
          valueMap[key] ? (
            valueMap[key](value)
          ) : Array.isArray(value) ? (
            <>
              {value.map((item) => (
                <VStack
                  key={JSON.stringify(item)}
                  align="left"
                  px={2}
                  rounded="sm"
                  borderLeft="2px solid"
                  borderColor="white"
                  overflow="auto"
                >
                  <TransactionDetailsData details={item} />
                </VStack>
              ))}
            </>
          ) : (
            value
          )
        }
      />
    ));
  }

  return <Data content={details} />;
};
