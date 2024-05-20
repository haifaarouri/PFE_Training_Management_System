import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { FaBookOpen, FaBookReader, FaCalendarCheck } from "react-icons/fa";
import { fetchAllFormations } from "../services/FormationServices";
import { GiInspiration, GiPayMoney } from "react-icons/gi";
import "react-toastify/dist/ReactToastify.css";

const CandidatFormationModal = ({ candidatId, show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [formations, setFormations] = useState([]);
  const [selectedFormation, setSelectedFormation] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const [registerDate, setRegisterDate] = useState("");
  const [motivation, setMotivation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const fetchFormations = async () => {
      try {
        const response = await fetchAllFormations();
        setFormations(response);
      } catch (error) {
        console.error("Failed to fetch formations", error);
      }
    };

    if (show) {
      fetchFormations();
    }
  }, [show]);

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
      formData.append("selectedFormation", selectedFormation);
      formData.append("registerStatus", registerStatus);
      formData.append("registerDate", registerDate);
      formData.append("motivation", motivation);
      formData.append("paymentMethod", paymentMethod);

      if (!localStorage.getItem("token")) {
        const res = await axios.post(
          `/api/candidats/${candidatId}/formations/${selectedFormation}`,
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
            title: "Candidat inscrit à une formation avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setRegisterStatus("");
          setRegisterDate("");
          setMotivation("");
          setPaymentMethod("");

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
          `/api/candidats/${candidatId}/formations/${selectedFormation}`,
          formData,
          {
            headers: headers,
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Candidat inscrit à une formation avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setRegisterStatus("");
          setRegisterDate("");
          setMotivation("");
          setPaymentMethod("");

          handleClose();
        }
      }
    } catch (error) {
      if (error) {
        // if (error.response.data.error) {
        //   Object.values(error.response.data.error).forEach((element) => {
        //     handleError(element[0]);
        //   });
        // }
        handleError(error.response.data.error);
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
            Formulaire pour inscrire un Candidat à une formation
          </h5>
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
          <Form.Group className="mb-3">
            <Form.Label>Date d'inscription</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaCalendarCheck
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="registerDate"
                type="date"
                placeholder="Saisir la date d'inscription"
                value={registerDate}
                onChange={(e) => setRegisterDate(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la date d'inscription !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
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
          <Form.Group className="mb-3">
            <Form.Label>Formation</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaBookOpen
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="selectedFormation"
                value={selectedFormation}
                onChange={(e) => setSelectedFormation(e.target.value)}
                required
              >
                <option value="">Séléctionner la formation</option>
                {formations.length > 0 &&
                  formations.map((f) => (
                    <option value={f.id}>
                      {f.reference} - {f.entitled}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez séléctionner une formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Motivation</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <GiInspiration
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="motivation"
                type="text"
                placeholder="Saisir la Motivation"
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le Motivation du candidat !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Méthode de paiement</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <GiPayMoney
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="payementMethod"
                type="text"
                placeholder="Saisir la méthode de paiement"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le Méthode de paiement !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Inscrire
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

export default CandidatFormationModal;
