import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import axios from '../../services/axios';
import Swal from "sweetalert2";

function EmailVerif() {
  const { id, hash } = useParams();
    const location = useLocation();
    const queryParams = location.search;

    useEffect(() => {
      const verification = async () => {
        // Construct the verification URL to call the backend
        const verifyUrl = `/verify-email/${id}/${hash}${queryParams}`;

        try {
          const response = await  axios.get(verifyUrl)
          console.log(response);
              Swal.fire({
                title: "Adresse e-mail verifiée avec succès !",                  
                showClass: {
                  popup: `
                    animate__animated
                    animate__fadeInUp
                    animate__faster
                  `
                },
                hideClass: {
                  popup: `
                    animate__animated
                    animate__fadeOutDown
                    animate__faster
                  `
                }
              });
        } catch (error) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Erreur lors de la vérification de l'adresse e-mail : ${error}`,
          });
        }
      }
     
      verification()
    }, [id, hash, queryParams]);

    return (
    <div className="content-wrapper">
      <div id="notfound">
        <div className="notfound-bg" />
        <div className="notfound">
          <h2>Veuillez patienter, on est en train de vérifier votre adresse e-mail !</h2>
          <Link to="/login" className="text-primary">Retour à la page de SignIn</Link>
        </div>
      </div>
    </div>
    );
  }
  
  export default EmailVerif;
  