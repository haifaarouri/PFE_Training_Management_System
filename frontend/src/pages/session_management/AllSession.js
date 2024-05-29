import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useCallback, useEffect, useState } from "react";
import EventCreationModal from "../../components/EventCreationModal";
import {
  deleteSession,
  editSession,
  fetchAllSessions,
  fetchSessionById,
  fetchSessionDays,
  getSessionByCriteria,
} from "../../services/SessionServices";
import Swal from "sweetalert2";
import { Modal, Button, Tooltip, OverlayTrigger, Card } from "react-bootstrap";
import { BiSolidCalendarEdit } from "react-icons/bi";
import SessionEditModal from "../../components/SessionEditModal";
import { AiFillDelete } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import ReservationSalleModal from "../../components/ReservationSalleModal";
import { RiHomeOfficeLine } from "react-icons/ri";
import { Toaster } from "sonner";
import { GiTeacher } from "react-icons/gi";
import { FaCartArrowDown } from "react-icons/fa";
import { MdLaptopChromebook } from "react-icons/md";
import ReservationTrainersModal from "../../components/ReservationTrainersModal";
import ReserveMaterialForSessionModal from "../../components/ReserveMaterialForSessionModal";
import CommandeModal from "../../components/CommandeModal";

const CustomEvent = ({ event }) => {
  return (
    <div className="custom-event">
      <strong>
        {event.title} - {event.reference}
      </strong>{" "}
      <div>
        <span>{event.location}</span>
      </div>
      <EventOverlay event={event} />
    </div>
  );
};

function formatDateToFrench(date) {
  const options = {
    weekday: "long", // "lundi"
    year: "numeric", // "2020"
    month: "long", // "juin"
    day: "numeric", // "15"
    hour: "2-digit", // "14"
    minute: "2-digit", // "30"
    second: "2-digit", // "15"
    hour12: false,
  };

  return new Intl.DateTimeFormat("fr-FR", options).format(new Date(date));
}

const EventOverlay = ({ event }) => {
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-${event.id}`}>
          Session : {event.title} pour la formation {event.reference}, entre{" "}
          {formatDateToFrench(event.start)} - {formatDateToFrench(event.end)}
        </Tooltip>
      }
    >
      <div style={{ fontSize: "10px" }}>Status: {event.status}</div>
    </OverlayTrigger>
  );
};

const EventModal = ({ show, onHide, event }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoomReservationModal, setShowRoomReservationModal] =
    useState(false);
  const [daySessions, setDaySessions] = useState([]);
  const [sessionAfterEdit, setSessionAfterEdit] = useState(null);
  const [showBookTrainersModal, setShowBookTrainersModal] = useState(false);
  const [showBookMaterialsModal, setShowBookMaterialsModal] = useState(false);
  const [showCommandeModal, setShowCommandeModal] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    event && event.id && fetchSessionDays(event.id).then(setDaySessions);
  }, [event, showEditModal]);

  useEffect(() => {
    event && event.id && fetchSessionById(event.id).then(setSessionAfterEdit);
  }, [showEditModal]);

  const handleShowEditModal = (s) => {
    if (s && s.id) {
      setShowEditModal(true);
    } else {
      console.error("Invalid session data", s);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

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

  const handleDeleteSession = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteSession(id);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "Session est supprimée !",
            icon: "success",
          });
          // const d = await fetchData();
          // setSalles(d);
          handleSuccess(res.message);
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

  const handleShowRoomReservationModal = () =>
    setShowRoomReservationModal(true);

  const handleCloseRoomReservationModal = () =>
    setShowRoomReservationModal(false);

  const handleShowTrainersReservationModal = () =>
    setShowBookTrainersModal(true);

  const handleCloseTrainersReservationModal = () =>
    setShowBookTrainersModal(false);

  const handleShowMaterialReservationModal = () =>
    setShowBookMaterialsModal(true);

  const handleCloseMaterialsReservationModal = () =>
    setShowBookMaterialsModal(false);

  const handleShowCommandeModal = (id) => {
    setShowCommandeModal(true);
    setSessionId(id);
  };

  const handleCloseCommandeModal = () => {
    setShowCommandeModal(false);
    setSessionId(null);
  };

  return (
    event && (
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="event-modal"
        fullscreen="lg-down"
      >
        <ToastContainer />
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title
            id="contained-modal-title-vcenter"
            style={{ color: "#223e9c" }}
          >
            {event.title || (sessionAfterEdit && sessionAfterEdit.title)}
          </Modal.Title>
        </Modal.Header>
        <SessionEditModal
          onOpen={showEditModal}
          onClose={handleCloseEditModal}
          session={event}
        />
        <CommandeModal
          show={showCommandeModal}
          handleClose={handleCloseCommandeModal}
          sessionId={sessionId}
        />
        <Modal.Body className="modal-body-custom">
          {sessionAfterEdit ? (
            <>
              <Card className="mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between">
                    <h5 className="text-primary align-self-center">
                      Formation de {sessionAfterEdit.reference}
                    </h5>
                    <div className="d-flex">
                      <Button
                        className="btn-sm btn-inverse-info mx-1"
                        onClick={() => handleShowEditModal(sessionAfterEdit)}
                      >
                        Modifier <BiSolidCalendarEdit size={25} />
                      </Button>
                      <Button
                        className="btn-sm btn-inverse-danger mx-1"
                        onClick={() => handleDeleteSession(sessionAfterEdit.id)}
                      >
                        Supprimer <AiFillDelete size={26} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
              <Card className="mb-3">
                <Card.Body>
                  {sessionAfterEdit.startDate && sessionAfterEdit.endDate && (
                    <>
                      <p>
                        <i className="fas fa-calendar-alt"></i>{" "}
                        <b>Date et heure de début : </b>
                        {formatDateToFrench(sessionAfterEdit.startDate)}
                      </p>
                      <p>
                        <i className="fas fa-calendar-alt"></i>{" "}
                        <b>Date et heure de fin : </b>
                        {formatDateToFrench(sessionAfterEdit.endDate)}
                      </p>
                    </>
                  )}
                  <p>
                    <i className="fas fa-map-marker-alt"></i>{" "}
                    <b>Localisation : </b> {sessionAfterEdit.location}
                  </p>
                  <p>
                    <i className="fas fa-clock"></i> <b>Durée en heures : </b>
                    {sessionAfterEdit.duration}
                  </p>
                  <p>
                    <i className="fas fa-chalkboard-teacher"></i>{" "}
                    <b>Mode de la session : </b>
                    {sessionAfterEdit.sessionMode}
                  </p>
                  <p>
                    <i className="fas fa-info-circle"></i>{" "}
                    <b>Statut de la session : </b>
                    {sessionAfterEdit.status}
                  </p>
                </Card.Body>
              </Card>
            </>
          ) : (
            event && (
              <>
                <Card className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <h5 className="text-primary align-self-center">
                        Formation de {event.reference}
                      </h5>
                      <div className="d-flex">
                        <Button
                          className="btn-sm btn-inverse-info mx-1"
                          onClick={() => handleShowEditModal(event)}
                        >
                          Modifier <BiSolidCalendarEdit size={25} />
                        </Button>
                        <Button
                          className="btn-sm btn-inverse-danger mx-1"
                          onClick={() => handleDeleteSession(event.id)}
                        >
                          Supprimer <AiFillDelete size={26} />
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
                <Card className="mb-3">
                  <Card.Body>
                    {event.startDate && event.endDate && (
                      <>
                        <p>
                          <i className="fas fa-calendar-alt"></i>{" "}
                          <b>Date et heure de début : </b>
                          {formatDateToFrench(event.startDate)}
                        </p>
                        <p>
                          <i className="fas fa-calendar-alt"></i>{" "}
                          <b>Date et heure de fin : </b>
                          {formatDateToFrench(event.endDate)}
                        </p>
                      </>
                    )}
                    <p>
                      <i className="fas fa-map-marker-alt"></i>{" "}
                      <b>Localisation : </b> {event.location}
                    </p>
                    <p>
                      <i className="fas fa-clock"></i> <b>Durée en heures : </b>
                      {event.duration}
                    </p>
                    <p>
                      <i className="fas fa-chalkboard-teacher"></i>{" "}
                      <b>Mode de la session : </b>
                      {event.sessionMode}
                    </p>
                    <p>
                      <i className="fas fa-info-circle"></i>{" "}
                      <b>Statut de la session : </b>
                      {event.status}
                    </p>
                  </Card.Body>
                </Card>
              </>
            )
          )}
          {daySessions.length > 0 && (
            <Card className="mb-3">
              <Card.Body>
                <b>Jours :</b>
                {daySessions.map((d) => (
                  <p key={d.id}>
                    <i className="fas fa-calendar-day"></i>{" "}
                    <b>Date du jour : </b>
                    {d.day} <br /> <i className="fas fa-clock"></i>{" "}
                    <b>Heure de début : </b> {d.startTime} -
                    <i className="fas fa-clock"></i> <b> Heure de fin : </b>{" "}
                    {d.endTime}
                  </p>
                ))}
              </Card.Body>
            </Card>
          )}
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Button
                  className="btn-sm btn-inverse-primary"
                  onClick={handleShowRoomReservationModal}
                >
                  Réserver salles
                  <RiHomeOfficeLine size={25} />
                </Button>
                <Button
                  className="btn-sm btn-inverse-primary"
                  onClick={handleShowTrainersReservationModal}
                >
                  Réserver formateurs
                  <GiTeacher size={25} />
                </Button>
                <Button
                  className="btn-sm btn-inverse-primary"
                  onClick={handleShowMaterialReservationModal}
                >
                  Réserver matériaux
                  <MdLaptopChromebook size={25} />
                </Button>
                <Button
                  className="btn-sm btn-inverse-primary"
                  onClick={() => handleShowCommandeModal(event.id)}
                >
                  Passer commandes
                  <FaCartArrowDown size={25} />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide} variant="info">
            Fermer
          </Button>
        </Modal.Footer>
        <ReservationSalleModal
          show={showRoomReservationModal}
          onHide={handleCloseRoomReservationModal}
          session={event}
        />
        <ReservationTrainersModal
          show={showBookTrainersModal}
          onHide={handleCloseTrainersReservationModal}
          session={event}
        />
        <ReserveMaterialForSessionModal
          show={showBookMaterialsModal}
          onHide={handleCloseMaterialsReservationModal}
          session={event}
        />
      </Modal>
    )
  );
};

const AllSessions = () => {
  const localizer = momentLocalizer(moment);
  const DragAndDropCalendar = withDragAndDrop(Calendar);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [modalShow, setModalShow] = useState(false);
  const [eventSelected, setEventSelected] = useState({});

  const handleShowAddModal = () => setShowModal(true);
  const handleCloseAddModal = () => setShowModal(false);

  const fetchData = async () => {
    try {
      const response = await fetchAllSessions();
      const fetchedEvents = response.map((session) => ({
        id: session.id,
        title: session.title,
        start: new Date(session.startDate),
        end: new Date(session.endDate),
        isDraggable: true,
        isResizable: true,
        duration: session.duration,
        reference: session.reference,
        location: session.location,
        status: session.status,
        sessionMode: session.sessionMode,
        style: session.salle_id ? {} : { backgroundColor: "red" },
      }));
      setSessions(fetchedEvents);
    } catch (error) {
      console.log("Error fetching sessions :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      await fetchData();
    };

    u();
  }, []);

  useEffect(() => {
    const u = async () => {
      await fetchData();
    };

    u();
  }, [showModal, modalShow]);

  const onChangeEventTime = useCallback((start, end, eventId) => {
    setSessions((prevEvents) => {
      return prevEvents.map((event) => {
        if (event.id === eventId) {
          return {
            ...event,
            start: new Date(start),
            end: new Date(end),
          };
        }
        return event;
      });
    });
  }, []);

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

  const confirmAndSaveChanges = useCallback(async (start, end, eventId) => {
    const fullEvent = sessions.find((e) => e.id === eventId);
    if (!fullEvent) {
      Swal.fire("Erreur !", "Session non trouvée !", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Êtes-vous sûre?",
      text: "Voulez-vous enregistrer les modifications ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, enregistrer !",
    });
    console.log(fullEvent);
    if (result.isConfirmed) {
      try {
        const updatedEvent = {
          ...fullEvent,
          start: new Date(start),
          end: new Date(end),
        };
        console.log(updatedEvent);
        const formattedStartDate = toUTCDate(updatedEvent.start)
          .toISOString()
          .slice(0, 16);
        const formattedEndDate = toUTCDate(updatedEvent.end)
          .toISOString()
          .slice(0, 16);

        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("title", updatedEvent.title);
        formData.append("startDate", formattedStartDate);
        formData.append("endDate", formattedEndDate);
        formData.append("duration", updatedEvent.duration);
        formData.append("reference", updatedEvent.reference);
        formData.append("location", updatedEvent.location);
        formData.append("status", updatedEvent.status);
        formData.append("sessionMode", updatedEvent.sessionMode);
        formData.append("max_participants", updatedEvent.max_participants);

        const days = await fetchSessionDays(updatedEvent.id);
        days.forEach((jour, index) => {
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

        const res = await editSession(eventId, formData);

        if (res) {
          setSessions((prevEvents) => {
            return prevEvents.map((e) => {
              if (e.id === eventId) {
                return updatedEvent;
              }
              return e;
            });
          });

          Swal.fire(
            "Enregistré !",
            "Votre session a été mise à jour !",
            "success"
          );
        }
      } catch (error) {
        console.log(error);
        Swal.fire(
          "Echec !",
          "Un problème est survenu lors de la mise à jour de votre session !",
          "error"
        );
      }
    }
  }, []);

  const onEventDrop = useCallback(
    ({ event, start, end }) => {
      confirmAndSaveChanges(start, end, event.id);
    },
    [confirmAndSaveChanges, sessions]
  );

  const onEventResize = useCallback(
    ({ event, start, end }) => {
      confirmAndSaveChanges(start, end, event.id);
    },
    [confirmAndSaveChanges, sessions]
  );

  const handleSelectSlot = (slotInfo) => {
    let bounds;
    if (slotInfo.bounds) {
      bounds = slotInfo.bounds;
    } else if (
      slotInfo.action &&
      slotInfo.action.target &&
      typeof slotInfo.action.target.getBoundingClientRect === "function"
    ) {
      bounds = slotInfo.action.target.getBoundingClientRect();
    } else {
      console.error("Unable to determine bounds for slot selection.");
      return; // Exit the function if bounds cannot be determined
    }

    const now = new Date();
    const start = slotInfo.start;
    const end = slotInfo.end;

    if (new Date(start) < now) {
      Swal.fire({
        icon: "error",
        title: "Date de début ne peut pas etre avant date d'aujourd'hui !",
        showConfirmButton: false,
        timer: 2000,
      });
      return;
    }

    // Format dates to YYYY-MM-DD and times to HH:mm
    const startDate = start.toISOString().substring(0, 10);
    const startTime = start.toISOString().substring(11, 16);
    const endDate = end.toISOString().substring(0, 10);
    const endTime = end.toISOString().substring(11, 16);

    // Set state in your component
    setSelectedStartDate(`${startDate}T${startTime}`);
    setSelectedEndDate(`${endDate}T${endTime}`);

    // Create a temporary event for visual feedback
    const tempEvent = {
      id: "temp",
      title: "New Event",
      start: slotInfo.start,
      end: slotInfo.end,
      color: "#7991e2",
      isTemporary: true,
    };

    // Update events to include this temporary event
    setSessions((prevEvents) => [
      ...prevEvents.filter((event) => !event.isTemporary),
      tempEvent,
    ]);
    setSelectedSlot(slotInfo);
    // setModalPosition({ top: bounds.top, left: bounds.left + bounds.width }); // Adjust as needed
    setModalOpen(true);
  };

  const addNewEvent = (newEvent) => {
    setSessions((prevEvents) => [
      ...prevEvents.filter((event) => !event.isTemporary), // Remove temporary event
      { ...newEvent, id: prevEvents.length + 1, color: "#0DCAF0" }, // Add new event
    ]);
    setModalOpen(false);
  };

  const eventStyleGetter = (event, start, end, isSelected) => {
    const backgroundColor = isSelected ? "#005a9e" : event.color || "#0078d4";
    const style = {
      backgroundColor,
      borderRadius: "0px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };
    return {
      style,
    };
  };

  const fetchSessionByCriteria = async (startDate, endDate, reference) => {
    try {
      // Format dates to 'YYYY-MM-DDTHH:mm'
      const formattedStartDate = moment(startDate).format("YYYY-MM-DDTHH:mm");
      const formattedEndDate = moment(endDate).format("YYYY-MM-DDTHH:mm");

      const session = await getSessionByCriteria(
        formattedStartDate,
        formattedEndDate,
        reference
      );
      setEventSelected(session);
    } catch (error) {
      console.error("Error fetching session by criteria:", error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-5">
                <h4 className="card-title mt-2">
                  Calendrier des sessions de formations
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter une session
                </Button>
              </div>
              <Toaster richColors expand={false} position="top-center" />
              <EventCreationModal
                isOpen={showModal}
                onClose={handleCloseAddModal}
                onSave={addNewEvent}
              />
              <DragAndDropCalendar
                defaultDate={new Date()}
                defaultView={Views.MONTH}
                events={sessions}
                localizer={localizer}
                step={15}
                timeslots={4}
                startAccessor="start"
                endAccessor="end"
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                resizableAccessor="isResizable"
                draggableAccessor="isDraggable"
                resizable
                style={{ height: "1000px" }}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                onSelectSlot={handleSelectSlot}
                selectable={true}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={(event) => {
                  setModalShow(true);
                  fetchSessionByCriteria(
                    event.start,
                    event.end,
                    event.reference
                  );
                }}
                components={{ event: CustomEvent }}
              />
              <EventCreationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={addNewEvent}
                slotInfo={selectedSlot}
                selectedStartDate={selectedStartDate}
                selectedEndDate={selectedEndDate}
              />
              <EventModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                event={eventSelected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSessions;
