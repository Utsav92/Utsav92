import { useState } from "react";
import { presets, PAGE_SIZE } from "../data/presets";
import "./PresetGrid.css";

export default function PresetGrid() {
  const pageCount = Math.ceil(presets.length / PAGE_SIZE);
  const [page, setPage] = useState(0);

  const visible = presets.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section id="presets" className="preset-grid">
      <div className="preset-grid__header">
        <span className="preset-grid__label">Trending Now</span>
        <h2 className="preset-grid__title">One preset away from your next viral clip.</h2>
      </div>

      <div className="preset-grid__cards">
        {visible.map((preset) => (
          <div className="preset-card" key={preset.name}>
            <div
              className="preset-card__thumb"
              style={{ background: preset.gradient }}
              aria-hidden="true"
            >
              <span className="preset-card__play">▶</span>
            </div>
            <span className="preset-card__tag">{preset.tag}</span>
            <span className="preset-card__name">{preset.name}</span>
            <p className="preset-card__description">{preset.description}</p>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="preset-grid__dots">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              className={`preset-grid__dot ${i === page ? "preset-grid__dot--active" : ""}`}
              aria-label={`Show presets page ${i + 1}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
