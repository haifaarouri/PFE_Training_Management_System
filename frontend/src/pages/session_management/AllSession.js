import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useCallback, useEffect, useState } from "react";
import EventCreationModal from "../../components/EventCreationModal";
import {
  fetchAllSessions,
  fetchSessionById,
} from "../../services/SessionServices";
import Swal from "sweetalert2";
import { Modal, Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { BiSolidCalendarEdit } from "react-icons/bi";
import SessionEditModal from "../../components/SessionEditModal";

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
  const [sessionToEdit, setSessionToEdit] = useState({});
  const [session, setSession] = useState(event);

  const handleShowEditModal = (s) => {
    if (s && s.id) {
      setShowEditModal(true);
      setSessionToEdit(s);
    } else {
      console.error("Invalid session data", s);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSessionToEdit({});
  };

  const fetchData = async (eventId) => {
    if (!eventId) return;
    try {
      const response = await fetchSessionById(eventId);
      setSession(response);
    } catch (error) {
      console.error("Error fetching session details:", error);
    }
  };

  useEffect(() => {
    if (show && event) {
      setSession(event);
      fetchData(event.id);
    }
  }, [show, event, showEditModal]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="md"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          id="contained-modal-title-vcenter"
          style={{ color: "#223e9c" }}
        >
          {session.title}
        </Modal.Title>
      </Modal.Header>
      <SessionEditModal
        onOpen={showEditModal}
        onClose={handleCloseEditModal}
        session={sessionToEdit}
      />
      <Modal.Body>
        <div className="d-flex justify-content-between mb-3">
          <h5 style={{ color: "#1097ff" }}>Formation de {session.reference}</h5>
          <Button
            className="btn-sm btn-inverse-info"
            onClick={() => handleShowEditModal(session)}
          >
            Modifier <BiSolidCalendarEdit size={22} />
          </Button>
        </div>
        {session.startDate && session.endDate && (
          <>
            <p>Date et heure de début : {formatDateToFrench(session.startDate)}</p>
            <p>Date et heure de fin : {formatDateToFrench(session.endDate)}</p>
          </>
        )}
        <p>Localisation : {session.location}</p>
        <p>Durée en heures : {session.duration}</p>
        <p>Mode de la session : {session.sessionMode}</p>
        <p>Statut de la session : {session.status}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} variant="info">
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
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

  const onEventDrop = useCallback(
    ({ event, start, end }) => {
      onChangeEventTime(start, end, event.id);
    },
    [onChangeEventTime]
  );

  const onEventResize = useCallback(
    ({ event, start, end }) => {
      onChangeEventTime(start, end, event.id);
    },
    [onChangeEventTime]
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
                  setEventSelected(event);
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
