import "./ColorVariantGrid.css";

const FINISHES = [
  { name: "Citrus", token: "--color-citrus" },
  { name: "Blush", token: "--color-blush" },
];

export default function ColorVariantGrid() {
  return (
    <section className="apple-variants">
      <h2 className="apple-variants__heading">Elige tu Neo.</h2>
      <div className="apple-variants__grid">
        {FINISHES.map((finish) => (
          <div
            key={finish.name}
            className="apple-variants__card"
            style={{ background: `var(${finish.token})` }}
          >
            <div className="apple-variants__device" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
