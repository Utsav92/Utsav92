import { useState } from "react";
import "./MovieCard.css";

export default function MovieCard({ movie, onMovieClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="movie-card" onClick={() => onMovieClick(movie)}>
      <div className="movie-card__img-wrap">
        {!imgError ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className="movie-card__img"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-card__img-fallback">
            <span>{movie.title}</span>
          </div>
        )}
        <div className="movie-card__overlay">
          <button
            className="movie-card__play-btn"
            aria-label={`Play ${movie.title}`}
            onClick={(e) => { e.stopPropagation(); onMovieClick(movie); }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
          <div className="movie-card__actions">
            <button className="movie-card__action-btn movie-card__action-btn--circle" aria-label="Add to list">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            </button>
            <button className="movie-card__action-btn movie-card__action-btn--circle" aria-label="Like">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
            </button>
            <button className="movie-card__action-btn movie-card__action-btn--circle" aria-label="More info" onClick={(e) => { e.stopPropagation(); onMovieClick(movie); }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>
          </div>
          <div className="movie-card__info">
            <div className="movie-card__rating">
              <span className="movie-card__rating-dot" />
              {movie.rating} Match
            </div>
            <div className="movie-card__year-genres">
              <span>{movie.year}</span>
              <span className="movie-card__age-badge">16+</span>
              <span>{movie.runtime}m</span>
            </div>
            <div className="movie-card__genres">
              {movie.genres.slice(0, 2).join(" • ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
