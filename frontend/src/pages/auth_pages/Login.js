import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

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
      const res = await axios.post(`/login`, {
        email: email,
        password: password,
      });
      console.log(res);
      handleSuccess("Connecté avec succès !");
      setEmail("");
      setPassword("");

      const userResponse = await axios.get("/api/user");
      const user = userResponse.data;

      if (user && user.role === "SuperAdministrateur") {
        navigate("/super-admin/users");
      } else if (user) {
        navigate("/");
      }
    } catch (error) {
      if (error.response.status === 422) {
        handleError(error.response.data.message);
      }
    }
  };

  return (
    <Card
      body
      className="shadow-lg p-3 mb-5 bg-white rounded"
      style={{ width: "130%", marginLeft: "-15%" }}
    >
      <h4>Bienvenue de nouveau !</h4>
      <h6 className="font-weight-light">Se connecter</h6>
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
            <InputGroup.Text id="inputGroup-sizing-default">
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i
                    className="mdi mdi-email-outline text-primary"
                    style={{ fontSize: "1.5em" }}
                  />
                </span>
              </div>
            </InputGroup.Text>
            <Form.Control
              type="email"
              placeholder="Saisir votre adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez saisir votre adresse e-mail dans un format adéquat !
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mot de passe</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i
                    className="mdi mdi-lock-outline text-primary"
                    style={{ fontSize: "1.5em" }}
                  />
                </span>
              </div>
            </InputGroup.Text>
            <Form.Control
              type="password"
              placeholder="Saisir votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
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
          Vous n'avez pas de compte ?{" "}
          <a href="login.html" className="text-primary">
            S'inscrire
          </a>
        </div>
      </Form>
      <ToastContainer />
    </Card>
  );
}

export default Login;
