import { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { BsCalendar } from "react-icons/bs";
import axios from "../services/axios";
import {
  fetchAllSessions,
  fetchSessionDays,
} from "../services/SessionServices";
import "./presenceTable.css";
import {
  fetchParticipantById,
  fetchParticipantsSessionId,
  fetchPresenceSessionId,
} from "../services/ParticipantServices";
import Swal from "sweetalert2";

const MarkPresenceModal = ({ show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const formRef = useRef();
  const [days, setDays] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [presences, setPresences] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllSessions();
        setSessions(response);
      } catch (error) {
        console.error("Error fetching Sessions:", error);
      }
    };

    fetchData();
  }, [show]);

  if (!show) return null;

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleSubmit = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      setValidated(true);

      const res = await fetchSessionDays(selectedSession);
      const par = await fetchParticipantsSessionId(selectedSession);
      const presence = await fetchPresenceSessionId(selectedSession);

      if (res) {
        setDays(res);
        setParticipants([]);
        setPresences([]);
      }

      if (par) {
        par.forEach((element) => {
          fetchParticipantById(element.pivot.participant_id).then((p) => {
            const updatedParticipant = {
              ...p,
              presence_status: "Absent", // Initialize default status
            };
            setParticipants((prev) => [...prev, updatedParticipant]);
          });
        });
      }

      if (presence) {
        setPresences(presence);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePresenceChange = async (participantId, dayId, isChecked) => {
    const newStatus = isChecked ? "Present" : "Absent";

    setParticipants((prev) =>
      prev.map((p) =>
        p.id === participantId ? { ...p, presence_status: newStatus } : p
      )
    );

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("presenceStatus", newStatus);

    try {
      if (!localStorage.getItem("token")) {
        const res = await axios.post(
          `/api/update-presence/${participantId}/${dayId}/${selectedSession}`,
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
            title: "Statut de présence est modifiée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          fetchPresenceSessionId(selectedSession).then((presence) =>
            setPresences(presence)
          );
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
          `/api/update-presence/${participantId}/${dayId}/${selectedSession}`,
          formData,
          {
            headers: headers,
          }
        );

        if (response.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Statut de présence est modifiée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          fetchPresenceSessionId(selectedSession).then((presence) =>
            setPresences(presence)
          );
        }
      }
    } catch (error) {
      console.error("Error updating presence status", error);
    }
  };

  return (
    <Modal
      show={show}
      fullscreen="lg-down"
      size="lg"
      onHide={handleClose}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Marquer la présence d'une session
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`d-flex flex-column justify-content-between`}>
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-2"
          onSubmit={handleSubmit}
        >
          <Form.Group className="mb-3">
            <Form.Label>Séléction une session</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <BsCalendar
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
                <option value="">Séléctionner une session</option>
                {sessions.map((session) => (
                  <option value={session.id}>
                    {session.title} - {session.reference}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez séléctionner le title de la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="mt-2 mb-2 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Afficher
            </Button>
          </div>
        </Form>
        <div className="card shadow-lg p-3 mb-5 bg-white roundedr">
          <table className="table-responsive table-hover">
            <thead>
              <tr>
                <th className="name-col">Nom et prénom du participant</th>
                {days.length > 0 &&
                  days.map((d, i) => <th key={i}>{d.day}</th>)}
              </tr>
            </thead>
            <tbody>
              {participants.length > 0 &&
                participants.map((p, i) => (
                  <tr key={i} className="student text-center">
                    <td className="name-col">
                      {p.firstName} {p.lastName}
                    </td>
                    {days.length > 0 &&
                      days.map((d) => (
                        <td key={d.id} className="attend-col">
                          <input
                            type="checkbox"
                            checked={presences.some(
                              (presence) =>
                                presence.participant_id === p.id &&
                                presence.jourSession_id === d.id &&
                                presence.presence_status === "Present"
                            )}
                            onChange={(e) =>
                              handlePresenceChange(p.id, d.id, e.target.checked)
                            }
                          />
                        </td>
                      ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button className="btn-inverse-primary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MarkPresenceModal;
