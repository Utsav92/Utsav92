import { useState, useEffect } from "react";
import "./Navbar.css";

const NAV_LINKS = ["Store", "Mac", "iPad", "iPhone", "Watch", "AirPods", "Soporte"];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`apple-navbar ${scrolled ? "apple-navbar--scrolled" : ""}`}>
      <span className="apple-navbar__mark" aria-hidden="true" />
      <ul className="apple-navbar__links">
        {NAV_LINKS.map((label) => (
          <li key={label}>
            <a className="apple-navbar__link" href="#hero">
              {label}
            </a>
          </li>
        ))}
      </ul>
      <div className="apple-navbar__icons" aria-hidden="true">
        <span className="apple-navbar__icon apple-navbar__icon--search" />
        <span className="apple-navbar__icon apple-navbar__icon--bag" />
      </div>
    </nav>
  );
}
