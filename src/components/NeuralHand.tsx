import { motion } from "motion/react";

const PALM_XS = [110, 155, 200, 245, 290];
const PALM_YS = [380, 415, 450, 485, 520];

const FINGERS: [number, number][][] = [
  [[155, 380], [150, 320], [146, 260], [142, 205]], // index
  [[200, 380], [199, 310], [198, 245], [197, 185]], // middle
  [[245, 380], [248, 315], [250, 250], [252, 195]], // ring
  [[290, 380], [296, 330], [300, 280], [304, 235]], // pinky
];

const THUMB: [number, number][] = [[110, 380], [78, 345], [50, 300], [28, 260]];

function buildGraph() {
  const nodes: [number, number][] = [];
  const edges: [number, number][] = [];

  for (const y of PALM_YS) {
    for (const x of PALM_XS) {
      nodes.push([x, y]);
    }
  }

  for (let r = 0; r < PALM_YS.length; r++) {
    for (let c = 0; c < PALM_XS.length; c++) {
      const idx = r * PALM_XS.length + c;
      if (c < PALM_XS.length - 1) edges.push([idx, idx + 1]);
      if (r < PALM_YS.length - 1) edges.push([idx, idx + PALM_XS.length]);
    }
  }

  const findBase = (point: [number, number]) =>
    nodes.findIndex(([x, y]) => x === point[0] && y === point[1]);

  for (const finger of FINGERS) {
    let prevIdx = findBase(finger[0]);
    for (let i = 1; i < finger.length; i++) {
      nodes.push(finger[i]);
      const idx = nodes.length - 1;
      edges.push([prevIdx, idx]);
      prevIdx = idx;
    }
  }

  let prevThumbIdx = findBase(THUMB[0]);
  for (let i = 1; i < THUMB.length; i++) {
    nodes.push(THUMB[i]);
    const idx = nodes.length - 1;
    edges.push([prevThumbIdx, idx]);
    prevThumbIdx = idx;
  }

  return { nodes, edges, palmCount: PALM_XS.length * PALM_YS.length };
}

const { nodes, edges, palmCount } = buildGraph();

export default function NeuralHand() {
  return (
    <motion.div
      initial={{ y: "-65%", opacity: 0 }}
      whileInView={{ y: "-78%", opacity: 1 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 1.4, ease: "easeOut" }}
      className="pointer-events-none absolute top-0 left-1/2 z-0 aspect-[2/3] w-[160vw] -translate-x-1/2 md:w-[1100px]"
    >
      <svg viewBox="0 0 400 600" className="h-full w-full" aria-hidden="true">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke="white"
            strokeOpacity={0.3}
            strokeWidth={1.5}
          />
        ))}
        {nodes.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i < palmCount ? 4 : 3}
            fill="white"
            opacity={0.85}
          />
        ))}
      </svg>
    </motion.div>
  );
}
