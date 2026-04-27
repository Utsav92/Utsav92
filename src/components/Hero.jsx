import { useState } from "react";
import { heroMovie } from "../data/movies";
import "./Hero.css";

export default function Hero({ onMovieClick }) {
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const movie = heroMovie;

  return (
    <div className="hero">
      <div
        className="hero__backdrop"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      />
      <div className="hero__vignette" />

      <div className="hero__content">
        <div className="hero__meta">
          <span className="hero__badge">N SERIES</span>
        </div>
        <h1 className="hero__title">{movie.title}</h1>
        <p className="hero__tagline">{movie.tagline}</p>
        <p className="hero__overview">{movie.overview}</p>

        <div className="hero__rating">
          <span className="hero__stars">
            {"★".repeat(Math.round(movie.rating / 2))}
            {"☆".repeat(5 - Math.round(movie.rating / 2))}
          </span>
          <span className="hero__score">{movie.rating} / 10</span>
          <span className="hero__dot">•</span>
          <span>{movie.year}</span>
          <span className="hero__dot">•</span>
          <span>{movie.runtime}m</span>
        </div>

        <div className="hero__buttons">
          <button
            className="hero__btn hero__btn--play"
            onClick={() => setTrailerPlaying(true)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M8 5v14l11-7z" />
            </svg>
            Play
          </button>
          <button
            className="hero__btn hero__btn--info"
            onClick={() => onMovieClick(movie)}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            More Info
          </button>
        </div>

        <div className="hero__genres">
          {movie.genres.map((g, i) => (
            <span key={g}>
              {i > 0 && <span className="hero__genre-sep">•</span>}
              {g}
            </span>
          ))}
        </div>
      </div>

      {trailerPlaying && (
        <div className="hero__trailer-overlay" onClick={() => setTrailerPlaying(false)}>
          <div className="hero__trailer-box">
            <button className="hero__trailer-close" onClick={() => setTrailerPlaying(false)}>✕</button>
            <div className="hero__trailer-placeholder">
              <svg viewBox="0 0 24 24" fill="#E50914" width="80" height="80">
                <path d="M8 5v14l11-7z" />
              </svg>
              <p>Trailer unavailable in demo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
