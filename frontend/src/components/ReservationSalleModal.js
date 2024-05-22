import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import { fetchAllSalles } from "../services/SalleServices";
import { Form, InputGroup, FormControl } from "react-bootstrap";

function ReservationSalleModal({ show, onHide, session }) {
  const [rooms, setRooms] = useState([]);
  const [daySessions, setDaySessions] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedDaySessionId, setSelectedDaySessionId] = useState(null);

  useEffect(() => {
    if (show) {
      fetchAllSalles().then(setRooms);
      // fetchSessionDays(session.id).then(setDaySessions);
    }
  }, [show, session.id]);

  const reserveRoom = async () => {
    if (!selectedRoomId || !selectedDaySessionId) {
      alert("Veuillez sélectionner une salle et un jour.");
      return;
    }

    const response = await fetch(`/api/sessions/${session.id}/reserve-room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: JSON.stringify({
        salle_id: selectedRoomId,
        jourSessionId: selectedDaySessionId,
      }),
    });

    if (response.ok) {
      alert("La salle a été réservée avec succès!");
      onHide();
    } else {
      const data = await response.json();
      alert("Erreur lors de la réservation: " + data.error);
    }
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Réserver une salle pour la session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <InputGroup className="mb-3">
            <FormControl
              as="select"
              onChange={(e) => setSelectedDaySessionId(e.target.value)}
            >
              <option>Choisir un jour</option>
              {daySessions.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.day}
                </option>
              ))}
            </FormControl>
          </InputGroup>
          <InputGroup>
            <FormControl
              as="select"
              onChange={(e) => setSelectedRoomId(e.target.value)}
            >
              <option>Choisir une salle</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </FormControl>
          </InputGroup>
          <Button onClick={reserveRoom}>Réserver</Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default ReservationSalleModal;
