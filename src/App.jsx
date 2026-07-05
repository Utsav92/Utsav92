import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Section from "./components/Section";
import Team from "./components/Team";
import Footer from "./components/Footer";
import "./App.css";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero />
        <Section
          id="manifesto"
          label="The Manifesto"
          title="We are the sum of everything we know."
          body="Every doc, decision, and Slack thread your team has ever written holds an answer for someone, somewhere. Dala turns that scattered memory into a single mind you can talk to."
        />
        <Section
          reverse
          label="How It Works"
          title="Ask once. Know instantly."
          body="No more digging through folders or pinging five people for the same answer. Dala reads across every tool your team already uses and responds like a colleague who's been there since day one."
        />
        <Team />
      </main>
      <Footer />
    </div>
  );
}
