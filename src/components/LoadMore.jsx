import { useEffect, useRef } from "react";

// Auto-loads the next page when scrolled into view, with a button as a fallback.
const LoadMore = ({ onLoadMore, isLoading }) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && onLoadMore(),
      { rootMargin: "400px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [onLoadMore]);

  return (
    <div ref={sentinelRef} className="flex justify-center py-10">
      <button type="button" className="btn btn-ghost" onClick={onLoadMore} disabled={isLoading}>
        {isLoading ? "Loading…" : "Load more"}
      </button>
    </div>
  );
};

export default LoadMore;
