import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { fetchAllSessions } from "../services/SessionServices";

const SessionImageModal = ({ show, handleClose }) => {
  const [session_id, setSessionId] = useState("");
  const [path, setPath] = useState("");
  const [type, setType] = useState("");
  const [sessions, setSessions] = useState([]);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    fetchAllSessions().then(setSessions);
  }, []);

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

  const handleAddImageSession = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("path", path);
      formData.append("type", type);
      formData.append("session_id", session_id);

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/add-image-sessions", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Image de session ajoutée avec succès !",
              showConfirmButton: false,
              timer: 1500,
            });

            setPath("");
            setType("");
            setSessionId("");

            handleClose();
          }
        } else {
          const headers = {
            "Content-Type": "multipart/form-data",
          };

          const token = localStorage.getItem("token");
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          const response = await axios.post(
            "/api/add-image-sessions",
            formData,
            {
              headers: headers,
            }
          );

          if (response.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Image de session ajoutée avec succès !",
              showConfirmButton: false,
              timer: 1500,
            });

            setPath("");
            setType("");
            setSessionId("");

            handleClose();
          }
        }
      } catch (error) {
        console.log("Error adding a new user :", error);
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

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg"
      fullscreen="lg-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Formulaire pour ajouter une nouvelle image d'une session
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddImageSession}
        >
          <Form.Group className="mb-3">
            <Form.Label>Type d'image</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-home-variant text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option value="">Sélectionner le type de l'image</option>
                <option value="Picture">Photo</option>
                <option value="ScreenShot">Capture d'écran</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez Sélectionner le type de l'image !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Session</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-shape-plus text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="session_id"
                value={session_id}
                onChange={(e) => setSessionId(e.target.value)}
                required
              >
                <option>Selectionner la session</option>
                {sessions.length > 0 &&
                  sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} - {s.reference}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                name="path"
                type="file"
                accept="image/*"
                placeholder="Sélectionner l'image"
                onChange={(e) => setPath(e.target.files[0])}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner l'image de la salle !
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

export default SessionImageModal;
