import { Link } from "react-router-dom";
import axios from "../../services/axios";
import { useEffect, useRef, useState } from "react";
import Card from "react-bootstrap/Card";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useSearchParams } from "react-router-dom";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password_confirmation, setPasswordConfirm] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams()
  const { token } = useParams()

  useEffect(()=> {
    setEmail(searchParams.get('email'))
    console.log(email);
  }, [email, searchParams])

  const handleTogglePassword = () => { 
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => { 
    setShowConfirmPassword(!showConfirmPassword);
  };

  const passwordMatchValidator = () => {
    return password === password_confirmation;
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
      if (form.checkValidity() === false || !passwordMatchValidator()) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);
      await axios.post(`/reset-password`, {
        email,
        token,
        password,
        password_confirmation
      });
      
      handleSuccess("Mot de passe réinitialisé avec succès !");
      setPassword("");
      setPasswordConfirm("")

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
      <h4>Changez votre mot de passe</h4>
      <Form
        ref={formRef}
        noValidate
        validated={validated}
        className="pt-3"
        onSubmit={handleLogIn}
      >
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
        <div className="mt-5 d-flex justify-content-center">
          <Button
            type="submit"
            className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
          >
            Changer le mot de passe
          </Button>
        </div>
        <div className="text-center mt-4 font-weight-light">
          <Link to="/login" className="text-primary">
            Se connecter
          </Link>
        </div>
      </Form>
      <ToastContainer />
    </Card>
  );
}

export default ResetPassword;
