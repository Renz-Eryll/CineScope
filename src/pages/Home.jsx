import { Link } from "react-router-dom";
import HeroBanner from "../components/HeroBanner";
import MediaRow from "../components/MediaRow";
import useAsync from "../hooks/useAsync";
import { discover, getTrending } from "../lib/tmdb";
import { getMostSearched } from "../lib/appwrite";

const MostSearched = () => {
  const { data: items } = useAsync(() => getMostSearched(10), []);
  if (!items?.length) return null;

  return (
    <section className="most-searched">
      <h2>Most Searched on CineScope</h2>
      <ul className="hide-scrollbar">
        {items.map((item, index) => (
          <li key={item.$id}>
            <Link to={`/movie/${item.movie_id}`} aria-label={`#${index + 1}: ${item.searchTerm}`}>
              <p aria-hidden="true">{index + 1}</p>
              <img src={item.poster_url} alt="" loading="lazy" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

// Each row fetches independently so one failing request doesn't blank the page.
const Row = ({ title, load, seeAllTo }) => {
  const { data, isLoading, error } = useAsync(load, []);
  return (
    <MediaRow
      title={title}
      items={data?.results}
      isLoading={isLoading}
      error={error}
      seeAllTo={seeAllTo}
    />
  );
};

const Home = () => {
  const trending = useAsync((opts) => getTrending("all", "day", opts), []);

  return (
    <>
      <HeroBanner items={trending.data?.results} isLoading={trending.isLoading} />

      <div className="page-container space-y-12 pt-8">
        <MostSearched />
        <Row title="Trending Movies" load={(o) => getTrending("movie", "week", o)} seeAllTo="/browse/movies" />
        <Row title="Trending Series" load={(o) => getTrending("tv", "week", o)} seeAllTo="/browse/series" />
        <Row title="Popular Anime" load={(o) => discover("anime", {}, o)} seeAllTo="/browse/anime" />
        <Row
          title="Top Rated Movies"
          load={(o) => discover("movies", { sortBy: "vote_average.desc" }, o)}
          seeAllTo="/browse/movies?sort=vote_average.desc"
        />
        <Row
          title="Anime Films"
          load={(o) => discover("anime-movies", {}, o)}
          seeAllTo="/browse/anime-movies"
        />
        <Row
          title="Top Rated Series"
          load={(o) => discover("series", { sortBy: "vote_average.desc" }, o)}
          seeAllTo="/browse/series?sort=vote_average.desc"
        />
      </div>
    </>
  );
};

export default Home;
