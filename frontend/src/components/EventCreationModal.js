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
import { PiStudentFill } from "react-icons/pi";
import { MdDeleteForever } from "react-icons/md";
import { LuCalendarClock } from "react-icons/lu";

const EventCreationModal = ({
  isOpen,
  onClose,
  onSave,
  slotInfo,
  selectedStartDate,
  selectedEndDate,
}) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(
    selectedStartDate && selectedStartDate
  );
  const [endDate, setEndDate] = useState(selectedEndDate && selectedEndDate);
  const [duration, setDuration] = useState("");
  const [reference, setReference] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");
  const [sessionMode, setSessionMode] = useState("");
  const [max_participants, setMaxParticipants] = useState("");
  const [min_participants, setMinParticipants] = useState("");
  const [registration_start, setRegistrationStart] = useState("");
  const [registration_end, setRegistrationEnd] = useState("");
  const [validated, setValidated] = useState(false);
  const [formations, setFormations] = useState([]);
  const nowISO = new Date().toISOString().slice(0, 16);
  const [jours, setJours] = useState([{ day: "", startTime: "", endTime: "" }]);

  const handleAddJour = () => {
    setJours([...jours, { day: "", startTime: "", endTime: "" }]);
  };

  const handleJourChange = (index, field, value) => {
    const newJours = [...jours];
    newJours[index][field] = value;
    setJours(newJours);
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setFormations(d);
    };

    u();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetchAllFormations();
      return response;
    } catch (error) {
      console.log("Error fetching formations :", error);
    }
  };

  const formRef = useRef();

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

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      Swal.fire({
        icon: "error",
        title: "Invalid date format",
        text: "Please ensure the dates are correctly selected.",
        timer: 2000,
      });
      return;
    }

    // Validate each jour day is within the session start and end dates
    const sessionStart = new Date(startDate ? startDate : selectedStartDate).setHours(0, 0, 0, 0);
    const sessionEnd = new Date(endDate ? endDate : selectedEndDate).setHours(23, 59, 59, 999);
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

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }
      setValidated(true);

      slotInfo &&
        onSave({
          title,
          start: slotInfo.start,
          end: slotInfo.end,
        });

      const formattedStartDate = toUTCDate(startDate ? startDate : selectedStartDate)
        .toISOString()
        .slice(0, 16);
      const formattedEndDate = toUTCDate(endDate ? endDate : selectedEndDate).toISOString().slice(0, 16);

      // const formattedJours = jours.map((jour) => ({
      //   day: new Date(jour.day).toISOString().slice(0, 10),
      //   startTime: jour.startTime,
      //   endTime: jour.endTime,
      // }));

      const formData = new FormData();
      formData.append("title", title);
      formData.append("startDate", formattedStartDate);
      formData.append("endDate", formattedEndDate);
      formData.append("duration", duration);
      formData.append("reference", reference);
      formData.append("location", location);
      formData.append("status", status);
      formData.append("sessionMode", sessionMode);
      formData.append("max_participants", max_participants);
      formData.append("min_participants", min_participants);
      formData.append("registration_start", registration_start);
      formData.append("registration_end", registration_end);
      // formData.append("jours", JSON.stringify(formattedJours));
      // Append each jour object in the jours array
      jours.forEach((jour, index) => {
        formData.append(`jours[${index}][day]`, jour.day);
        formData.append(`jours[${index}][startTime]`, jour.startTime);
        formData.append(`jours[${index}][endTime]`, jour.endTime);
      });

      if (!localStorage.getItem("token")) {
        console.log("ffff");
        const res = await axios.post("/api/add-session", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Session créée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setTitle("");
          setStartDate("");
          setEndDate("");
          setDuration("");
          setReference("");
          setLocation("");
          setStatus("");
          setSessionMode("");
          setMaxParticipants("");
          setMinParticipants("");
          setRegistrationStart("");
          setRegistrationEnd("");
          setJours([]);

          onClose();
        }
      } else {
        const headers = {
          "Content-Type": "multipart/form-data",
        };

        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.post("/api/add-session", formData, {
          headers: headers,
        });

        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Session créée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setTitle("");
          setStartDate("");
          setEndDate("");
          setDuration("");
          setReference("");
          setLocation("");
          setStatus("");
          setSessionMode("");
          setMaxParticipants("");
          setMinParticipants("");
          setRegistrationStart("");
          setRegistrationEnd("");
          setJours([]);

          onClose();
        }
      }
    } catch (error) {
      if (error) {
        console.log(error);
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

  const removeJour = (index) => {
    if (index !== 0) {
      const newJour = [...jours];
      newJour.splice(index, 1);
      setJours(newJour);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      show={isOpen}
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
          Créer un nouveau évenement
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
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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
                value={startDate || selectedStartDate}
                onChange={(e) => setStartDate(e.target.value)}
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
                value={endDate || selectedEndDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={
                  startDate
                    ? new Date(startDate).toISOString().slice(0, 16)
                    : selectedStartDate
                    ? new Date(selectedStartDate).toISOString().slice(0, 16)
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
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
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
                placeholder="Saisir la réference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
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
                value={location}
                onChange={(e) => setLocation(e.target.value)}
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
                value={status}
                onChange={(e) => setStatus(e.target.value)}
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
                value={sessionMode}
                onChange={(e) => setSessionMode(e.target.value)}
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
                value={max_participants}
                onChange={(e) => setMaxParticipants(e.target.value)}
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
                value={min_participants}
                onChange={(e) => setMinParticipants(e.target.value)}
                min={1}
                max={max_participants}
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
                value={registration_start}
                onChange={(e) => setRegistrationStart(e.target.value)}
                max={new Date(startDate).getDate() + 1}
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
                value={registration_end}
                onChange={(e) => setRegistrationEnd(e.target.value)}
                min={registration_start}
                max={endDate}
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
            {jours.map((jour, index) => (
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
              Sauvegarder
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

export default EventCreationModal;
