import { motion } from "motion/react";
import { letterBlock } from "../lib/variants";

export default function ArcLogo() {
  return (
    <motion.h1
      variants={{
        initial: { scale: 1.03 },
        animate: {
          scale: 1,
          transition: { staggerChildren: 0.06, delayChildren: 0.1 },
        },
      }}
      className="w-full"
    >
      <svg viewBox="0 0 700 100" className="w-full fill-[#111]" aria-label="ARC">
        {/* A */}
        <g transform="translate(0,0)">
          <motion.polygon variants={letterBlock} points="0,100 26,100 123,0 97,0" />
          <motion.polygon variants={letterBlock} points="220,100 194,100 97,0 123,0" />
          <motion.polygon variants={letterBlock} points="45,44 175,44 175,58 45,58" />
        </g>
        {/* R */}
        <g transform="translate(260,0)">
          <motion.polygon variants={letterBlock} points="0,0 16,0 16,100 0,100" />
          <motion.polygon variants={letterBlock} points="16,0 140,0 140,16 16,16" />
          <motion.polygon variants={letterBlock} points="124,0 140,0 140,52 124,52" />
          <motion.polygon variants={letterBlock} points="16,36 140,36 140,52 16,52" />
          <motion.polygon variants={letterBlock} points="90,52 124,52 190,100 156,100" />
        </g>
        {/* C */}
        <g transform="translate(490,0)">
          <motion.polygon variants={letterBlock} points="0,0 16,0 16,100 0,100" />
          <motion.polygon variants={letterBlock} points="0,0 170,0 170,16 0,16" />
          <motion.polygon variants={letterBlock} points="0,84 170,84 170,100 0,100" />
        </g>
      </svg>
    </motion.h1>
  );
}
