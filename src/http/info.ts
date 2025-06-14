export const fetchLatestBlock = async () => {
  return fetch("/chain/block/latest");
};

export const fetchLatestEpoch = async () => {
  return fetch("/chain/epoch/latest");
};
