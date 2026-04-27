import { useRef, useState } from "react";
import MovieCard from "./MovieCard";
import "./MovieRow.css";

export default function MovieRow({ row, onMovieClick }) {
  const rowRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scroll = (direction) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = direction === "right" ? el.clientWidth * 0.75 : -el.clientWidth * 0.75;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 0);
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  return (
    <section className="movie-row">
      <h2 className="movie-row__title">{row.title}</h2>
      <div className="movie-row__container">
        {showLeftArrow && (
          <button
            className="movie-row__arrow movie-row__arrow--left"
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>
        )}
        <div className="movie-row__list" ref={rowRef} onScroll={handleScroll}>
          {row.movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onMovieClick={onMovieClick} />
          ))}
        </div>
        {showRightArrow && (
          <button
            className="movie-row__arrow movie-row__arrow--right"
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
