import { Link } from "react-router-dom";
import { imageUrl } from "../lib/tmdb";
import useWatchlist from "../hooks/useWatchlist";
import { BookmarkIcon, StarIcon } from "./Icons";

const TYPE_LABEL = { movie: "Movie", tv: "Series" };

const MovieCard = ({ media }) => {
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(media);
  const poster = imageUrl(media.posterPath, "w342");

  return (
    <article className="media-card group">
      <Link to={`/${media.mediaType}/${media.id}`} className="block">
        <div className="poster">
          <img
            src={poster || "/no-movie.png"}
            alt={media.title}
            loading="lazy"
            className={poster ? "" : "object-contain p-6 opacity-60"}
          />
          <span className="rating-badge">
            <StarIcon className="size-3.5 text-amber-400" />
            {media.rating ? media.rating.toFixed(1) : "N/A"}
          </span>
        </div>
        <h3>{media.title}</h3>
        <p className="meta">
          {[media.year, TYPE_LABEL[media.mediaType], media.language?.toUpperCase()]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </Link>

      <button
        type="button"
        onClick={() => toggle(media)}
        className={`watchlist-btn ${saved ? "is-saved" : ""}`}
        aria-label={saved ? `Remove ${media.title} from watchlist` : `Add ${media.title} to watchlist`}
        aria-pressed={saved}
      >
        <BookmarkIcon filled={saved} className="size-4" />
      </button>
    </article>
  );
};

export const MovieCardSkeleton = () => (
  <div className="media-card" aria-hidden="true">
    <div className="poster skeleton" />
    <div className="skeleton mt-3 h-4 w-3/4 rounded" />
    <div className="skeleton mt-2 h-3 w-1/2 rounded" />
  </div>
);

export default MovieCard;
