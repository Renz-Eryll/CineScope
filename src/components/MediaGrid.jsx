import MovieCard, { MovieCardSkeleton } from "./MovieCard";

const MediaGrid = ({ items = [], isLoading, skeletonCount = 12 }) => (
  <ul className="media-grid">
    {items.map((media) => (
      <li key={`${media.mediaType}-${media.id}`}>
        <MovieCard media={media} />
      </li>
    ))}
    {isLoading &&
      Array.from({ length: skeletonCount }, (_, i) => (
        <li key={`skeleton-${i}`}>
          <MovieCardSkeleton />
        </li>
      ))}
  </ul>
);

export default MediaGrid;
