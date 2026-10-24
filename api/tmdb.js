// Server-side TMDB proxy: keeps the read access token out of the browser bundle.
// Runs as a Vercel function in production and as Vite middleware in development.
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Only the endpoints the app actually uses.
const ALLOWED_PATH = /^(trending|discover|genre|search|movie|tv)(\/[\w-]+)*$/;

const send = (res, status, body, headers = {}) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(typeof body === "string" ? body : JSON.stringify(body));
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return send(res, 405, { status_message: "Method not allowed" }, { Allow: "GET" });
  }

  const token = process.env.TMDB_API_KEY;
  if (!token) {
    return send(res, 500, { status_message: "TMDB_API_KEY is not configured on the server." });
  }

  const { searchParams } = new URL(req.url, "http://localhost");
  const path = (searchParams.get("path") || "").replace(/^\/+/, "");
  if (!ALLOWED_PATH.test(path)) {
    return send(res, 400, { status_message: "Unsupported TMDB path." });
  }
  searchParams.delete("path");

  const url = new URL(`${TMDB_BASE_URL}/${path}`);
  searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const upstream = await fetch(url, {
      headers: { accept: "application/json", Authorization: `Bearer ${token}` },
    });
    const body = await upstream.text();
    // Cache successful responses at the edge; TMDB data changes slowly.
    const cache = upstream.ok
      ? { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600" }
      : {};
    return send(res, upstream.status, body, cache);
  } catch {
    return send(res, 502, { status_message: "Could not reach TMDB." });
  }
}
