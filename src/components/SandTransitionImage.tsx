import { useEffect, useId, useRef, useState } from "react";
import { usePresence } from "motion/react";

type SandTransitionImageProps = {
  src: string;
  alt: string;
  className?: string;
};

const DURATION = 900;

export default function SandTransitionImage({
  src,
  alt,
  className,
}: SandTransitionImageProps) {
  const [isPresent, safeToRemove] = usePresence();
  const rawId = useId();
  const filterId = useRef(`sand-${rawId.replace(/:/g, "")}`).current;

  const [displacement, setDisplacement] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [blur, setBlur] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const exiting = !isPresent;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION, 1);
      // "amount" = how dissolved the image is: 1 (sand) -> 0 (resolved) on enter, reversed on exit.
      const amount = exiting ? Math.pow(t, 3) : 1 - (1 - Math.pow(1 - t, 4));

      setDisplacement(amount * 150);
      setOffsetY(amount * (exiting ? 120 : -80));
      setOffsetX(amount * (exiting ? 30 : -30));
      setBlur(amount * 6);
      setOpacity(1 - amount * 1.2);

      if (t < 1) {
        frame = requestAnimationFrame(tick);
      } else if (exiting) {
        safeToRemove?.();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isPresent, safeToRemove]);

  return (
    <>
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <filter id={filterId}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="1.8"
            numOctaves={4}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={displacement}
          />
          <feOffset dx={offsetX} dy={offsetY} />
          <feGaussianBlur stdDeviation={blur} />
          <feColorMatrix
            type="matrix"
            values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${Math.max(opacity, 0)} 0`}
          />
        </filter>
      </svg>
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={className}
        style={{ filter: `url(#${filterId})` }}
      />
    </>
  );
}
