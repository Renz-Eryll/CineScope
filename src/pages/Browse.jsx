import { useParams, useSearchParams } from "react-router-dom";
import MediaGrid from "../components/MediaGrid";
import LoadMore from "../components/LoadMore";
import StatusMessage from "../components/StatusMessage";
import useAsync from "../hooks/useAsync";
import usePaginated from "../hooks/usePaginated";
import { CATEGORIES, SORT_OPTIONS, discover, getGenres } from "../lib/tmdb";
import NotFound from "./NotFound";

const ANIMATION_GENRE_ID = 16;

const Browse = () => {
  const { category: categoryKey } = useParams();
  const category = CATEGORIES[categoryKey];
  const [searchParams, setSearchParams] = useSearchParams();

  const sortBy = SORT_OPTIONS.some((o) => o.value === searchParams.get("sort"))
    ? searchParams.get("sort")
    : SORT_OPTIONS[0].value;
  const genre = searchParams.get("genre") || "";

  const genres = useAsync((opts) => getGenres(category.mediaType, opts), [category?.mediaType], {
    enabled: Boolean(category),
  });

  const results = usePaginated(
    (page, opts) => discover(categoryKey, { page, sortBy, genre }, opts),
    `${categoryKey}|${sortBy}|${genre}`,
    { enabled: Boolean(category) }
  );

  if (!category) return <NotFound />;

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  };

  // Anime is already filtered to Animation, so that chip would be redundant.
  const genreOptions = (genres.data || []).filter(
    (g) => !(category.baseFilter && g.id === ANIMATION_GENRE_ID)
  );

  return (
    <div className="page-container pt-28">
      <header className="page-header">
        <div>
          <h1>{category.label}</h1>
          <p>{category.description}</p>
        </div>

        <label className="sort-select">
          <span className="sr-only">Sort by</span>
          <select value={sortBy} onChange={(e) => updateParam("sort", e.target.value)}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div className="genre-chips hide-scrollbar" role="group" aria-label="Filter by genre">
        <button type="button" className={!genre ? "is-active" : ""} onClick={() => updateParam("genre", "")}>
          All
        </button>
        {genreOptions.map((g) => (
          <button
            key={g.id}
            type="button"
            className={genre === String(g.id) ? "is-active" : ""}
            onClick={() => updateParam("genre", String(g.id))}
            aria-pressed={genre === String(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      {results.error ? (
        <StatusMessage title="Couldn't load titles" message={results.error.message} />
      ) : !results.isLoading && results.items.length === 0 ? (
        <StatusMessage title="Nothing here yet" message="Try a different genre or sort order." />
      ) : (
        <>
          <MediaGrid items={results.items} isLoading={results.isLoading} />
          {results.hasMore && <LoadMore onLoadMore={results.loadMore} isLoading={results.isLoading} />}
        </>
      )}
    </div>
  );
};

export default Browse;
