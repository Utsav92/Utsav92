import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import MovieRow from "./components/MovieRow";
import MovieModal from "./components/MovieModal";
import { rows } from "./data/movies";
import "./App.css";

export default function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="app">
      <Navbar />
      <main>
        <Hero onMovieClick={setSelectedMovie} />
        <div className="app__rows">
          {rows.map((row) => (
            <MovieRow key={row.id} row={row} onMovieClick={setSelectedMovie} />
          ))}
        </div>
      </main>
      <footer className="app__footer">
        <div className="app__footer-inner">
          <p>Questions? Call 1-800-Netflix</p>
          <div className="app__footer-links">
            <a href="#">FAQ</a>
            <a href="#">Help Center</a>
            <a href="#">Account</a>
            <a href="#">Media Center</a>
            <a href="#">Investor Relations</a>
            <a href="#">Jobs</a>
            <a href="#">Cookie Preferences</a>
            <a href="#">Privacy</a>
            <a href="#">Terms of Use</a>
            <a href="#">Contact Us</a>
          </div>
          <p className="app__footer-copy">Netflix Clone — Built with React</p>
        </div>
      </footer>
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </div>
  );
}
