import React from "react";
import { Link } from "react-router-dom";
const EmailVerification = () => {
  return (
    <div className="content-wrapper">
      <div id="notfound">
        <div className="notfound-bg" />
        <div className="notfound">
          <h2>Oops! Votre adresse e-mail est non vérifié !</h2>
          <p>Veuillez vérifier votre e-mail avant d'éffectuer vos taches !</p>
          <Link to="/dashboard" className="text-primary">
            Retour à la page d'acceuil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
