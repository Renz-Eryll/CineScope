import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MediaRow from "../components/MediaRow";
import Spinner from "../components/Spinner";
import StatusMessage from "../components/StatusMessage";
import TrailerModal from "../components/TrailerModal";
import { BookmarkIcon, PlayIcon, StarIcon } from "../components/Icons";
import useAsync from "../hooks/useAsync";
import useWatchlist from "../hooks/useWatchlist";
import { getDetails, imageUrl } from "../lib/tmdb";
import NotFound from "./NotFound";

const formatRuntime = (minutes) => {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
};

const Details = () => {
  const { mediaType, id } = useParams();
  const validType = mediaType === "movie" || mediaType === "tv";
  const [showTrailer, setShowTrailer] = useState(false);
  const closeTrailer = useCallback(() => setShowTrailer(false), []);
  const { isSaved, toggle } = useWatchlist();

  const { data: media, isLoading, error } = useAsync(
    (opts) => getDetails(mediaType, id, opts),
    [mediaType, id],
    { enabled: validType }
  );

  useEffect(() => {
    if (media) document.title = `${media.title} (${media.year || "TBA"}) · CineScope`;
    return () => {
      document.title = "CineScope";
    };
  }, [media]);

  if (!validType || error?.status === 404) return <NotFound />;

  if (error) {
    return (
      <div className="page-container pt-28">
        <StatusMessage title="Couldn't load this title" message={error.message} />
      </div>
    );
  }

  // `media` can briefly be the previous title while navigating between recommendations.
  if (isLoading || !media || String(media.id) !== id) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const saved = isSaved(media);
  const poster = imageUrl(media.posterPath, "w500");
  const facts = [
    media.year,
    formatRuntime(media.runtime),
    media.seasons && `${media.seasons} season${media.seasons > 1 ? "s" : ""}`,
    media.episodes && `${media.episodes} episodes`,
    media.language?.toUpperCase(),
  ].filter(Boolean);

  return (
    <>
      <section className="details-hero">
        {media.backdropPath && (
          <img src={imageUrl(media.backdropPath, "w1280")} alt="" className="details-backdrop" />
        )}
        <div className="hero-shade" />

        <div className="details-content page-container">
          <img src={poster || "/no-movie.png"} alt={`${media.title} poster`} className="details-poster" />

          <div className="details-info">
            <p className="eyebrow">{mediaType === "tv" ? "TV Series" : "Movie"}</p>
            <h1>{media.title}</h1>
            {media.tagline && <p className="tagline">“{media.tagline}”</p>}

            <div className="hero-meta">
              <span className="flex items-center gap-1">
                <StarIcon className="size-4 text-amber-400" />
                <strong className="text-white">{media.rating.toFixed(1)}</strong>
                <span className="text-gray-100">({media.voteCount.toLocaleString()})</span>
              </span>
              {facts.map((fact) => (
                <span key={fact}>{fact}</span>
              ))}
            </div>

            <ul className="genre-tags">
              {media.genres.map((g) => (
                <li key={g.id}>{g.name}</li>
              ))}
            </ul>

            <p className="details-overview">{media.overview || "No overview available."}</p>

            {media.creators.length > 0 && (
              <p className="text-sm text-light-200">
                <span className="text-gray-100">{mediaType === "tv" ? "Created by" : "Directed by"}</span>{" "}
                {media.creators.join(", ")}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {media.trailerKey && (
                <button type="button" className="btn btn-primary" onClick={() => setShowTrailer(true)}>
                  <PlayIcon /> Watch trailer
                </button>
              )}
              <button type="button" className="btn btn-ghost" onClick={() => toggle(media)} aria-pressed={saved}>
                <BookmarkIcon filled={saved} /> {saved ? "In watchlist" : "Add to watchlist"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="page-container space-y-12 pt-4">
        {media.cast.length > 0 && (
          <section>
            <h2 className="mb-5">Top Cast</h2>
            <ul className="cast-list hide-scrollbar">
              {media.cast.map((person) => (
                <li key={`${person.id}-${person.character}`}>
                  {person.profilePath ? (
                    <img src={imageUrl(person.profilePath, "w185")} alt={person.name} loading="lazy" />
                  ) : (
                    <div className="cast-placeholder" aria-hidden="true">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <p className="font-semibold text-white">{person.name}</p>
                  <p className="text-gray-100">{person.character}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <MediaRow title="You Might Also Like" items={media.recommendations} />

        <Link to={mediaType === "tv" ? "/browse/series" : "/browse/movies"} className="see-all inline-block">
          ← Browse more {mediaType === "tv" ? "series" : "movies"}
        </Link>
      </div>

      {showTrailer && (
        <TrailerModal videoKey={media.trailerKey} title={media.title} onClose={closeTrailer} />
      )}
    </>
  );
};

export default Details;
