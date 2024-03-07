import { Link, useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authenticatedUserSlice";
import CustomModal from "../../components/CustomModal";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
      await axios.post(`/login`, {
        email: email,
        password: password,
      });

      handleSuccess("Connecté avec succès !");
      setEmail("");
      setPassword("");

      const userResponse = await axios.get("/api/user");
      const user = userResponse.data;

      //stock user in redux
      dispatch(setUser(user));

      if (user) {
        if (user.role === "SuperAdministrateur") {
          navigate("/super-admin/users");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.response.status === 422) {
        handleError(error.response.data.message);
      }
    }
  };

  const showForgotPasswordModal = () => setShowModal(true);
  const handleCloseForgotPasswordModal = () => setShowModal(false);

  return (
    <Card
      body
      className="shadow-lg p-3 mb-5 bg-white rounded"
      style={{ width: "130%", marginLeft: "-15%" }}
    >
      <h4>Bienvenue de nouveau !</h4>
      <h6 className="font-weight-light">Se connecter</h6>
      {showModal && (
        <CustomModal show={showModal} handleClose={handleCloseForgotPasswordModal} typeModal="ForgotPassword"/>
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
