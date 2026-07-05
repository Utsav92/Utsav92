import "./Footer.css";

export default function Footer() {
  return (
    <footer className="apple-footer">
      <p className="apple-footer__legal">
        Los precios no incluyen posibles impuestos aplicables. La duración de la batería
        varía según el uso y la configuración; consulta{" "}
        <a className="apple-arrow-link" href="#detalles">
          apple.com/es/batteries
        </a>{" "}
        para más información.
      </p>
      <p className="apple-footer__copyright">
        MacBook Neo es un producto ficticio usado como referencia de estilo. Todos los derechos reservados.
      </p>
    </footer>
  );
}
