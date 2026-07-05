import "./Footer.css";

export default function Footer() {
  return (
    <footer id="request-access" className="footer">
      <h2 className="footer__title">Ask your workplace anything.</h2>
      <p className="footer__body">
        Join the teams already replacing the search bar with a question.
      </p>
      <a className="footer__cta" href="mailto:hello@dala.ai">
        Request Access
      </a>
      <div className="footer__bottom">
        <span>Dala</span>
        <div className="footer__links">
          <a href="#manifesto">Manifesto</a>
          <a href="#team">Team</a>
          <a href="#blog">Blog</a>
        </div>
      </div>
    </footer>
  );
}
