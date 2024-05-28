import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { FaBookReader } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const EditStatusModal = ({
  candidatId,
  formationId,
  show,
  handleClose,
  statusType,
  sessionId,
  participantId,
}) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [registerStatus, setRegisterStatus] = useState("");

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

  const handleRegisterCandidatToFormation = async (event) => {
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
      formData.append("_method", "PUT");
      formData.append("registerStatus", registerStatus);

      if (!localStorage.getItem("token")) {
        const res = await axios.post(
          `${
            statusType === "InscriptionStatus"
              ? `/api/update-register-status/${candidatId}/${formationId}`
              : statusType === "ParticipationStatus" &&
                `/api/update-session-status/${participantId}/${sessionId}`
          }`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Statut d'inscription est modifiée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setRegisterStatus("");

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
          `${
            statusType === "InscriptionStatus"
              ? `/api/update-register-status/${candidatId}/${formationId}`
              : statusType === "ParticipationStatus" &&
                `/api/update-session-status/${participantId}/${sessionId}`
          }`,
          formData,
          {
            headers: headers,
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Statut d'inscription est modifiée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setRegisterStatus("");
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
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg"
      fullscreen="lg-down"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {statusType === "InscriptionStatus" ? (
            <h5 className="modal-title">
              Formulaire pour modifier le status d'inscription du Candidat ID :{" "}
              {candidatId} à la Formation ID : {formationId}
            </h5>
          ) : (
            statusType === "ParticipationStatus" && (
              <h5 className="modal-title">
                Formulaire pour modifier le status de participation du
                Participant ID : {participantId} à la Session ID : {sessionId}
              </h5>
            )
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleRegisterCandidatToFormation}
        >
          {statusType === "InscriptionStatus" ? (
            <Form.Group className="mb-3">
              <Form.Label>Statut d'inscription</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-default">
                  <div className="input-group-prepend bg-transparent">
                    <span className="input-group-text bg-transparent border-right-0">
                      <FaBookReader
                        className="text-primary"
                        style={{ fontSize: "1.5em" }}
                      />
                    </span>
                  </div>
                </InputGroup.Text>
                <Form.Select
                  name="registerStatus"
                  value={registerStatus}
                  onChange={(e) => setRegisterStatus(e.target.value)}
                  required
                >
                  <option value="">Séléctionner le statut d'inscription</option>
                  <option value="EnAttente">EnAttente</option>
                  <option value="Confirmé">Confirmé</option>
                  <option value="Annulé">Annulé</option>
                </Form.Select>
                <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  Veuillez saisir le statut d'inscription !
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
          ) : (
            statusType === "ParticipationStatus" && (
              <Form.Group className="mb-3">
                <Form.Label>Statut de participation</Form.Label>
                <InputGroup className="mb-3">
                  <InputGroup.Text id="inputGroup-sizing-default">
                    <div className="input-group-prepend bg-transparent">
                      <span className="input-group-text bg-transparent border-right-0">
                        <FaBookReader
                          className="text-primary"
                          style={{ fontSize: "1.5em" }}
                        />
                      </span>
                    </div>
                  </InputGroup.Text>
                  <Form.Select
                    name="registerStatus"
                    value={registerStatus}
                    onChange={(e) => setRegisterStatus(e.target.value)}
                    required
                  >
                    <option value="">
                      Séléctionner le statut de participation
                    </option>
                    <option value="EnAttente">EnAttente</option>
                    <option value="Absent">Absent</option>
                    <option value="Présent">Présent</option>
                  </Form.Select>
                  <Form.Control.Feedback>
                    Cela semble bon !
                  </Form.Control.Feedback>
                  <Form.Control.Feedback type="invalid">
                    Veuillez saisir le statut de participation !
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            )
          )}
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Mettre à jour
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditStatusModal;
