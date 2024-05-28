import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import {
  availableTrainers,
  fetchSessionDays,
  reserveTrainerForDay,
} from "../services/SessionServices";
import {
  fetchAllFormateurs,
  fetchFormateursBySpeciality,
} from "../services/FormateurServices";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import axios from "../services/axios";
import { GiTeacher } from "react-icons/gi";

function ReservationTrainersModal({ show, onHide, session }) {
  const [formateurs, setFormateurs] = useState([]);
  const [selectedFormateurId, setSelectedFormateurId] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");
  const [daySessions, setDaySessions] = useState([]);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [available, setAvailable] = useState([]);
  const [sepeciality, setSepeciality] = useState("");

  useEffect(() => {
    if (show) {
      fetchAllFormateurs().then(setFormateurs);
      fetchSessionDays(session.id).then(setDaySessions);
    }
  }, [show, session.id]);

  useEffect(() => {
    if (show && selectedDayId) {
      availableTrainers(session.id, selectedDayId).then((trainers) => {
        setAvailable(trainers);
      });
    }
  }, [selectedDayId]);

  const searchBySpeciality = (e) => {
    e.preventDefault();
    if (show && sepeciality) {
      fetchFormateursBySpeciality(sepeciality).then((trainers) => {
        console.log(trainers);
      });
    }
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

  const handleReserve = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      if (!selectedFormateurId || !selectedDayId) {
        handleError("Veuillez sélectionner un formateur et un jour");
        return;
      }

      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("formateurId", selectedFormateurId);
      formData.append("dayId", selectedDayId);

      const response = await reserveTrainerForDay(session.id, formData);

      if (response) {
        handleSuccess("Le formateur a été réservé avec succès !");
        Swal.fire({
          icon: "success",
          title: "Le formateur a été réservé avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        onHide();
      }
    } catch (error) {
      if (error) {
        if (error.response.data.error) {
          Object.values(error.response.data.error).forEach((element) => {
            handleError(element[0]);
          });
        }
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
    <>
      {show && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: "999",
          }}
        ></div>
      )}
      <ToastContainer />
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Reserve a Formateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            className="d-flex justify-content-between mb-2 p-2"
            ref={formRef}
            noValidate
            validated={validated}
            onSubmit={handleReserve}
          >
            <Form.Group className="align-self-center">
              <Form.Label>Choisir un jour</Form.Label>
              <Form.Select
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
                required
              >
                <option value="">Choisir un jour</option>
                {daySessions.length > 0 &&
                  daySessions.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.day}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez Séléctionner un jour de la session !
              </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex flex-column">
              {/* <Form.Group>
                <Form.Label>Filter par spécialité</Form.Label>
                <Form.Control
                  value={sepeciality}
                  onChange={(e) => setSepeciality(e.target.value)}
                  placeholder="Saisir une spécialité"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxSizing: "border-box",
                  }}
                />
              </Form.Group> */}
              <Form className="mb-3">
                <div className="inner-form">
                  <div className="input-field second-wrap">
                    <Form.Group>
                      <InputGroup>
                        <Form.Control
                          type="text"
                          placeholder="Filter par spécialité"
                          value={sepeciality}
                          onChange={(e) => setSepeciality(e.target.value)}
                          required
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>
                  <div className="input-field third-wrap">
                    <button
                      className="btn-search"
                      type="button"
                      onClick={searchBySpeciality}
                    >
                      <svg
                        className="svg-inline--fa fa-search fa-w-16"
                        aria-hidden="true"
                        data-prefix="fas"
                        data-icon="search"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                      >
                        <path
                          fill="currentColor"
                          d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </Form>
              <Form.Group>
                <Form.Label>Choisir un formateur</Form.Label>
                <Form.Select
                  value={selectedFormateurId}
                  onChange={(e) => setSelectedFormateurId(e.target.value)}
                  required
                >
                  <option value="">Choisir un formateur</option>
                  {formateurs.length > 0 &&
                    formateurs.map((formateur) => (
                      <option key={formateur.id} value={formateur.id}>
                        {available.length > 0 &&
                          (available.find((a) => a.id === formateur.id)
                            ? `${formateur.firstName} ${" "}
                            ${formateur.lastName} ${" "}
                            (disponible)`
                            : `${formateur.firstName} ${" "}
                          ${formateur.lastName} ${" "}
                          (non disponible)`)}
                      </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  Veuillez Séléctionner un formateur !
                </Form.Control.Feedback>
              </Form.Group>
            </div>
            <Button
              className="btn-sm btn-icon mx-3 align-self-center"
              type="submit"
            >
              <GiTeacher size={25} />
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ReservationTrainersModal;
