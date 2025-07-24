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
