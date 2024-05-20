import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { fetchAllSessions } from "../services/SessionServices";

const ParticipateSessionModal = ({ show, handleClose }) => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");

  useEffect(() => {
    const fetchSessions = async () => {
      const response = await fetchAllSessions();
      setSessions(response.filter((session) => session.status === "Ouverte"));
    };

    fetchSessions();
  }, []);

  const handleSessionChange = (event) => {
    setSelectedSession(event.target.value); //participate-session/{participantId}/{sessionId}
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Assigner ce participant à une session</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group controlId="sessionSelect">
            <Form.Label>Select Session</Form.Label>
            <Form.Select value={selectedSession} onChange={handleSessionChange}>
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
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
        <Button
          variant="primary"
          onClick={() => console.log("Selected Session:", selectedSession)}
        >
          Confirmer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ParticipateSessionModal;
