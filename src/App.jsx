import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Section from "./components/Section";
import EffectReel from "./components/EffectReel";
import PresetGrid from "./components/PresetGrid";
import Footer from "./components/Footer";
import { presets } from "./data/presets";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Section
          id="effects"
          label="Camera Control"
          title="Direct every shot like a cinematographer."
          body="Push in, pull back, crash zoom, or orbit — Higgsfield's motion presets give any photo the camera language of a real film set, no rig required."
          visual={<EffectReel compact items={presets.slice(2, 6)} />}
        />
        <Section
          reverse
          label="Viral Presets"
          title="Trending effects, one click away."
          body="Mermaid, Liquid Metal, Face Punch, Bald Swipe — pick a preset built for the feed and get a share-ready clip in seconds."
          visual={<EffectReel compact items={[presets[1], presets[2], presets[3], presets[7]]} />}
        />
        <PresetGrid />
      </main>
      <Footer />
    </div>
  );
}
