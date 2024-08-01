import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState, useEffect, useRef } from "react";
import { fetchAllSalles } from "../services/SalleServices";
import { Alert, Form } from "react-bootstrap";
import {
  availableRooms,
  checkBookedRoom,
  fetchSessionDays,
  reserveRoomForDay,
} from "../services/SessionServices";
import { MdAddHomeWork } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../services/axios";
import Swal from "sweetalert2";

function ReservationSalleModal({ show, onHide, session }) {
  const [rooms, setRooms] = useState([]);
  const [daySessions, setDaySessions] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedDaySessionId, setSelectedDaySessionId] = useState(null);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [messageAlert, setMessageAlert] = useState(null);
  const [salleBooked, setSalleBooked] = useState(null);
  const [available, setAvailable] = useState([]);

  useEffect(() => {
    if (show) {
      fetchAllSalles().then(setRooms);
      fetchSessionDays(session.id).then(setDaySessions);
    }
  }, [show, session.id]);

  useEffect(() => {
    if (selectedDaySessionId) {
      checkBookedRoom(session.id, selectedDaySessionId).then((r) => {
        if (r?.salleBooked?.id) {
          setMessageAlert(r.message);
          setSalleBooked(r.salleBooked);
        } else {
          setMessageAlert(r.message);
          setSalleBooked("");
        }
      });

      availableRooms(session.id, selectedDaySessionId).then((rooms) => {
        setAvailable(rooms);
      });
    }
  }, [selectedDaySessionId]);

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

  const reserveRoom = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      if (!selectedRoomId || !selectedDaySessionId) {
        handleError("Veuillez sélectionner une salle et un jour !");
        return;
      }

      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("salle_id", selectedRoomId);
      formData.append("jourSessionId", selectedDaySessionId);

      const response = await reserveRoomForDay(session.id, formData);

      if (response) {
        handleSuccess("La salle a été réservée avec succès !");
        Swal.fire({
          icon: "success",
          title: "La salle a été réservée avec succès !",
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
      <Modal show={show} onHide={onHide} centered>
        <ToastContainer />
        <Modal.Header closeButton>
          <Modal.Title>
            Réserver une salle pour la session : {session.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            className="d-flex justify-content-between mb-2"
            ref={formRef}
            noValidate
            validated={validated}
            onSubmit={reserveRoom}
          >
            <Form.Group>
              <Form.Select
                as="select"
                onChange={(e) => setSelectedDaySessionId(e.target.value)}
                required
              >
                <option value="">Choisir un jour</option>
                {daySessions.map((day) => (
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
            <Form.Group>
              <Form.Select
                as="select"
                onChange={(e) => setSelectedRoomId(e.target.value)}
                required
              >
                <option value="">Choisir une salle</option>
                {rooms.length > 0 &&
                  available.length > 0 &&
                  available.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez Séléctionner une salle !
              </Form.Control.Feedback>
            </Form.Group>
            <Button onClick={reserveRoom} className="btn-sm btn-icon mx-3">
              <MdAddHomeWork size={18} />
            </Button>
          </Form>
          {messageAlert && (
            <Alert variant="danger" className="mt-4">
              {messageAlert} <br />
              <b>{salleBooked?.name}</b>
            </Alert>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ReservationSalleModal;
