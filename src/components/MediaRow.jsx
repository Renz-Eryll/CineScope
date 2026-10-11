import { useRef } from "react";
import { Link } from "react-router-dom";
import MovieCard, { MovieCardSkeleton } from "./MovieCard";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icons";

const MediaRow = ({ title, items, isLoading, error, seeAllTo }) => {
  const scrollerRef = useRef(null);

  const scroll = (direction) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: "smooth" });
  };

  if (error || (!isLoading && !items?.length)) return null;

  return (
    <section className="media-row">
      <div className="row-header">
        <h2>{title}</h2>
        <div className="flex items-center gap-2">
          {seeAllTo && (
            <Link to={seeAllTo} className="see-all">
              See all
            </Link>
          )}
          <button type="button" className="row-arrow" onClick={() => scroll(-1)} aria-label={`Scroll ${title} left`}>
            <ChevronLeftIcon />
          </button>
          <button type="button" className="row-arrow" onClick={() => scroll(1)} aria-label={`Scroll ${title} right`}>
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <ul ref={scrollerRef} className="row-scroller hide-scrollbar">
        {isLoading
          ? Array.from({ length: 8 }, (_, i) => (
              <li key={i}>
                <MovieCardSkeleton />
              </li>
            ))
          : items.map((media) => (
              <li key={`${media.mediaType}-${media.id}`}>
                <MovieCard media={media} />
              </li>
            ))}
      </ul>
    </section>
  );
};

export default MediaRow;
