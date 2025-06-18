export const blocksUrl = () => "/blocks";

export const blockUrl = (blockHeight: number | string = ":block") =>
  `/blocks/${blockHeight}`;

export const accountUrl = (address: string = ":address") =>
  `/account/${address}`;

export const validatorUrl = (address: string = ":address") =>
  `/validators/${address}`;

export const validatorsUrl = () => "/validators";

export const transactionsUrl = () => "/transactions";

export const transactionUrl = (hash: string = ":hash") =>
  `/transactions/${hash}`;
