import { motion } from "motion/react";

const NODES: [number, number][] = [
  [8, 15], [22, 8], [38, 20], [55, 10], [70, 18], [85, 9], [95, 22],
  [12, 40], [30, 45], [48, 38], [65, 48], [80, 40], [92, 46],
  [6, 68], [20, 75], [35, 66], [52, 72], [68, 65], [83, 74], [96, 68],
  [15, 92], [40, 88], [60, 94], [78, 90],
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [0, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
  [7, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19],
  [13, 20], [20, 21], [21, 22], [22, 23],
  [2, 9], [9, 16], [16, 21], [4, 11], [11, 18],
];

export default function HeroBackdrop() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      {EDGES.map(([a, b], i) => (
        <line
          key={i}
          x1={NODES[a][0]}
          y1={NODES[a][1]}
          x2={NODES[b][0]}
          y2={NODES[b][1]}
          stroke="#111"
          strokeOpacity={0.08}
          strokeWidth={0.15}
        />
      ))}
      {NODES.map(([x, y], i) => (
        <motion.circle
          key={i}
          cx={x}
          cy={y}
          r={0.55}
          fill="#111"
          animate={{ opacity: [0.12, 0.35, 0.12] }}
          transition={{
            duration: 3 + (i % 5),
            repeat: Infinity,
            delay: (i % 7) * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </svg>
  );
}
