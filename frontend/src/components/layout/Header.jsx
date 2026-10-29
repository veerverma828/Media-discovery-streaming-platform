import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext.jsx";
import { useDebrid } from "../../hooks/useDebrid.js";
import SearchBar from "./SearchBar.jsx";
import SettingsButton from "./SettingsButton.jsx";
import appLogoPng from "../../../Images/title-logo-600.png";
import appLogoWebp from "../../../Images/title-logo-600.webp";

const DEBRID_OPTIONS = [
  { value: "real-debrid", label: "Real-Debrid" },
  { value: "torbox", label: "Torbox" },
];

// Movies / Series jump to the matching Home rail; there are no separate list pages.
const NAV_ITEMS = [
  { key: "home", label: "Home", rail: null },
  { key: "movies", label: "Movies", rail: "rail-movies" },
  { key: "series", label: "Series", rail: "rail-series" },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setQuery } = useAppContext();
  const { debridService, handleDebridChange } = useDebrid();
  const [scrolled, setScrolled] = useState(false);
  const [pendingRail, setPendingRail] = useState(null);

  // Which nav item gets the red underline. On Home it follows the scroll
  // position (top of the page, Movies rail, Series rail); on detail pages it
  // follows the route.
  const [activeNav, setActiveNav] = useState("home");

  useEffect(() => {
    const path = location.pathname;
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      if (path !== "/") return;
      const offset = 160; // sticky header height + breathing room
      const top = (id) => document.getElementById(id)?.getBoundingClientRect().top;
      const seriesTop = top("rail-series");
      const moviesTop = top("rail-movies");
      if (seriesTop !== undefined && seriesTop <= offset) setActiveNav("series");
      else if (moviesTop !== undefined && moviesTop <= offset) setActiveNav("movies");
      else setActiveNav("home");
    };

    if (path.startsWith("/movie")) setActiveNav("movies");
    else if (path.startsWith("/series")) setActiveNav("series");

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  // "/" focuses search from anywhere, unless the user is already typing.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      const typing = el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
      if (typing) return;
      const input = document.getElementById("search-input");
      if (input) {
        e.preventDefault();
        input.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // After navigating Home from another route, scroll to the requested rail once it mounts.
  useEffect(() => {
    if (!pendingRail || location.pathname !== "/") return;
    let attempts = 0;
    const timer = setInterval(() => {
      const el = document.getElementById(pendingRail);
      attempts++;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setPendingRail(null);
      } else if (attempts > 20) {
        setPendingRail(null);
      }
    }, 100);
    return () => clearInterval(timer);
  }, [pendingRail, location.pathname]);

  const goTo = (item) => {
    if (item.rail) {
      setPendingRail(item.rail);
      if (location.pathname !== "/") navigate("/");
      else {
        const el = document.getElementById(item.rail);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      setQuery("");
      setPendingRail(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
      navigate("/");
    }
  };

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-header-inner">
        <button
          type="button"
          className="site-logo"
          aria-label="Torrent Debrid home"
          onClick={() => goTo(NAV_ITEMS[0])}
        >
          <picture>
            <source srcSet={appLogoWebp} type="image/webp" />
            <img
              src={appLogoPng}
              alt="Torrent Debrid"
              width="600"
              height="121"
              decoding="async"
              fetchPriority="high"
            />
          </picture>
        </button>

        <nav className="site-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              className="site-nav-link"
              aria-current={item.key === activeNav ? "page" : undefined}
              onClick={() => goTo(item)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="site-search">
          <SearchBar />
        </div>

        <div className="site-actions">
          <div className="debrid-switch" role="group" aria-label="Debrid service">
            {DEBRID_OPTIONS.map((opt) => {
              const isActive = debridService === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  className="debrid-option"
                  aria-pressed={isActive}
                  onClick={() => handleDebridChange(opt.value)}
                >
                  {isActive && <span className="debrid-dot" aria-hidden="true" />}
                  {opt.label}
                </button>
              );
            })}
          </div>
          <SettingsButton />
        </div>
      </div>
    </header>
  );
}
