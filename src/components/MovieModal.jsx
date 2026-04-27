import { useEffect } from "react";
import "./MovieModal.css";

export default function MovieModal({ movie, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!movie) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="modal__hero">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="modal__backdrop"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="modal__hero-vignette" />
          <div className="modal__hero-content">
            <h2 className="modal__title">{movie.title}</h2>
            <div className="modal__hero-buttons">
              <button className="modal__btn modal__btn--play">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </button>
              <button className="modal__btn modal__btn--icon" aria-label="Add to list">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
              <button className="modal__btn modal__btn--icon" aria-label="Like">
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="modal__body">
          <div className="modal__left">
            <div className="modal__meta">
              <span className="modal__match">{movie.rating * 10}% Match</span>
              <span className="modal__year">{movie.year}</span>
              <span className="modal__age-badge">16+</span>
              <span className="modal__runtime">{movie.runtime}m</span>
              <span className="modal__hd-badge">HD</span>
            </div>
            <p className="modal__overview">{movie.overview}</p>
          </div>
          <div className="modal__right">
            <div className="modal__detail">
              <span className="modal__detail-label">Genres:</span>
              <span>{movie.genres.join(", ")}</span>
            </div>
            <div className="modal__detail">
              <span className="modal__detail-label">Rating:</span>
              <span>
                <span className="modal__stars">{"★".repeat(Math.round(movie.rating / 2))}</span>
                {" "}{movie.rating} / 10
              </span>
            </div>
            <div className="modal__detail">
              <span className="modal__detail-label">Available in:</span>
              <span>Ultra HD 4K • HDR</span>
            </div>
          </div>
        </div>

        <div className="modal__more-episodes">
          <h3>More Like This</h3>
          <p className="modal__more-placeholder">Similar titles will appear here.</p>
        </div>
      </div>
    </div>
  );
}
