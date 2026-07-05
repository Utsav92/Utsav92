import "./FeatureShowcase.css";

export default function FeatureShowcase() {
  return (
    <section className="apple-feature">
      <span className="apple-feature__nuevo">Nuevo</span>
      <h2 className="apple-feature__heading">Lo principal.</h2>
      <div className="apple-feature__card">
        <h3 className="apple-feature__card-title">Chip Neo. Rápido de verdad.</h3>
        <p className="apple-feature__card-body">
          Hasta 22 horas de batería y un rendimiento silencioso que se adapta a lo que
          estás haciendo, ya sea editar vídeo o abrir quince pestañas a la vez.
        </p>
        <a className="apple-arrow-link" href="#chip">
          Más información sobre el chip Neo ›
        </a>
      </div>
    </section>
  );
}
