import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

  const isWhitespace = (str) => {
    return str.trim() === "";
  };

  const passwordMatchValidator = () => {
    return password === password_confirmation;
  };

  const csrf = () => axios.get("/sanctum/csrf-cookie");

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

  const handleRegister = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(firstName) ||
        isWhitespace(lastName) ||
        !passwordMatchValidator() ||
        isWhitespace(phoneNumber)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("password_confirmation", password_confirmation);
      formData.append("phoneNumber", phoneNumber);
      formData.append("profileImage", profileImage);

      await axios.post("/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      handleSuccess("Enregistré avec succès !");

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      setPhoneNumber("");
      setProfileImage("");
      navigate("/");
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
      <h4 className="mb-3">S'inscrire</h4>
      <h6 className="font-weight-light mt-3 mb-4">
        Créer un nouveau compte administrateur
      </h6>
      <Form
        ref={formRef}
        noValidate
        validated={validated}
        className="pt-3"
        onSubmit={handleRegister}
      >
        <Form.Group className="mb-3">
          <Form.Label>Prénom</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i
                    className="mdi mdi-account-outline text-primary"
                    style={{ fontSize: "1.5em" }}
                  />
                </span>
              </div>
            </InputGroup.Text>
            <Form.Control
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              placeholder="Saisir votre prénom"
              required
              minLength={3}
            />
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez saisir votre prénom qui doit avoir minimum 3 caractères !
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nom</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i
                    className="mdi mdi-account-outline text-primary"
                    style={{ fontSize: "1.5em" }}
                  />
                </span>
              </div>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Saisir votre nom de famille"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              minLength={3}
            />
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez saisir votre nom qui doit avoir minimum 3 caractères !
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
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
        <Form.Group className="mb-3">
          <Form.Label>Confirmation de mot de passe</Form.Label>
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
              placeholder="Confirmez votre mot de passe"
              value={password_confirmation}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={8}
            />
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez saisir votre mot de passe qui doit comporter minimum 8
              caractères ! <br />
              {!passwordMatchValidator() &&
                "Les deux mots de passe que vous avez saisis ne correspondent pas !"}
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Numéro de Téléphone</Form.Label>
          <InputGroup className="mb-3">
            <InputGroup.Text id="inputGroup-sizing-default">
              <div className="input-group-prepend bg-transparent">
                <span className="input-group-text bg-transparent border-right-0">
                  <i
                    className="mdi mdi-phone text-primary"
                    style={{ fontSize: "1.5em" }}
                  />
                </span>
              </div>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Saisir votre niméro de téléphone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              minLength={8}
            />
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez saisir votre Numéro de Téléphone qui doit comporter au
              moins 8 caractères !
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Image</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control
              type="file"
              accept="image/*"
              placeholder="Selectionner votre image"
              onChange={(e) => setProfileImage(e.target.files[0])}
              required
            />
            <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">
              Veuillez selectionner votre image !
            </Form.Control.Feedback>
          </InputGroup>
        </Form.Group>
        <div className="mt-5 d-flex justify-content-center">
          <Button
            type="submit"
            className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
          >
            S'inscrire
          </Button>
        </div>
        <div className="text-center mt-4 font-weight-light">
          Vous avez déjà un compte ?{" "}
          <a href="login.html" className="text-primary">
            Se connecter
          </a>
        </div>
      </Form>
      <ToastContainer />
    </Card>
  );
}

export default Register;
