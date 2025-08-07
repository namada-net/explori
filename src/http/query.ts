export const get = async (pathname: string) => {
  const response = await fetch(
    import.meta.env.VITE_INDEXER_API_BASE + pathname,
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const getUrlJson = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

/* 
Make an abci_query to a full node. Not used right now, leaving it here in case it's needed in the future.
// export const getAbciQuery = async (path: string, height: number = 0) => {
//   // height 0 represents latest block
//   const response = await fetch(
//     `${import.meta.env.VITE_RPC_BASE}/abci_query?path="${encodeURIComponent(path)}"&height=${height}`,
//   );
//   if (!response.ok) {
//     throw new Error(`HTTP error! status: ${response.status}`);
//   }
//   return response.json();
// };
*/
