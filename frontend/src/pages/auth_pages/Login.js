import { Link, useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { useEffect, useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authenticatedUserSlice";
import CustomModal from "../../components/CustomModal";
import Swal from "sweetalert2";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loginUrl, setLoginUrl] = useState(null);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

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

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const resendVerifLink = () => {
    axios.post("/email/verification-notification").then((res) => {
      console.log(res);
    });
  };

  const handleLogIn = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);
      axios
        .post(`/login`, {
          email: email,
          password: password,
        })
        .then(() => {
          handleSuccess("Connecté avec succès !");
          setEmail("");
          setPassword("");

          axios.get("/api/user").then((userResponse) => {
            const user = userResponse.data;

            //stock user in redux
            dispatch(setUser(user));

            if (user && user.email_verified_at) {
              if (user.role === "SuperAdministrateur") {
                navigate("/super-admin/users");
              } else {
                navigate("/dashboard");
              }
            } else if (user && !user.email_verified_at) {
              Swal.fire({
                title: "Vérifier votre adresse e-mail !",
                text: "Avant de continuer, veuillez vérifier votre e-mail pour le lien de vérification. Si vous n'avez pas reçu l'e-mail, cliquez ici pour en demander un autre !",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "Renvoyer E-mail de vérification",
                showClass: {
                  popup: "animate__animated animate__fadeInUp animate__faster",
                },
                hideClass: {
                  popup:
                    "animate__animated animate__fadeOutDown animate__faster",
                },
                preConfirm: () => {
                  resendVerifLink();
                  return false;
                },
              });
              navigate("/request-to-verify-email");
            }
          });
        })
        .catch((error) => {
          if (error.response.status === 409) {
            Swal.fire({
              title: "Vérifier votre adresse e-mail !",
              text: "Avant de continuer, veuillez vérifier votre e-mail pour le lien de vérification. Si vous n'avez pas reçu l'e-mail, cliquez ici pour en demander un autre !",
              confirmButtonColor: "#3085d6",
              cancelButtonColor: "#d33",
              showClass: {
                popup: "animate__animated animate__fadeInUp animate__faster",
              },
              hideClass: {
                popup: "animate__animated animate__fadeOutDown animate__faster",
              },
              preConfirm: () => {
                resendVerifLink();
                return false;
              },
            });
            navigate("/request-to-verify-email");
          } else if (error.response.status === 401) {
            Swal.fire({
              icon: "error",
              title: error.response.data.error,
              showConfirmButton: false,
              timer: 2000,
            });
          }
        });
    } catch (error) {
      if (error.response.status === 422) {
        handleError(error.response.data.message);
      }
    }
  };

  const showForgotPasswordModal = () => setShowModal(true);
  const handleCloseForgotPasswordModal = () => setShowModal(false);

  useEffect(() => {
    fetch("http://localhost:8000/auth/google/redirect", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Something went wrong!");
      })
      .then((data) => setLoginUrl(data.url))
      .catch((error) => console.error(error));
  }, []);

  return (
    <Card
      body
      className="shadow-lg p-3 mb-5 bg-white rounded"
      style={{ width: "130%", marginLeft: "-15%" }}
    >
      <div className="d-flex flex-column align-items-center">
        <h4 className="text-center mb-4">Bienvenue de nouveau !</h4>
        <h6 className="font-weight-light mb-3">Se connecter avec</h6>
        {loginUrl != null && (
          <Link
            to={loginUrl}
            type="button"
            className="btn btn-google btn-social-icon-text mb-3"
          >
            <i className="mdi mdi-google-plus"></i> Google
          </Link>
        )}
        <h6 className="font-weight-light">Ou</h6>
      </div>
      {showModal && (
        <CustomModal
          show={showModal}
          handleClose={handleCloseForgotPasswordModal}
          typeModal="ForgotPassword"
        />
      )}
      <Form
        ref={formRef}
        noValidate
        validated={validated}
        className="pt-3"
        onSubmit={handleLogIn}
      >
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text
              id="inputGroup-sizing-default"
              style={{ width: "100%" }}
            >
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i
                    className="mdi mdi-email-outline text-primary"
                    style={{ fontSize: "1.5em" }}
                  />
                </span>
              </div>
              <Form.Control
                style={{ width: "100%" }}
                type="email"
                placeholder="Saisir votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </InputGroup.Text>
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez saisir votre adresse e-mail dans un format adéquat !
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mot de passe</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text
              id="inputGroup-sizing-default"
              style={{ width: "100%" }}
            >
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i
                    className="mdi mdi-lock-outline text-primary"
                    style={{ fontSize: "1.5em" }}
                  />
                </span>
              </div>
              <div style={{ position: "relative", width: "100%" }}>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Saisir votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "5px",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                  type="button"
                  onClick={handleTogglePassword}
                  className="text-primary"
                >
                  {showPassword ? (
                    <i className="mdi mdi-eye-off" />
                  ) : (
                    <i className="mdi mdi-eye" />
                  )}
                </button>
              </div>
            </InputGroup.Text>
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez saisir votre mot de passe qui doit comporter minimum 8
              caractères !
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <div className="mt-5 d-flex justify-content-center">
          <Button
            type="submit"
            className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
          >
            Se connecter
          </Button>
        </div>
        <div className="text-center mt-4 font-weight-light">
          <Button onClick={showForgotPasswordModal} variant="outline-primary">
            Mot de passe oublié ?
          </Button>
        </div>
        <div className="text-center mt-4 font-weight-light">
          Vous n'avez pas de compte ?{" "}
          <Link to="/register" className="text-primary">
            S'inscrire
          </Link>
        </div>
      </Form>
      <ToastContainer />
    </Card>
  );
}

export default Login;
