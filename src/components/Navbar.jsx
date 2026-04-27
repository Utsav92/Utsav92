import { useState, useEffect } from "react";
import "./Navbar.css";

const NAV_LINKS = ["Home", "TV Shows", "Movies", "New & Popular", "My List", "Browse by Languages"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__left">
        <svg className="navbar__logo" viewBox="0 0 111 30" aria-label="Netflix">
          <path
            fill="#E50914"
            d="M105.062 14.28L111 30c-1.75-.25-3.499-.563-5.28-.845l-3.345-8.686-3.437 7.969c-1.687-.282-3.344-.376-5.031-.595l6.031-13.75L94.468 0h5.063l3.062 7.874L105.875 0h5.124l-5.937 14.28zM90.47 0h-4.594v27.25c1.5.094 3.062.156 4.594.343V0zm-8.563 26.937c-4.187-.281-8.375-.53-12.624-.625V0h4.687v22.256c2.656.062 5.312.25 7.937.438v4.243zM64.375 10.657v4.25h-6.406V26H53.28V0h13.5v4.28h-8.812v6.376h6.406zm-18.906-6.344h-5.5V26.25c-1.563 0-3.094 0-4.625.031V4.313h-5.5V.031L45.47 0v4.313zM17.68 20.625c-2.25.219-4.5.406-6.719.719V12.75H17v-4.25h-6.031V4.281h7.968V0H6.25v27.781c3.968-.406 7.937-.75 11.937-.969l-.507-6.187zM0 0v30c1.5-.219 3-.375 4.5-.5V0H0z"
          />
        </svg>
        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <a href="#" className="navbar__link">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="navbar__right">
        <div className={`navbar__search ${searchOpen ? "navbar__search--open" : ""}`}>
          <button className="navbar__icon-btn" onClick={() => setSearchOpen((o) => !o)}>
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          {searchOpen && (
            <input
              autoFocus
              className="navbar__search-input"
              placeholder="Titles, people, genres"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          )}
        </div>
        <span className="navbar__children">Children</span>
        <button className="navbar__icon-btn">
          <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </button>
        <div className="navbar__profile">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
            alt="Profile"
            className="navbar__avatar"
          />
          <svg className="navbar__caret" viewBox="0 0 24 24" fill="white" width="16" height="16">
            <path d="M7 10l5 5 5-5z" />
          </svg>
        </div>
      </div>
    </nav>
  );
}
