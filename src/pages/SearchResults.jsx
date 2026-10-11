import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import MediaGrid from "../components/MediaGrid";
import LoadMore from "../components/LoadMore";
import StatusMessage from "../components/StatusMessage";
import usePaginated from "../hooks/usePaginated";
import { searchMulti } from "../lib/tmdb";
import { updateSearchCount } from "../lib/appwrite";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

// Count each query once per session (also avoids StrictMode double-counting in dev).
const recordedQueries = new Set();

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") || "").trim();
  const [filter, setFilter] = useState("all");

  const results = usePaginated((page, opts) => searchMulti(query, page, opts), query, {
    enabled: Boolean(query),
  });

  // Record the search once per query, using the top movie hit for the poster. The delay
  // skips half-typed terms ("bat", "batm") that only existed while the user was typing.
  const topMovie = results.items.find((item) => item.mediaType === "movie");
  const topMovieId = topMovie?.id;
  useEffect(() => {
    const key = query.toLowerCase();
    if (!topMovie || recordedQueries.has(key)) return;
    const timer = setTimeout(() => {
      recordedQueries.add(key);
      updateSearchCount(query, topMovie);
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, topMovieId]);

  const visible =
    filter === "all" ? results.items : results.items.filter((item) => item.mediaType === filter);

  if (!query) {
    return (
      <div className="page-container pt-28">
        <StatusMessage
          title="Search CineScope"
          message="Find movies, TV series and anime by title using the search bar above."
        />
      </div>
    );
  }

  return (
    <div className="page-container pt-28">
      <header className="page-header">
        <div>
          <h1>
            Results for <span className="text-gradient">“{query}”</span>
          </h1>
          {!results.isLoading && (
            <p>{results.totalResults.toLocaleString()} titles found</p>
          )}
        </div>
      </header>

      <div className="genre-chips" role="group" aria-label="Filter by type">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={filter === f.value ? "is-active" : ""}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
          >
            {f.label}
          </button>
        ))}
      </div>

      {results.error ? (
        <StatusMessage title="Search failed" message={results.error.message} />
      ) : !results.isLoading && visible.length === 0 && !results.hasMore ? (
        <StatusMessage title="No matches" message={`We couldn't find anything for “${query}”.`} />
      ) : (
        <>
          <MediaGrid items={visible} isLoading={results.isLoading} />
          {results.hasMore && <LoadMore onLoadMore={results.loadMore} isLoading={results.isLoading} />}
        </>
      )}
    </div>
  );
};

export default SearchResults;
