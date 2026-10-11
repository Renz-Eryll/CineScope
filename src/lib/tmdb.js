const API_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// TMDB genre id 16 = Animation. Japanese-language animation is a good proxy for anime.
const ANIME_FILTER = { with_genres: "16", with_original_language: "ja" };

export const CATEGORIES = {
  movies: {
    label: "Movies",
    mediaType: "movie",
    description: "Blockbusters, indies and everything in between.",
  },
  series: {
    label: "TV Series",
    mediaType: "tv",
    description: "Bingeable shows from around the world.",
  },
  anime: {
    label: "Anime",
    mediaType: "tv",
    description: "Japanese animated series, from classics to this season.",
    baseFilter: ANIME_FILTER,
  },
  "anime-movies": {
    label: "Anime Films",
    mediaType: "movie",
    description: "Feature-length Japanese animation.",
    baseFilter: ANIME_FILTER,
  },
};

export const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "release_date.desc", label: "Newest" },
];

export class TmdbError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

export const tmdbFetch = async (path, params = {}, { signal } = {}) => {
  if (!API_KEY) {
    throw new TmdbError(
      "Missing VITE_TMDB_API_KEY. Add your TMDB read access token to .env.local."
    );
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, {
    signal,
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new TmdbError(
      body.status_message || `Request failed (${response.status})`,
      response.status
    );
  }

  return response.json();
};

export const imageUrl = (path, size = "w500") =>
  path ? `${IMAGE_BASE_URL}/${size}${path}` : null;

// Movies and TV shows use different field names; map both to one shape.
export const normalizeMedia = (item, fallbackType) => {
  const mediaType = item.media_type || fallbackType;
  const date = item.release_date || item.first_air_date || "";

  return {
    id: item.id,
    mediaType,
    title: item.title || item.name || "Untitled",
    overview: item.overview || "",
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    rating: item.vote_average || 0,
    voteCount: item.vote_count || 0,
    year: date ? date.slice(0, 4) : "",
    language: item.original_language,
    genreIds: item.genre_ids || [],
  };
};

const normalizePage = (data, fallbackType) => ({
  page: data.page,
  totalPages: Math.min(data.total_pages || 0, 500), // TMDB caps paging at 500
  totalResults: data.total_results || 0,
  results: (data.results || [])
    .filter((item) => item.media_type !== "person")
    .map((item) => normalizeMedia(item, fallbackType)),
});

export const getTrending = async (mediaType = "all", window = "week", opts) =>
  normalizePage(
    await tmdbFetch(`/trending/${mediaType}/${window}`, {}, opts),
    mediaType === "all" ? undefined : mediaType
  );

export const discover = async (
  categoryKey,
  { page = 1, sortBy = "popularity.desc", genre } = {},
  opts
) => {
  const category = CATEGORIES[categoryKey];
  const params = { page, sort_by: sortBy, include_adult: false, ...category.baseFilter };

  // Avoid obscure titles with one 10/10 vote dominating "Top Rated".
  if (sortBy.startsWith("vote_average")) params["vote_count.gte"] = 200;
  // Anime popularity is noisy; requiring some votes keeps the list to established titles.
  else if (category.baseFilter) params["vote_count.gte"] = 100;

  // "Newest" should not surface unreleased titles.
  if (sortBy.startsWith("release_date") || sortBy.startsWith("first_air_date")) {
    const today = new Date().toISOString().slice(0, 10);
    params[category.mediaType === "movie" ? "release_date.lte" : "first_air_date.lte"] = today;
    params["vote_count.gte"] = 10;
  }

  if (category.mediaType === "tv" && sortBy.startsWith("release_date")) {
    params.sort_by = sortBy.replace("release_date", "first_air_date");
  }

  if (genre) {
    params.with_genres = [category.baseFilter?.with_genres, genre]
      .filter(Boolean)
      .join(",");
  }

  return normalizePage(
    await tmdbFetch(`/discover/${category.mediaType}`, params, opts),
    category.mediaType
  );
};

export const getGenres = async (mediaType, opts) => {
  const data = await tmdbFetch(`/genre/${mediaType}/list`, {}, opts);
  return data.genres || [];
};

export const searchMulti = async (query, page = 1, opts) =>
  normalizePage(
    await tmdbFetch("/search/multi", { query, page, include_adult: false }, opts)
  );

export const getDetails = async (mediaType, id, opts) => {
  const data = await tmdbFetch(
    `/${mediaType}/${id}`,
    { append_to_response: "credits,videos,recommendations" },
    opts
  );

  const trailer =
    data.videos?.results?.find(
      (v) => v.site === "YouTube" && v.type === "Trailer" && v.official
    ) ||
    data.videos?.results?.find((v) => v.site === "YouTube" && v.type === "Trailer") ||
    data.videos?.results?.find((v) => v.site === "YouTube");

  return {
    ...normalizeMedia(data, mediaType),
    tagline: data.tagline,
    genres: data.genres || [],
    runtime: data.runtime || data.episode_run_time?.[0] || null,
    seasons: data.number_of_seasons,
    episodes: data.number_of_episodes,
    status: data.status,
    homepage: data.homepage,
    trailerKey: trailer?.key || null,
    cast: (data.credits?.cast || []).slice(0, 15).map((person) => ({
      id: person.id,
      name: person.name,
      character: person.character,
      profilePath: person.profile_path,
    })),
    creators: (
      data.created_by ||
      (data.credits?.crew || []).filter((c) => c.job === "Director")
    ).map((p) => p.name),
    recommendations: (data.recommendations?.results || [])
      .slice(0, 18)
      .map((item) => normalizeMedia(item, mediaType)),
  };
};
