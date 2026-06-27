const toDataUri = (svg: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const wrap = (inner: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;

const neuralInterfaceSvg = wrap(`
  <circle cx="100" cy="100" r="14"/>
  <line x1="100" y1="86" x2="100" y2="30"/>
  <line x1="111" y1="93" x2="160" y2="55"/>
  <line x1="114" y1="107" x2="172" y2="120"/>
  <line x1="100" y1="114" x2="100" y2="170"/>
  <line x1="89" y1="107" x2="35" y2="135"/>
  <line x1="89" y1="93" x2="40" y2="60"/>
  <circle cx="100" cy="30" r="6"/>
  <circle cx="160" cy="55" r="6"/>
  <circle cx="172" cy="120" r="6"/>
  <circle cx="100" cy="170" r="6"/>
  <circle cx="35" cy="135" r="6"/>
  <circle cx="40" cy="60" r="6"/>
`);

const myoelectricControlSvg = wrap(`
  <path d="M20 100 L60 100 L75 50 L90 150 L105 70 L120 130 L135 100 L180 100"/>
  <circle cx="20" cy="100" r="4" fill="white"/>
  <circle cx="180" cy="100" r="4" fill="white"/>
`);

const softRoboticsSvg = wrap(`
  <path d="M100 30 C150 30 175 70 170 110 C165 150 130 175 95 172 C55 169 28 140 30 100 C32 60 60 30 100 30 Z"/>
  <path d="M70 90 C85 80 115 80 130 95"/>
  <path d="M65 120 C90 135 115 130 135 115"/>
`);

const exoskeletonDesignSvg = wrap(`
  <line x1="80" y1="20" x2="80" y2="90"/>
  <line x1="120" y1="20" x2="120" y2="90"/>
  <line x1="80" y1="20" x2="120" y2="20"/>
  <line x1="80" y1="90" x2="70" y2="160"/>
  <line x1="120" y1="90" x2="130" y2="160"/>
  <line x1="70" y1="160" x2="60" y2="180"/>
  <line x1="130" y1="160" x2="140" y2="180"/>
  <circle cx="80" cy="90" r="8"/>
  <circle cx="120" cy="90" r="8"/>
  <circle cx="70" cy="160" r="6"/>
  <circle cx="130" cy="160" r="6"/>
`);

const sensoryFeedbackSvg = wrap(`
  <circle cx="100" cy="100" r="10" fill="white"/>
  <circle cx="100" cy="100" r="35"/>
  <circle cx="100" cy="100" r="60"/>
  <circle cx="100" cy="100" r="85"/>
`);

export type Chapter = {
  name: string;
  image: string;
};

export const chaptersData: Chapter[] = [
  { name: "Neural Interfaces", image: toDataUri(neuralInterfaceSvg) },
  { name: "Myoelectric Control", image: toDataUri(myoelectricControlSvg) },
  { name: "Soft Robotics", image: toDataUri(softRoboticsSvg) },
  { name: "Exoskeleton Design", image: toDataUri(exoskeletonDesignSvg) },
  { name: "Sensory Feedback", image: toDataUri(sensoryFeedbackSvg) },
];
