import { useState } from "react";
import { Link } from "react-router-dom";
import MediaGrid from "../components/MediaGrid";
import StatusMessage from "../components/StatusMessage";
import useWatchlist from "../hooks/useWatchlist";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
];

const Watchlist = () => {
  const { items } = useWatchlist();
  const [filter, setFilter] = useState("all");

  const visible = filter === "all" ? items : items.filter((item) => item.mediaType === filter);

  return (
    <div className="page-container pt-28">
      <header className="page-header">
        <div>
          <h1>My Watchlist</h1>
          <p>
            {items.length} saved {items.length === 1 ? "title" : "titles"} · stored on this device
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <StatusMessage
          title="Your watchlist is empty"
          message="Tap the bookmark on any title to save it for later."
          action={
            <Link to="/" className="btn btn-primary mt-4">
              Discover titles
            </Link>
          }
        />
      ) : (
        <>
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
          {visible.length ? (
            <MediaGrid items={visible} />
          ) : (
            <StatusMessage title="Nothing in this category" />
          )}
        </>
      )}
    </div>
  );
};

export default Watchlist;
