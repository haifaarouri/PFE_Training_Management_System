import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, InputGroup, Alert } from "react-bootstrap";
import {
  availableTrainers,
  fetchSessionDays,
  reserveTrainerForDay,
} from "../services/SessionServices";
import { fetchAllFormateurs } from "../services/FormateurServices";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import axios from "../services/axios";
import { GiTeacher } from "react-icons/gi";
import Spinner from "./Spinner";

function ReservationTrainersModal({ show, onHide, session }) {
  const [formateurs, setFormateurs] = useState([]);
  const [selectedFormateurId, setSelectedFormateurId] = useState("");
  const [selectedDayId, setSelectedDayId] = useState("");
  const [daySessions, setDaySessions] = useState([]);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [available, setAvailable] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne" && columnName !== "experience") {
      const newFilter =
        formateurs.length > 0 &&
        formateurs.filter((formateur) =>
          formateur[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else if (columnName === "experience") {
      const newFilter =
        formateurs.length > 0 &&
        formateurs.filter((formateur) => formateur[columnName] >= searchWord);
      setFilteredData(newFilter);
    } else {
      if (Number.isInteger(Number(event.target.value))) {
        const newFilter =
          formateurs.length > 0 &&
          formateurs.filter((formateur) => formateur.experience >= wordEntered);
        setFilteredData(newFilter);
      } else {
        const newFilter =
          formateurs.length > 0 &&
          formateurs.filter((formateur) => {
            const formateurFields = Object.values(formateur)
              .join(" ")
              .toLowerCase();
            return formateurFields.includes(searchWord);
          });
        setFilteredData(newFilter);
      }
    }
  };

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
  }, [selectedDayId, session.id, show]);

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

    setLoading(true);
    await csrf();

    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, assigner ce formateur!",
    }).then(async (result) => {
      if (result.isConfirmed) {
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
            Swal.fire({
              title:
                "La réservation du formateur pour ce jour de la session est en cours...",
              html: "Vérification de la disponibilité du formateur et de ses spécialités si elles correspondent aux spécifications du cours à l’aide d’un modèle d’apprentissage automatique !",
              timer: 5000,
              timerProgressBar: true,
            }).then((result) => {
              if (result.dismiss === Swal.DismissReason.timer) {
                console.log("I was closed by the timer");
              }
            });

            setLoading(false);

            handleSuccess("Le formateur a été réservé avec succès !");
            Swal.fire({
              icon: "success",
              title: "Le formateur a été réservé avec succès !",
              showConfirmButton: false,
              timer: 2000,
            });
            onHide();
          } else {
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          // if (error) {
          //   if (error.response.data.error) {
          //     Object.values(error.response.data.error).forEach((element) => {
          //       handleError(element[0]);
          //     });
          //   }
          //   handleError(error.response.data.message);
          //   handleError(error.response.data.error);
          //   Swal.fire({
          //     icon: "error",
          //     title: "Oops...",
          //     text: "Quelque chose s'est mal passé !",
          //   });
          // }
        }
      }
    });
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
          <Modal.Title>Réserver un Formateur</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? <Spinner /> : null}
          <div className="d-flex justify-content-center my-3">
            <Form style={{ width: "70%" }}>
              <div className="inner-form">
                <div className="input-select">
                  <Form.Group>
                    <InputGroup>
                      <Form.Select
                        style={{ border: "none" }}
                        value={columnName}
                        onChange={(e) => setColumnName(e.target.value)}
                        required
                      >
                        <option value="">Colonne</option>
                        <option value="type">Type du formateur</option>
                        <option value="speciality">
                          Spécialité du formateur
                        </option>
                        <option value="experience">
                          Nombre d'année d'expérience
                        </option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                </div>
                <div className="input-field second-wrap">
                  <Form.Group>
                    <InputGroup>
                      <Form.Control
                        id="search"
                        type="text"
                        placeholder="Recherchez des formateurs ..."
                        size="lg"
                        name=""
                        value={wordEntered}
                        onChange={handleFilter}
                        required
                      />
                    </InputGroup>
                  </Form.Group>
                </div>
                <div className="input-field third-wrap">
                  <button className="btn-search" type="button">
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
          </div>
          <Form
            className="d-flex justify-content-between mb-2 p-2 row"
            ref={formRef}
            noValidate
            validated={validated}
            onSubmit={handleReserve}
          >
            <Form.Group className="col-md-6">
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
            <Form.Group className="col-md-6">
              <Form.Label>Choisir un formateur</Form.Label>
              <Form.Select
                value={selectedFormateurId}
                onChange={(e) => setSelectedFormateurId(e.target.value)}
                required
              >
                <option value="">Choisir un formateur</option>
                {formateurs.length > 0 &&
                  filteredData.length === 0 &&
                  available.length > 0 &&
                  available.map((formateur) => (
                    <option key={formateur.id} value={formateur.id}>
                      {formateur.firstName} {formateur.lastName}
                    </option>
                  ))}
                {formateurs.length > 0 &&
                  available.length > 0 &&
                  filteredData.length > 0 &&
                  filteredData.map((fil) => {
                    const isAvailable = available.some((a) => a.id === fil.id);
                    return isAvailable ? (
                      <option key={fil.id} value={fil.id}>
                        {fil.firstName} {fil.lastName}
                      </option>
                    ) : null;
                  })}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez Séléctionner un formateur !
              </Form.Control.Feedback>
            </Form.Group>
            {selectedDayId && columnName && available.length === 0 && (
              <div className="d-flex justify-content-center mt-4">
                <Alert variant="danger" style={{ width: "50%" }}>
                  Pas de formateurs disponibles pour cette date !
                </Alert>
              </div>
            )}
            <div className="d-flex justify-content-center mt-5">
              <Button type="submit">
                Réserver
                <GiTeacher size={25} />
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ReservationTrainersModal;
