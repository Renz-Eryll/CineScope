import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import SearchResults from "./pages/SearchResults";
import Details from "./pages/Details";
import Watchlist from "./pages/Watchlist";
import NotFound from "./pages/NotFound";

// Reset scroll on page change, but not when only the query string changes (filters, search).
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <div className="app">
    <ScrollToTop />
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/browse/:category" element={<Browse />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/:mediaType/:id" element={<Details />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default App;
