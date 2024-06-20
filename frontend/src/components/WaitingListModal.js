import { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { BsCalendar } from "react-icons/bs";
import axios from "../services/axios";
import {
  fetchAllSessions,
  fetchWaitingListBySessionId,
} from "../services/SessionServices";

const WaitingListModal = ({ show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const formRef = useRef();
  const [waitingList, setWaitingList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllSessions();
        setSessions(response);
      } catch (error) {
        console.error("Error fetching Sessions:", error);
      }
    };

    show && fetchData();
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

      const res = await fetchWaitingListBySessionId(selectedSession);

      if (res) {
        setWaitingList(res);
      }
    } catch (error) {
      console.log(error);
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
          Afficher la liste d'attente d'une session
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`d-flex flex-column justify-content-between`}>
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
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
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Afficher
            </Button>
          </div>
        </Form>
        {waitingList.length > 0 && (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>E-mail</th>
                  <th>Numéro de téléphone</th>
                  <th>Adresse</th>
                  <th>Type</th>
                  <th>Entreprise</th>
                </tr>
              </thead>
              <tbody>
                {waitingList.map((f, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        <h6>{f.lastName}</h6>
                      </td>
                      <td>
                        <h6>{f.firstName}</h6>
                      </td>
                      <td>{f.email}</td>
                      <td>{f.phoneNumber}</td>
                      <td>{f.address}</td>
                      <td>{f.type}</td>
                      <td>{f.companyName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button className="btn-inverse-primary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WaitingListModal;
