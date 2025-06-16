import BigNumber from "bignumber.js";
import type { Asset } from "@chain-registry/types";
import { accountUrl, validatorUrl } from "../routes";
import { shortenHashOrAddress, toDisplayAmount } from "../utils";
import { Data } from "./Data";
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
  amount: (value: string, asset: Asset) => {
    const amount = toDisplayAmount(asset, BigNumber(value));
    return <span>{amount.toString()}</span>;
  },
};

const keyMap = (key: string) => {
  return String(key).charAt(0).toUpperCase() + String(key).slice(1);
};

export const TransactionDetailsData = ({ json }: { json: unknown }) => {
  const handleTransactionData = (key: string, value: string) => {
    if (key in valueMap && valueMap[key]) {
      return (
        <Data title={keyMap(key)} content={valueMap[key]!(value)} key={key} />
      );
    }
    return <Data title={keyMap(key)} content={value} />;
  };

  if (Array.isArray(json)) {
    return json.map((item, index) => (
      <TransactionDetailsData json={item} key={index} />
    ));
  }

  if (typeof json === "object" && json !== null) {
    return Object.keys(json).map((key) => {
      if (typeof json === "object") {
        const value = json[key as keyof typeof json];
        return handleTransactionData(key, value);
      }
    });
  }

  return <></>;
};
