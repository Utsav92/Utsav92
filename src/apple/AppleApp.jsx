import PromoRibbon from "./components/PromoRibbon";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeatureShowcase from "./components/FeatureShowcase";
import ColorVariantGrid from "./components/ColorVariantGrid";
import Footer from "./components/Footer";

export default function AppleApp() {
  return (
    <div className="apple-app">
      <PromoRibbon />
      <Navbar />
      <main>
        <Hero />
        <FeatureShowcase />
        <ColorVariantGrid />
      </main>
      <Footer />
    </div>
  );
}
