import { useEffect, useState } from "react";
import useAsync from "./useAsync";

const dedupe = (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.mediaType}-${item.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const EMPTY = { items: [], totalPages: 0, totalResults: 0 };

/**
 * Accumulates pages of results ("load more"). `key` identifies the query;
 * when it changes, results reset to page 1.
 */
const usePaginated = (fetchPage, key, { enabled = true } = {}) => {
  const [page, setPage] = useState(1);
  const [results, setResults] = useState(EMPTY);
  const [prevKey, setPrevKey] = useState(key);

  // Reset synchronously during render so stale results never flash for a new query.
  if (key !== prevKey) {
    setPrevKey(key);
    setPage(1);
    setResults(EMPTY);
  }

  const { data, isLoading, error } = useAsync((opts) => fetchPage(page, opts), [key, page], {
    enabled,
  });

  useEffect(() => {
    if (!data) return;
    setResults((prev) => ({
      items: data.page === 1 ? dedupe(data.results) : dedupe([...prev.items, ...data.results]),
      totalPages: data.totalPages,
      totalResults: data.totalResults,
    }));
  }, [data]);

  // `isLoading` lags one render behind a page change, so also treat "requested page
  // not yet received" as loading. This stops double-fires from skipping a page.
  const pending = enabled && !error && (isLoading || data?.page !== page);
  const hasMore = page < results.totalPages;

  return {
    ...results,
    isLoading: pending,
    error,
    hasMore,
    loadMore: () => {
      if (!pending && hasMore) setPage(page + 1);
    },
  };
};

export default usePaginated;
