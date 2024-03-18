import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";
import { apiFetch } from "../../services/api";
import { setUser } from "../../store/slices/authenticatedUserSlice";
import { useDispatch } from "react-redux";
import { ToastContainer, toast } from "react-toastify";

function EmailVerif() {
  const { id, hash } = useParams();
  const location = useLocation();
  const queryParams = location.search;
  const [status, setStatus] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const verification = () => {
      // Construct the verification URL to call the backend
      const verifyUrl = `/verify-email/${id}/${hash}${queryParams}`;

      axios
        .get(verifyUrl, {
          withCredentials: true,
        })
        .then((response) => {
          console.log(response);
          setStatus(true);
          Swal.fire({
            title: "Adresse e-mail verifiée avec succès !",
            showClass: {
              popup: `
                  animate__animated
                  animate__fadeInUp
                  animate__faster
                `,
            },
            hideClass: {
              popup: `
                  animate__animated
                  animate__fadeOutDown
                  animate__faster
                `,
            },
          });
        })
        .catch((error) => {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: `Erreur lors de la vérification de l'adresse e-mail : ${error}`,
          });
        });
    };

    verification();
  }, [id, hash, queryParams]);

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleError = (err) =>
    toast.error(err, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const logout = async () => {
    if (localStorage.getItem("token")) {
      await apiFetch("google-logout", {
        method: "POST",
      });
      dispatch(setUser(null));
      localStorage.removeItem("token");
      handleSuccess("Déconnecté avec succès !");
      navigate("/login");
    } else {
      axios
        .post("/logout")
        .then(() => {
          dispatch(setUser(null));
          handleSuccess("Déconnecté avec succès !");
          navigate("/login");
        })
        .catch((e) => {
          if (e && e.response.status === 422) {
            handleError(e.response.data.message);
          }
        });
    }
  };

  return (
    <div className="content-wrapper">
      <div id="notfound">
        <div className="notfound-bg" />
        <ToastContainer />
        <div className="notfound">
          {status ? (
            <h2>
              Votre adresse e-mail est vérifiée avec succès ! Veuillez cliquer
              sur
              <Button className="btn btn-light mt-3" onClick={logout}>
                <i className="mdi mdi-logout text-primary" />
                Se déconnecter
              </Button>
            </h2>
          ) : (
            <h2>
              Veuillez patienter, on est en train de vérifier votre adresse
              e-mail !
            </h2>
          )}
          <Link to="/login" className="text-primary">
            Retour à la page de SignIn
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EmailVerif;
