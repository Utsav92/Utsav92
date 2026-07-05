import { useEffect, useRef } from "react";
import "./ParticleField.css";

const PALETTE = ["#8052ff", "#ffb829", "#15846e", "#47bfff", "#c86bff", "#ff6b9d"];

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

// Lobed radius function approximating an organic brain/cloud silhouette.
function blobRadius(theta, seed) {
  return (
    1 +
    0.22 * Math.sin(3 * theta + seed[0]) +
    0.14 * Math.sin(5 * theta + seed[1]) +
    0.08 * Math.sin(9 * theta + seed[2])
  );
}

function buildParticles(width, height, density) {
  const cx = width / 2;
  const cy = height / 2;
  const baseRadius = Math.min(width, height) * 0.42;
  const seed = [randomRange(0, 7), randomRange(0, 7), randomRange(0, 7)];

  const particles = [];
  const coreCount = Math.round(density);
  for (let i = 0; i < coreCount; i++) {
    const theta = randomRange(0, Math.PI * 2);
    const shellFactor = blobRadius(theta, seed);
    const r = baseRadius * shellFactor * Math.sqrt(randomRange(0.55, 1));
    particles.push({
      x: cx + Math.cos(theta) * r,
      y: cy + Math.sin(theta) * r * 0.85,
      size: randomRange(3, 7),
      rotation: randomRange(0, Math.PI * 2),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      phase: randomRange(0, Math.PI * 2),
      speed: randomRange(0.4, 1),
      drift: randomRange(2, 6),
      opacityBase: randomRange(0.55, 1),
    });
  }

  const ambientCount = Math.round(density * 0.35);
  for (let i = 0; i < ambientCount; i++) {
    particles.push({
      x: randomRange(0, width),
      y: randomRange(0, height),
      size: randomRange(2, 4),
      rotation: randomRange(0, Math.PI * 2),
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      phase: randomRange(0, Math.PI * 2),
      speed: randomRange(0.2, 0.6),
      drift: randomRange(3, 10),
      opacityBase: randomRange(0.15, 0.4),
    });
  }

  return particles;
}

function drawTriangle(ctx, x, y, size, rotation, color, opacity) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.87, size * 0.6);
  ctx.lineTo(-size * 0.87, size * 0.6);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 1.4;
  ctx.stroke();
  ctx.restore();
}

export default function ParticleField({ density = 420 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let particles = [];
    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let frameId;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = buildParticles(width, height, density);
    };

    const renderStatic = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        drawTriangle(ctx, p.x, p.y, p.size, p.rotation, p.color, p.opacityBase);
      });
    };

    const renderFrame = (t) => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        const wobble = Math.sin(t * 0.001 * p.speed + p.phase);
        const x = p.x + wobble * p.drift * 0.3;
        const y = p.y + Math.cos(t * 0.0008 * p.speed + p.phase) * p.drift;
        const opacity = p.opacityBase * (0.7 + 0.3 * wobble);
        drawTriangle(ctx, x, y, p.size, p.rotation + t * 0.0002 * p.speed, p.color, opacity);
      });
      frameId = requestAnimationFrame(renderFrame);
    };

    resize();
    window.addEventListener("resize", resize);

    if (reduceMotion) {
      renderStatic();
    } else {
      frameId = requestAnimationFrame(renderFrame);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [density]);

  return (
    <div className="particle-field">
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}
