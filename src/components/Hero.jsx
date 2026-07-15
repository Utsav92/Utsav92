import EffectReel from "./EffectReel";
import { presets } from "../data/presets";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero__text">
        <span className="hero__label">AI Video Infrastructure</span>
        <h1 className="hero__title">
          Turn any photo into a
          <br />
          <span className="hero__title-accent">scroll-stopping</span> video.
        </h1>
        <p className="hero__body">
          250+ cinematic camera presets and trending viral effects — no camera, no
          crew, no editing software required.
        </p>
        <div className="hero__actions">
          <a className="hero__cta" href="#start-creating">
            Start Creating — It's Free
          </a>
          <a className="hero__cta-secondary" href="#presets">
            Explore Presets
          </a>
        </div>
      </div>
      <div className="hero__visual">
        <EffectReel items={presets.slice(0, 6)} />
      </div>
    </section>
  );
}
