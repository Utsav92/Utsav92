import { useState, useEffect } from "react";
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Manifesto", href: "#manifesto" },
  { label: "Team", href: "#team" },
  { label: "Blog", href: "#blog" },
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
        <span className="navbar__wordmark">Dala</span>
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

      <a className="navbar__cta" href="#request-access">
        Request Access
      </a>
    </nav>
  );
}
