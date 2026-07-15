import "./EffectReel.css";

export default function EffectReel({ items, compact = false }) {
  return (
    <div className={`effect-reel ${compact ? "effect-reel--compact" : ""}`}>
      {items.map((item, i) => (
        <div
          className="effect-tile"
          key={item.name}
          style={{ background: item.gradient, animationDelay: `${(i % 6) * 0.35}s` }}
        >
          <span className="effect-tile__play" aria-hidden="true">▶</span>
          <span className="effect-tile__name">{item.name}</span>
        </div>
      ))}
    </div>
  );
}
