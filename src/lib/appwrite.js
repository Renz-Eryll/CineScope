import { Client, Databases, ID, Query } from "appwrite";
import { imageUrl } from "./tmdb";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

// The search-analytics feature is optional: the app still works without Appwrite.
const isConfigured = Boolean(PROJECT_ID && DATABASE_ID && COLLECTION_ID);

const database = isConfigured
  ? new Databases(
      new Client()
        .setEndpoint("https://fra.cloud.appwrite.io/v1")
        .setProject(PROJECT_ID)
    )
  : null;

const normalizeTerm = (term) => term.trim().toLowerCase().replace(/\s+/g, " ");

// Record a search, keyed by normalized term so "Batman" and "batman " count together.
export const updateSearchCount = async (searchTerm, movie) => {
  if (!database || !movie?.posterPath) return;

  const term = normalizeTerm(searchTerm);
  if (term.length < 2) return;

  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", term),
    ]);

    if (result.documents.length > 0) {
      const doc = result.documents[0];
      await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
        count: doc.count + 1,
      });
    } else {
      await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: term,
        count: 1,
        movie_id: movie.id,
        poster_url: imageUrl(movie.posterPath),
      });
    }
  } catch (error) {
    console.error("Failed to record search:", error);
  }
};

// Most-searched movies, de-duplicated by movie (several terms can map to one title).
export const getMostSearched = async (limit = 10) => {
  if (!database) return [];

  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(limit * 2),
      Query.orderDesc("count"),
    ]);

    const seen = new Set();
    return result.documents
      .filter((doc) => {
        if (seen.has(doc.movie_id)) return false;
        seen.add(doc.movie_id);
        return true;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to load most-searched movies:", error);
    return [];
  }
};
