import { Link } from "react-router-dom";
import axios from "../../services/axios";
import { useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirm] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleTogglePassword = () => { 
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => { 
    setShowConfirmPassword(!showConfirmPassword);
  };

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

  const resendVerifLink = () => {
    axios.post('/email/verification-notification')
  }

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

      const res =await axios.post("/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res);
      handleSuccess("Enregistré avec succès !");

      Swal.fire({
        title: "Vérifier votre adresse e-mail !",
        text: " Avant de continuer, veuillez vérifier votre e-mail pour le lien de vérification. Si vous n'avez pas reçu l'e-mail, cliquez ici pour en demander un autre !",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        // confirmButtonText: <button onClick={resendVerifLink}>Envoyer un autre e-mail!</button>,
        // getConfirmButton: <button onClick={resendVerifLink}>Envoyer un autre e-mail!</button>,
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

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setPasswordConfirm("");
      setPhoneNumber("");
      setProfileImage("");
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
        <Form.Group className="mb-3">
          <Form.Label>Confirmation de mot de passe</Form.Label>
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
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  value={password_confirmation}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
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
                  onClick={handleToggleConfirmPassword}
                  className="text-primary"
                >
                  {showConfirmPassword ? (
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
              placeholder="Saisir votre numéro de téléphone"
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
          <Link to="/login" className="text-primary">
            Se connecter
          </Link>
        </div>
      </Form>
      <ToastContainer />
    </Card>
  );
}

export default Register;
