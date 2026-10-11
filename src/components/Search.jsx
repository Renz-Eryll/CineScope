import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDebounce } from "react-use";
import { CloseIcon, SearchIcon } from "./Icons";

// Navbar search: typing updates /search?q=… (debounced) so results are shareable URLs.
const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const onSearchPage = location.pathname === "/search";
  const urlQuery = onSearchPage ? searchParams.get("q") || "" : "";

  const [term, setTerm] = useState(urlQuery);

  // Keep the input in sync when the URL changes (back/forward, leaving the page).
  useEffect(() => {
    setTerm(urlQuery);
  }, [urlQuery]);

  useDebounce(
    () => {
      const trimmed = term.trim();
      if (trimmed === urlQuery.trim()) return;
      if (trimmed) {
        navigate(`/search?q=${encodeURIComponent(trimmed)}`, { replace: onSearchPage });
      } else if (onSearchPage) {
        navigate("/search", { replace: true });
      }
    },
    400,
    [term]
  );

  return (
    <form
      role="search"
      className="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (term.trim()) navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      }}
    >
      <SearchIcon className="size-4 shrink-0 text-light-200" />
      <input
        type="search"
        placeholder="Search movies, series, anime…"
        aria-label="Search movies, series and anime"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      {term && (
        <button type="button" onClick={() => setTerm("")} aria-label="Clear search">
          <CloseIcon className="size-4" />
        </button>
      )}
    </form>
  );
};

export default Search;
