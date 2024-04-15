import { Link } from "react-router-dom";

function Unauthorized({ status }) {
  return (
    <div className="content-wrapper">
      <div id="notfound">
        <div className="notfound-bg" />
        <div className="notfound">
          <div className="notfound-404">
            <h1>{status}</h1>
          </div>
          <h2>
            Oops! Page non {status === "404" ? "Introuvable" : "Authorisée"} !
          </h2>
          {/* <form className="notfound-search">
              <input type="text" placeholder="Search..." />
              <button type="button">Search</button>
            </form> */}
          <Link to="/dashboard" className="text-primary">
            Retour à la page d'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
