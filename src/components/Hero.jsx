import ParticleField from "./ParticleField";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__text">
        <span className="hero__label">Collective Intelligence</span>
        <h1 className="hero__title">
          Your workplace has the answer.
          <br />
          Just ask Dala for it.
        </h1>
        <p className="hero__body">
          Dala connects every doc, thread, and decision your team has ever made into
          one place you can ask a question — and get the answer instantly.
        </p>
        <a className="hero__cta" href="#request-access">
          Request Access
        </a>
      </div>
      <div className="hero__visual">
        <ParticleField density={520} />
      </div>
    </section>
  );
}
