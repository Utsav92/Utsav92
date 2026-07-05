import "./Hero.css";

export default function Hero() {
  return (
    <section className="apple-hero" id="hero">
      <span className="apple-hero__eyebrow">MacBook Neo</span>
      <h1 className="apple-hero__title">Hola, Neo.</h1>
      <div className="apple-hero__actions">
        <a className="apple-pill-button apple-pill-button--filled" href="#comprar">
          Comprar
        </a>
        <a className="apple-pill-button apple-pill-button--ghost" href="#info">
          Más información
        </a>
      </div>
      <span className="apple-hero__price">Desde 799 €</span>
      <div className="apple-hero__visual" aria-hidden="true">
        <div className="apple-hero__device" />
      </div>
    </section>
  );
}
