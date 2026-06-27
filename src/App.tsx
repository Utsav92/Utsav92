import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Brain,
  Cpu,
  Dna,
  Hand,
  Plus,
  Zap,
} from "lucide-react";
import ArcLogo from "./components/ArcLogo";
import HeroBackdrop from "./components/HeroBackdrop";
import NeuralHand from "./components/NeuralHand";
import SandTransitionImage from "./components/SandTransitionImage";
import { chaptersData } from "./data/chapters";
import { fadeUp } from "./lib/variants";

const NAV_LINKS = ["Visit", "Innovations", "Discover", "Learn", "About"];

const ACTION_PILLS = [
  { icon: Hand, label: "Prosthetics" },
  { icon: Dna, label: "Bio-Inspired" },
  { icon: Cpu, label: "Neural Interfaces" },
  { icon: Zap, label: "Actuators" },
  { icon: BookOpen, label: "Learn More" },
];

function DnaIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      className={className}
    >
      <path d="M7 3c0 4 10 4 10 8" />
      <path d="M7 21c0-4 10-4 10-8" />
      <path d="M8.5 7h7" />
      <path d="M8.5 17h7" />
    </svg>
  );
}

export default function App() {
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [activeChapter, setActiveChapter] = useState(2);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBackdrop(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % chaptersData.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full">
      {/* ============ SECTION 1: HERO ============ */}
      <section className="relative w-full min-h-screen flex flex-col overflow-hidden">
        <AnimatePresence>
          {showBackdrop && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            >
              <HeroBackdrop />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.header
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
          }}
          className="relative pt-6 px-6 md:px-16 z-20"
        >
          <ArcLogo />

          <div className="flex flex-col gap-3 mt-8 md:flex-row md:items-start md:justify-between md:gap-0">
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full md:w-[15%] text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase"
            >
              <p>Applied</p>
              <p>Robotics</p>
              <p>Collective</p>
            </motion.div>

            <div className="hidden md:flex w-[5%] items-start justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full md:flex-1 md:w-[30%] text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase text-gray-800 leading-relaxed"
            >
              <p className="hidden md:block">
                Exploring the future of motion
                <br />
                through bio-inspired design,
                <br />
                engineering and innovation.
              </p>
              <p className="md:hidden">
                Exploring the future
                <br />
                of motion through
                <br />
                bio-inspired design,
                <br />
                engineering and innovation.
              </p>
            </motion.div>

            <div className="hidden md:flex w-[5%] items-start justify-center pt-1">
              <ArrowRight size={14} strokeWidth={1} className="text-gray-400" />
            </div>

            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hidden md:block w-[15%] text-[11px] font-mono tracking-[0.2em] uppercase text-gray-800 space-y-1"
            >
              {NAV_LINKS.map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-black hover:underline">
                    {link}
                  </a>
                </li>
              ))}
            </motion.ul>

            <button
              aria-label="Toggle menu"
              onClick={() => setIsMobileMenuOpen((p) => !p)}
              className="absolute right-6 md:right-16 top-1 z-60 flex flex-col items-end gap-[6px] group"
            >
              <span
                className={`h-[1.5px] bg-black transition-all duration-300 group-hover:w-6 ${
                  isMobileMenuOpen ? "w-8 rotate-45 translate-y-[3.75px]" : "w-8"
                }`}
              />
              <span
                className={`h-[1.5px] bg-black transition-all duration-300 group-hover:w-10 ${
                  isMobileMenuOpen ? "w-8 -rotate-45 -translate-y-[3.75px]" : "w-6"
                }`}
              />
            </button>
          </div>
        </motion.header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden relative z-20 bg-[#fcfcfc] border-b border-gray-200 shadow-xl px-6 py-8"
            >
              <ul className="space-y-6 text-sm font-mono tracking-[0.2em] uppercase">
                {NAV_LINKS.map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-black hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-1 flex-col md:flex-row md:justify-between">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } },
          }}
          className="relative px-10 md:px-16 mt-12 sm:mt-16 md:mt-20 w-[320px]"
        >
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-3 text-xs font-mono mb-4"
          >
            <span>01</span>
            <span className="w-16 h-[1.5px] bg-black/20" />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-[3.5rem] md:text-[5rem] font-normal tracking-tight leading-[1] mb-6"
          >
            BIONIC
            <br />
            FUTURE
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-[13px] md:text-[14px] text-gray-700 w-[240px] leading-[1.6] mb-6"
          >
            Step into the world of motion and
            <br />
            discover how biology inspires
            <br />
            the machines of tomorrow.
          </motion.p>

          <motion.button variants={fadeUp} className="group relative">
            <span className="relative flex items-center gap-3 overflow-hidden bg-[#1a1a1a] px-6 py-3.5 border border-[#1a1a1a] rounded-md shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[3px_3px_0px_rgba(17,17,17,0.5)] group-active:translate-y-0 group-active:shadow-sm">
              <span className="absolute inset-0 -translate-x-[101%] bg-[#fcfcfc] transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0" />
              <DnaIcon className="relative z-10 w-4 h-4 text-white transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12 group-hover:-translate-y-1 group-hover:text-[#111]" />
              <span className="relative z-10 text-[15px] font-medium text-white transition-colors duration-300 group-hover:text-[#111]">
                Explore Now
              </span>
            </span>
          </motion.button>
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: { transition: { staggerChildren: 0.15, delayChildren: 0.9 } },
          }}
          className="hidden md:flex flex-col mt-12 md:mt-20 mr-16 w-[200px]"
        >
          <motion.div variants={fadeUp} className="mb-6">
            <h3 className="text-[10px] font-bold font-mono tracking-widest uppercase mb-1">
              Myoelectric Hand — Mk. IV
            </h3>
            <p className="text-[12px] text-gray-600 leading-[1.6]">
              Advanced Bionics Division
              <br />
              Generation IV — 2025
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex gap-8 mb-6">
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">
                Grip Force
              </p>
              <p className="text-[13px] font-medium">62 N</p>
            </div>
            <div>
              <p className="text-[10px] font-mono tracking-widest uppercase text-gray-500 mb-1">
                Response Time
              </p>
              <p className="text-[13px] font-medium">8 ms</p>
            </div>
          </motion.div>

          <motion.button
            variants={fadeUp}
            className="group flex items-center gap-3 text-left"
          >
            <span className="w-10 h-10 rounded-full border border-gray-400 flex items-center justify-center transition-colors duration-300 group-hover:border-black group-hover:bg-[#111]">
              <Plus
                size={16}
                strokeWidth={1.5}
                className="text-[#111] transition-colors duration-300 group-hover:text-white"
              />
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
              View Details
            </span>
          </motion.button>
        </motion.div>
        </div>

        <motion.div
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, delay: 1.2 }}
          className="hidden md:flex absolute bottom-10 left-[2.5rem] md:left-[4rem] items-center gap-4 z-10"
        >
          <span className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center gap-[4px]">
            <span className="w-[1px] h-[12px] bg-gray-600" />
            <span className="w-[1px] h-[12px] bg-gray-600" />
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold">
            Scroll to explore
          </span>
        </motion.div>
      </section>

      {/* ============ SECTION 2: EXPLORE THE TECHNOLOGY ============ */}
      <section className="relative w-full min-h-[75vh] md:min-h-screen bg-[#fcfcfc] flex flex-col items-center pt-24 md:pt-32 pb-0 z-20">
        <p className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] mb-12">
          <span className="text-gray-500">[ 02 ] </span>
          <span className="text-gray-900 font-bold uppercase">
            Explore The Technology
          </span>
        </p>

        <motion.h2
          initial={{ y: 40, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-[2.2rem] md:text-[3.5rem] lg:text-[4.2rem] leading-[1.1] font-medium tracking-tight text-[#111] text-center max-w-[1000px] px-6"
        >
          Engineer the future of human movement
          <br className="hidden md:block" /> through biomechanics, neural
          interfaces, and adaptive materials.
        </motion.h2>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
          }}
          className="flex flex-wrap justify-center gap-3 md:gap-4 mt-12 mb-10 md:mb-24 px-6"
        >
          {ACTION_PILLS.map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              className="flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800 transition-colors duration-300 hover:border-black hover:bg-black hover:text-white"
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </motion.button>
          ))}
        </motion.div>

        <div className="min-h-[220px] md:min-h-[450px] w-full" />

        <div className="absolute bottom-0 left-0 w-full flex justify-between px-8 md:px-16 pb-8 md:pb-12 pointer-events-none">
          <span className="hidden md:block text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            We Don't Just Build Machines.
          </span>
          <span className="hidden md:block text-[10px] font-mono tracking-widest uppercase text-gray-500 font-medium">
            Biomechatronics (C) 2026
          </span>
        </div>
      </section>

      {/* ============ SECTION 3: THE INNOVATION COLLECTION (DARK) ============ */}
      <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col z-30 overflow-hidden">
        <NeuralHand />

        <div className="relative z-10 px-8 md:px-16 pt-32 md:pt-48 mb-16 flex flex-col xl:flex-row justify-between gap-10">
          <h2 className="text-[1.8rem] md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem] leading-[1.15] font-medium tracking-tight text-white max-w-[720px]">
            Engineered from countless hours of research
            <span className="inline-flex gap-2 md:gap-3 align-middle mx-2 md:mx-4 translate-y-[-4px]">
              {[Brain, Cpu, Hand].map((Icon, i) => (
                <span
                  key={i}
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600 bg-black text-gray-400 flex items-center justify-center transition-colors duration-300 hover:bg-white hover:text-black hover:border-white"
                >
                  <Icon size={22} />
                </span>
              ))}
            </span>
            & iteration.
          </h2>

          <div className="md:max-w-[280px]">
            <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase mb-6 leading-relaxed">
              We don't just prototype devices
              <br />
              we restore human movement
            </p>
            <div className="flex flex-wrap gap-3">
              {["Adaptive", "Biomimetic", "Empowering"].map((tag) => (
                <span
                  key={tag}
                  className="px-5 py-2 rounded-full border border-gray-600 text-[9px] font-mono tracking-widest uppercase text-gray-300 transition-colors duration-300 hover:bg-white hover:text-black hover:border-white"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 h-[1px] bg-gray-800" />

        <div className="relative z-10 flex flex-col md:flex-row">
          {/* Left panel */}
          <div className="md:w-[35%] border-b md:border-b-0 md:border-r border-gray-800 min-h-[400px] md:min-h-[500px] flex flex-col p-8">
            <span className="text-gray-500 text-xl tracking-[0.3em]">***</span>

            <div className="relative flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <SandTransitionImage
                  key={activeChapter}
                  src={chaptersData[activeChapter].image}
                  alt={chaptersData[activeChapter].name}
                  className="absolute inset-0 w-[80%] h-[80%] m-auto object-contain mix-blend-lighten"
                />
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#888] uppercase">
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeChapter}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {String(activeChapter + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
              <span className="text-[#333]">/</span>
              <span>{String(chaptersData.length).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Right panel */}
          <div className="md:w-[65%] flex flex-col">
            <div className="border-b border-gray-800 p-8 flex justify-between text-[10px] font-mono text-gray-400 tracking-widest uppercase">
              <span>Study biology. Engineer the future.</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeChapter}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Chapter {String(activeChapter + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>

            {chaptersData.map((chapter, i) => (
              <button
                key={chapter.name}
                onClick={() => setActiveChapter(i)}
                className={`w-full text-left border-b border-gray-800/80 py-8 px-8 flex items-center justify-between transition-colors duration-300 ${
                  activeChapter === i ? "text-white" : "text-[#444] hover:text-[#999]"
                }`}
              >
                <span className="text-2xl md:text-[2rem] font-medium tracking-tight">
                  {chapter.name}
                </span>
                <AnimatePresence>
                  {activeChapter === i && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowUpRight size={22} strokeWidth={1} className="text-gray-400" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </div>
        </div>

        <div className="relative z-10 h-[1px] bg-gray-800" />
        <p className="relative z-10 px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]">
          Advancing The Science Of Movement
        </p>
      </section>
    </div>
  );
}
