import { useState } from "react";
import { team, PAGE_SIZE } from "../data/team";
import "./Team.css";

function initials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

export default function Team() {
  const pageCount = Math.ceil(team.length / PAGE_SIZE);
  const [page, setPage] = useState(0);

  const visible = team.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <section id="team" className="team">
      <div className="team__header">
        <span className="team__label">The People</span>
        <h2 className="team__title">Built by people who've felt the pain.</h2>
      </div>

      <div className="team__grid">
        {visible.map((member) => (
          <div className="team-card" key={member.name}>
            <div className="team-card__portrait" aria-hidden="true">
              <span>{initials(member.name)}</span>
            </div>
            <span className="team-card__role">{member.role}</span>
            <span className="team-card__name">{member.name}</span>
          </div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="team__dots">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              className={`team__dot ${i === page ? "team__dot--active" : ""}`}
              aria-label={`Show team page ${i + 1}`}
              onClick={() => setPage(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
