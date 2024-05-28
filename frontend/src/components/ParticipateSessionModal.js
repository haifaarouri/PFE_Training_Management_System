import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, InputGroup, Alert } from "react-bootstrap";
import { fetchAllSessions } from "../services/SessionServices";
import Swal from "sweetalert2";
import axios from "../services/axios";
import { ToastContainer, toast } from "react-toastify";
import { BsCalendarRange } from "react-icons/bs";
import "react-toastify/dist/ReactToastify.css";

const ParticipateSessionModal = ({ show, handleClose, participantId }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetchAllSessions();
      setSessions(response.filter((session) => session.status === "Ouverte"));
    };

    fetchSessions();
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

  const handleAssignSessionToParticipant = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      if (!localStorage.getItem("token")) {
        const res = await axios.get(
          `/api/participate-session/${participantId}/${selectedSession}`,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Participant assigné à une session avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setSelectedSession("");

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

        const response = await axios.get(
          `/api/participate-session/${participantId}/${selectedSession}`,
          {
            headers: headers,
          }
        );
        console.log(response);
        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Participant assigné à une session avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setSelectedSession("");

          handleClose();
        }
      }
    } catch (error) {
      if (error) {
        handleError(error.response.data.error);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Quelque chose s'est mal passé !",
        });
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assigner ce participant à une session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ToastContainer />
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAssignSessionToParticipant}
        >
          <Form.Group controlId="sessionSelect" className="mb-3">
            <Form.Label>
              Séléctionner une Sessions pour ce Participant
            </Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <BsCalendarRange
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
              >
                <option value="">Sélectionner une session</option>
                {sessions.length > 0 &&
                  sessions.map((session) => (
                    <optgroup
                      key={session.id}
                      label={`Formation: ${session.reference}`}
                    >
                      <option value={session.id}>{session.title}</option>
                    </optgroup>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez Séléctionner une session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          {sessions.length === 0 && (
            <Alert variant="danger">
              Il n'y a pas encore de session ouverte pour la formation à
              laquelle ce candidat est inscrit!
            </Alert>
          )}
          <div className="mt-5 d-flex justify-content-center">
            <Button
              variant="primary"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
              type="submit"
            >
              Confirmer
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ParticipateSessionModal;
