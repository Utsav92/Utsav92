import { useState, useEffect } from "react";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Effects", href: "#effects" },
  { label: "Presets", href: "#presets" },
  { label: "Apps", href: "#apps" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <a className="navbar__brand" href="#top">
        <img className="navbar__mark" src="/favicon.svg" alt="" />
        <span className="navbar__wordmark">Higgsfield</span>
      </a>

      <ul className="navbar__links">
        {NAV_LINKS.map((link) => (
          <li key={link.label}>
            <a className="navbar__link" href={link.href}>
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <a className="navbar__cta" href="#start-creating">
        Try for Free
      </a>
    </nav>
  );
}
