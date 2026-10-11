import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { imageUrl } from "../lib/tmdb";
import useWatchlist from "../hooks/useWatchlist";
import { BookmarkIcon, InfoIcon, StarIcon } from "./Icons";

const ROTATE_MS = 8000;

const HeroBanner = ({ items = [], isLoading }) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const { isSaved, toggle } = useWatchlist();

  const slides = items.filter((item) => item.backdropPath).slice(0, 6);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  if (isLoading) return <section className="hero skeleton" aria-hidden="true" />;
  if (!slides.length) return null;

  const active = index % slides.length;
  const current = slides[active];
  const saved = isSaved(current);

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Trending now"
    >
      {slides.map((slide, i) => (
        <img
          key={slide.id}
          src={imageUrl(slide.backdropPath, "w1280")}
          alt=""
          className={`hero-backdrop ${i === active ? "is-active" : ""}`}
          fetchPriority={i === 0 ? "high" : "low"}
        />
      ))}
      <div className="hero-shade" />

      <div className="hero-content">
        <p className="eyebrow">
          #{active + 1} Trending · {current.mediaType === "tv" ? "Series" : "Movie"}
        </p>
        <h1>{current.title}</h1>
        <div className="hero-meta">
          <span className="flex items-center gap-1">
            <StarIcon className="size-4 text-amber-400" />
            {current.rating.toFixed(1)}
          </span>
          {current.year && <span>{current.year}</span>}
        </div>
        <p className="hero-overview">{current.overview}</p>

        <div className="flex flex-wrap gap-3">
          <Link to={`/${current.mediaType}/${current.id}`} className="btn btn-primary">
            <InfoIcon /> More info
          </Link>
          <button type="button" className="btn btn-ghost" onClick={() => toggle(current)} aria-pressed={saved}>
            <BookmarkIcon filled={saved} /> {saved ? "In watchlist" : "Watchlist"}
          </button>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setIndex(i)}
            className={i === active ? "is-active" : ""}
            aria-label={`Show ${slide.title}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
