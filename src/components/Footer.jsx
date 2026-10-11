const Footer = () => (
  <footer className="footer">
    <p>
      Data provided by{" "}
      <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">
        TMDB
      </a>
      . This product uses the TMDB API but is not endorsed or certified by TMDB.
    </p>
    <p>© {new Date().getFullYear()} CineScope</p>
  </footer>
);

export default Footer;
