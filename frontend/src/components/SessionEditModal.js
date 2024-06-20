import { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { BsCalendar2PlusFill } from "react-icons/bs";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import { FaBook, FaCalendarDay, FaPlusCircle } from "react-icons/fa";
import { IoLocation } from "react-icons/io5";
import { BiCalendarCheck, BiSolidCalendarCheck } from "react-icons/bi";
import { GiTeacher } from "react-icons/gi";
import "react-toastify/dist/ReactToastify.css";
import { fetchAllFormations } from "../services/FormationServices";
import {
  editSession,
  fetchSessionById,
  fetchSessionDays,
} from "../services/SessionServices";
import { PiStudentFill } from "react-icons/pi";
import { MdDeleteForever } from "react-icons/md";
import { LuCalendarClock } from "react-icons/lu";

const SessionEditModal = ({ onOpen, onClose, session }) => {
  const [sessionDB, setSessionDB] = useState({
    id: "",
    title: "",
    startDate: "",
    endDate: "",
    duration: "",
    sessionMode: "",
    reference: "",
    location: "",
    status: "",
    formation_id: "",
    max_participants: "",
    min_participants: "",
    registration_start: "",
    registration_end: "",
  });
  const [validated, setValidated] = useState(false);
  const [formations, setFormations] = useState([]);
  const nowISO = new Date().toISOString().slice(0, 16);
  const formRef = useRef();
  const [jours, setJours] = useState([]);

  const handleAddJour = () => {
    setJours([...jours, { day: "", startTime: "", endTime: "" }]);
  };

  const handleJourChange = (index, field, value) => {
    const newJours = [...jours];
    newJours[index][field] = value;
    setJours(newJours);
  };

  const removeJour = (index) => {
    if (index !== 0) {
      const newJour = [...jours];
      newJour.splice(index, 1);
      setJours(newJour);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllFormations();
        setFormations(response);
      } catch (error) {
        console.error("Error fetching formations:", error);
      }
    };

    const fetchSession = async () => {
      if (session && session.id) {
        try {
          const response = await fetchSessionById(session.id);
          setSessionDB(response);
        } catch (error) {
          console.error("Error fetching session:", error);
        }
      }
    };

    const fetchDays = async () => {
      if (session && session.id) {
        try {
          const response = await fetchSessionDays(session.id);
          setJours(response);
        } catch (error) {
          console.error("Error fetching days:", error);
        }
      }
    };

    fetchData();
    fetchSession();
    fetchDays();
  }, [session, onOpen]);

  if (!session || !onOpen) return null;

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

  const toUTCDate = (date) => {
    const localDate = new Date(date);
    return new Date(
      Date.UTC(
        localDate.getFullYear(),
        localDate.getMonth(),
        localDate.getDate(),
        localDate.getHours(),
        localDate.getMinutes()
      )
    );
  };

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

      const formattedStartDate = toUTCDate(sessionDB.startDate)
        .toISOString()
        .slice(0, 16);
      const formattedEndDate = toUTCDate(sessionDB.endDate)
        .toISOString()
        .slice(0, 16);

      const formattedRegistrationStart = toUTCDate(sessionDB.registration_start)
        .toISOString()
        .slice(0, 16);
      const formattedRegistrationEnd = toUTCDate(sessionDB.registration_end)
        .toISOString()
        .slice(0, 16);

      // Validate each jour day is within the session start and end dates
      const sessionStart = new Date(sessionDB.startDate).setHours(0, 0, 0, 0);
      const sessionEnd = new Date(sessionDB.endDate).setHours(23, 59, 59, 999);
      for (let jour of jours) {
        const jourDate = new Date(jour.day).setHours(0, 0, 0, 0);
        if (jourDate < sessionStart || jourDate > sessionEnd) {
          Swal.fire({
            icon: "error",
            text: "Chaque jour de la session doit se situer entre les dates de début et de fin de la session !",
          });
          return;
        }
      }

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", sessionDB.title);
      formData.append("startDate", formattedStartDate);
      formData.append("endDate", formattedEndDate);
      formData.append("duration", sessionDB.duration);
      formData.append("reference", sessionDB.reference);
      formData.append("location", sessionDB.location);
      formData.append("status", sessionDB.status);
      formData.append("sessionMode", sessionDB.sessionMode);
      formData.append("max_participants", sessionDB.max_participants);
      formData.append("min_participants", sessionDB.min_participants);
      formData.append("registration_start", formattedRegistrationStart);
      formData.append("registration_end", formattedRegistrationEnd);
      // Append each jour object in the jours array
      jours.forEach((jour, index) => {
        // Ensure time is in HH:mm format
        const formattedStartTime = new Date(
          "1970-01-01T" + jour.startTime
        ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
        const formattedEndTime = new Date(
          "1970-01-01T" + jour.endTime
        ).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

        formData.append(`jours[${index}][day]`, jour.day);
        formData.append(`jours[${index}][startTime]`, formattedStartTime);
        formData.append(`jours[${index}][endTime]`, formattedEndTime);
      });

      const res = await editSession(sessionDB.id, formData);

      if (res) {
        Swal.fire({
          icon: "success",
          title: "Session modifiée avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        setSessionDB({
          id: "",
          title: "",
          startDate: "",
          endDate: "",
          duration: "",
          sessionMode: "",
          reference: "",
          location: "",
          status: "",
          formation_id: "",
          max_participants: "",
        });
        setJours([]);

        onClose();
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
    <Modal
      show={onOpen}
      fullscreen="lg-down"
      size="lg"
      onHide={onClose}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <ToastContainer />
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Modifier la session {session.title}
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
            <Form.Label>Titre de l'évenement</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <BsCalendar2PlusFill
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Saisir le title"
                value={sessionDB.title}
                onChange={(e) =>
                  setSessionDB((prev) => ({ ...prev, title: e.target.value }))
                }
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le title de l'évenement !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date et heure de début</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaCalendarDay
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="datetime-local"
                placeholder="Saisir la date et l'heure de début"
                value={sessionDB.startDate}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                min={nowISO}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la date et l'heure de début de la session qui
                doit etre au minimum la date d'aujourd'hui !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date et heure de fin</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaCalendarDay
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="datetime-local"
                placeholder="Saisir la date et l'heure de fin"
                value={sessionDB.endDate}
                onChange={(e) =>
                  setSessionDB((prev) => ({ ...prev, endDate: e.target.value }))
                }
                min={
                  sessionDB.startDate
                    ? new Date(sessionDB.startDate).toISOString().slice(0, 16)
                    : nowISO
                }
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la date et l'heure de fin de la session qui doit
                etre au minimum la date de début !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Durée en heure</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <BiCalendarCheck
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Saisir la durée en heure"
                value={sessionDB.duration}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    duration: e.target.value,
                  }))
                }
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la durée en heure de la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Réference de la formation</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaBook
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                type="text"
                value={sessionDB.reference}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    reference: e.target.value,
                  }))
                }
              >
                <option value="">
                  Séléctionner la réference de la formation
                </option>
                {formations.length > 0 &&
                  formations.map((f) => (
                    <option value={f.reference} key={f.id}>
                      {f.reference} - {f.entitled}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la réference de la formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Lacalisation</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <IoLocation
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Saisir la lacalisation"
                value={sessionDB.location}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la lacalisation de la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Statut de la session</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <BiSolidCalendarCheck
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                type="text"
                placeholder="Saisir le statut"
                value={sessionDB.status}
                onChange={(e) =>
                  setSessionDB((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="">Séléctionner le status de la session</option>
                <option value="EnCours">EnCours</option>
                <option value="Planifiée">Planifiée</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
                <option value="Reportée">Reportée</option>
                <option value="EnPause">EnPause</option>
                <option value="Complète">Complète</option>
                <option value="Ouverte">Ouverte</option>
                <option value="Fermée">Fermée</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le statut de la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Mode de la session</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <GiTeacher
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                value={sessionDB.sessionMode}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    sessionMode: e.target.value,
                  }))
                }
              >
                <option value="">Séléctionner le mode de la session</option>
                <option value="Présentiel">Présentiel</option>
                <option value="Hybride">Hybride</option>
                <option value="Distanciel">Distanciel</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le mode de la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nombre maximum de participants</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <PiStudentFill
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Saisir le nombre limite de participants"
                value={sessionDB.max_participants}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    max_participants: e.target.value,
                  }))
                }
                min={1}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nombre limite de participants pour cette
                session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nombre minimum de participants</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <PiStudentFill
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="number"
                placeholder="Saisir le nombre minimum de participants"
                value={sessionDB.min_participants}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    min_participants: e.target.value,
                  }))
                }
                min={1}
                max={sessionDB.max_participants}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nombre minimum de participants pour cette
                session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date et heure de début de participation</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaCalendarDay
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="datetime-local"
                placeholder="Saisir la date et l'heure de début de participation"
                value={sessionDB.registration_start}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    registration_start: e.target.value,
                  }))
                }
                max={new Date(sessionDB.startDate).getDate() + 1}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la date et l'heure de début de participation qui
                doit etre avant ou la meme date de début de la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date et heure de fin de participation</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaCalendarDay
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="datetime-local"
                placeholder="Saisir la date et l'heure de fin de participation"
                value={sessionDB.registration_end}
                onChange={(e) =>
                  setSessionDB((prev) => ({
                    ...prev,
                    registration_end: e.target.value,
                  }))
                }
                min={sessionDB.registration_start}
                max={sessionDB.endDate}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la date et l'heure de fin de participation qui
                doit etre après ou la meme date de début de la participation et
                aussi avant ou la meme date de fin de la session !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Jour(s)</Form.Label>
            {jours.length > 0 &&
              jours.map((jour, index) => (
                <div className="d-flex" key={index}>
                  <div className="flex-grow-1 me-3">
                    <Form.Label>Date du jour</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>
                        <LuCalendarClock
                          className="text-primary"
                          style={{ fontSize: "1.5em" }}
                        />
                      </InputGroup.Text>
                      <Form.Control
                        type="date"
                        value={jour.day}
                        onChange={(e) =>
                          handleJourChange(index, "day", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </InputGroup>
                  </div>
                  <div className="flex-grow-1 me-3">
                    <Form.Label>Heure de début</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>
                        <LuCalendarClock
                          className="text-primary"
                          style={{ fontSize: "1.5em" }}
                        />
                      </InputGroup.Text>
                      <Form.Control
                        type="time"
                        value={jour.startTime}
                        onChange={(e) =>
                          handleJourChange(index, "startTime", e.target.value)
                        }
                      />
                    </InputGroup>
                  </div>
                  <div className="flex-grow-1">
                    <Form.Label>Heure de fin</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text>
                        <LuCalendarClock
                          className="text-primary"
                          style={{ fontSize: "1.5em" }}
                        />
                      </InputGroup.Text>
                      <Form.Control
                        type="time"
                        value={jour.endTime}
                        onChange={(e) =>
                          handleJourChange(index, "endTime", e.target.value)
                        }
                      />
                    </InputGroup>
                  </div>
                  {index !== 0 && (
                    <Button
                      onClick={() => removeJour(index)}
                      className="btn btn-sm btn-rounded btn-inverse-danger m-3"
                    >
                      <MdDeleteForever size={30} />
                    </Button>
                  )}
                </div>
              ))}
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button
              className="mb-3 mt-0 btn btn-rounded btn-inverse-info"
              onClick={handleAddJour}
            >
              Ajouter un jour <FaPlusCircle size={25} />
            </Button>
          </div>
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Mettre à jour
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button className="btn-inverse-primary" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SessionEditModal;
