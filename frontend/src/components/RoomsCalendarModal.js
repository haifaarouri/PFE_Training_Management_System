import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../pages/session_management/calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useEffect, useState } from "react";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../pages/session_management/calendar.css";
import {
  fetchAllSalles,
  getDaysSessionBySalleId,
} from "../services/SalleServices";

const CustomEvent = ({ event }) => {
  return event ? (
    <div className="custom-event">
      <strong>{event.title}</strong>
      <EventOverlay event={event} />
    </div>
  ) : (
    <div className="custom-event">
      <strong>Jour session</strong>
      <EventOverlay event={event} />
    </div>
  );
};

const EventOverlay = ({ event }) => {
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
  return (
    <OverlayTrigger
      placement="top"
      overlay={
        <Tooltip id={`tooltip-${event.id}`}>
          Salle réservée dans ce jour entre {formatDateToFrench(event.start)} et{" "}
          {formatDateToFrench(event.end)}
        </Tooltip>
      }
    >
      <div style={{ fontSize: "14px" }}>Jour Session</div>
    </OverlayTrigger>
  );
};

const RoomsCalendarModal = ({ show, onHide }) => {
  const localizer = momentLocalizer(moment);
  const DragAndDropCalendar = withDragAndDrop(Calendar);
  const [salles, setSalles] = useState([]);
  const [daySession, setDaySession] = useState([]);

  useEffect(() => {
    fetchAllSalles().then(setSalles);
  }, [show]);

  useEffect(() => {
    salles.length > 0 &&
      salles.forEach((s) => {
        getDaysSessionBySalleId(s.id)
          .then((data) => {
            if (data.length > 0) {
              setDaySession((prev) => {
                const updatedSessions = [...prev];
                data.length > 0 &&
                  data.forEach((newSession) => {
                    if (!prev.some((session) => session.id === newSession.id)) {
                      const startString = `${newSession.day}T${newSession.startTime}`;
                      const endString = `${newSession.day}T${newSession.endTime}`;

                      const startDateTime = new Date(startString);
                      const endDateTime = new Date(endString);

                      updatedSessions.push({
                        id: newSession.id,
                        title: `Salle avec l'ID ${newSession.salle_id} réservée pour le jour de la session avec l'ID ${newSession.session_id}`,
                        start: startDateTime,
                        end: endDateTime,
                      });
                    }
                  });
                return updatedSessions;
              });
            }
          })
          .catch((error) => {
            console.error("Error fetching session data:", error);
          });
      });
  }, [show, salles]);

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
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      className="event-modal"
      fullscreen="lg-down"
    >
      <Modal.Header closeButton className="modal-header-custom">
        <Modal.Title
          id="contained-modal-title-vcenter"
          style={{ color: "#223e9c" }}
        >
          Calendrier de réservation des salles
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-custom">
        <div className="content-wrapper">
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card shadow-lg p-3 bg-white rounded">
                <div className="card-body">
                  <DragAndDropCalendar
                    defaultDate={new Date()}
                    // showMultiDayTimes={true}
                    events={daySession}
                    localizer={localizer}
                    step={15}
                    timeslots={4}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: "1000px" }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    selectable={true}
                    eventPropGetter={eventStyleGetter}
                    components={{
                      event: CustomEvent,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onHide} variant="info">
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RoomsCalendarModal;
