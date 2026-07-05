import ParticleField from "./ParticleField";
import "./Section.css";

export default function Section({ id, label, title, body, reverse = false }) {
  return (
    <section id={id} className={`section ${reverse ? "section--reverse" : ""}`}>
      <div className="section__text">
        {label && <span className="section__label">{label}</span>}
        <h2 className="section__title">{title}</h2>
        <p className="section__body">{body}</p>
      </div>
      <div className="section__visual">
        <ParticleField density={220} />
      </div>
    </section>
  );
}
