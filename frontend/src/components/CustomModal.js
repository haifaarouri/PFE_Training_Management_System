import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";

const CustomModal = ({ show, handleClose, typeModal }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

  const isWhitespace = (str) => {
    return str.trim() === "";
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

  const handleAddUser = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(firstName) ||
        isWhitespace(lastName) ||
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
      formData.append("phoneNumber", phoneNumber);
      formData.append("profileImage", profileImage);
      formData.append("role", role);

      const res = await axios.post("/api/send-email-add-user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },})

      if (res.status === 200 && res.data.message) {
        Swal.fire({
          icon: "success",
          title: res.data.message,
          showConfirmButton: false,
          timer: 1500
        });

        setFirstName("");
        setLastName("");
        setEmail("");
        setPhoneNumber("");
        setProfileImage("");
        setRole("");

        handleClose();
      }
    } catch (error) {
      if (error && error.response.status === 422) {
        handleError(error.response.data.message);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Quelque chose s'est mal passé !",
        });
      }
    }
  };

  const handleSendEmail = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const res = await axios.post("/forgot-password", { email });
      console.log(res);

      // let timerInterval;
      Swal.fire({
        title: "E-mail est en cours d'envoit !",
        html: "E-mail sera envoyé dans quelques <b></b> milliseconds.",
        timer: 2000,
        timerProgressBar: true,
        // didOpen: () => {
        //   Swal.showLoading();
        //   const timer = Swal.getPopup().querySelector("b");
        //   timerInterval = setInterval(() => {
        //     timer.textContent = `${Swal.getTimerLeft()}`;
        //   }, 100);
        // },
        // willClose: () => {
        //   clearInterval(timerInterval);
        // },
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          console.log("I was closed by the timer");
        }
      });

      if (res && res.data.status) {
        Swal.fire({
          title: "Bravo !",
          text: "Vérifier votre boite d'e-mail !",
          imageUrl: "/images/auth/emailImg.jpg",
          imageWidth: 400,
          imageHeight: 200,
          imageAlt: "E-mail icon",
        });
        setEmail("");
        handleClose();
      }
    } catch (error) {
      if (error && error.response.status === 422) {
        handleError(error.response.data.message);
      }
    }
  };

  return typeModal === "ForgotPassword" ? (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Formulaire pour réinitialiser votre mot de passe
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleSendEmail}
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
                placeholder="Saisir l'adresse votre e-mail"
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
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Envoyer
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  ) : (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Formulaire d'ajout d'un nouveau administareur
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddUser}
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
                placeholder="Saisir le prénom de l'admin"
                required
                minLength={3}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le prénom de l'admin qui doit avoir minimum 3
                caractères !
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
                placeholder="Saisir le nom de famille de l'admin"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                minLength={3}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nom de l'admin qui doit avoir minimum 3
                caractères !
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
                placeholder="Saisir l'adresse e-mail de l'admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir l'adresse e-mail de l'admin dans un format
                adéquat !
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
                placeholder="Saisir le numéro de téléphone de l'admin"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                minLength={8}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le Numéro de Téléphone de l'admin qui doit
                comporter au moins 8 caractères !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-account-key text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option disabled>Selectionner le role de l'admin</option>
                <option value="PiloteDuProcessus">Pilote du Processus</option>
                <option value="Sales">Sales</option>
                <option value="ChargéFormation">Chargé de la Formation</option>
                <option value="AssistanceAcceuil">Assistance d'Acceuil</option>
                <option value="CommunityManager">Community Manager</option>
                <option value="ServiceFinancier">Service Financier</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez selectionner le role de l'admin !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                style={{ height: "150%" }}
                type="file"
                accept="image/*"
                placeholder="Selectionner l'image de l'admin"
                onChange={(e) => setProfileImage(e.target.files[0])}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez selectionner l'image de l'admin !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Ajouter
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
