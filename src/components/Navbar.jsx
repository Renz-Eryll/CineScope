import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import useWatchlist from "../hooks/useWatchlist";
import Search from "./Search";

const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/browse/movies", label: "Movies" },
  { to: "/browse/series", label: "TV Series" },
  { to: "/browse/anime", label: "Anime" },
  { to: "/browse/anime-movies", label: "Anime Films" },
];

const Navbar = () => {
  const { items } = useWatchlist();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`navbar ${scrolled ? "is-scrolled" : ""}`}>
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <img src="/movie_app_logo.png" alt="" className="size-8" />
          <span>
            Cine<span className="text-gradient">Scope</span>
          </span>
        </Link>

        <nav aria-label="Main" className="nav-links hide-scrollbar">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/watchlist">
            Watchlist
            {items.length > 0 && <span className="count-pill">{items.length}</span>}
          </NavLink>
        </nav>

        <Search />
      </div>
    </header>
  );
};

export default Navbar;
