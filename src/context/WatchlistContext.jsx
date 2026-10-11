import { useCallback, useEffect, useMemo, useState } from "react";
import { WatchlistContext } from "./watchlist-context";

const STORAGE_KEY = "cinescope:watchlist";

const loadWatchlist = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const keyOf = (item) => `${item.mediaType}-${item.id}`;

export const WatchlistProvider = ({ children }) => {
  const [items, setItems] = useState(loadWatchlist);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be unavailable (private mode, quota); the list still works in memory.
    }
  }, [items]);

  const isSaved = useCallback(
    (item) => items.some((saved) => keyOf(saved) === keyOf(item)),
    [items]
  );

  const toggle = useCallback((item) => {
    setItems((prev) => {
      if (prev.some((saved) => keyOf(saved) === keyOf(item))) {
        return prev.filter((saved) => keyOf(saved) !== keyOf(item));
      }
      // Store only what cards need, not full detail payloads.
      const { id, mediaType, title, posterPath, rating, year, language } = item;
      return [
        { id, mediaType, title, posterPath, rating, year, language, addedAt: Date.now() },
        ...prev,
      ];
    });
  }, []);

  const value = useMemo(() => ({ items, isSaved, toggle }), [items, isSaved, toggle]);

  return <WatchlistContext.Provider value={value}>{children}</WatchlistContext.Provider>;
};
