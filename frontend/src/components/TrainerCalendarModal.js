import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../pages/session_management/calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useEffect, useState } from "react";
import { Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { fetchFormateurById } from "../services/FormateurServices";
import { fetchBookedDaysForTrainer } from "../services/SessionServices";

const CustomEvent = ({ event }) => {
  return event ? (
    <div className="custom-event">
      <strong>
        {event.title} - {event.reference}
      </strong>{" "}
      <div>
        <span>{event.location}</span>
      </div>
      <EventOverlay event={event} />
    </div>
  ) : (
    <div className="custom-event">
      <strong>Formateur disponible</strong>
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
          Formateur disponible entre {formatDateToFrench(event.start)} et
          {formatDateToFrench(event.end)}
        </Tooltip>
      }
    >
      <div style={{ fontSize: "14px" }}>Formateur disponible</div>
    </OverlayTrigger>
  );
};

const TrainerCalendarModal = ({ show, onHide, calendarIdTrainer }) => {
  const localizer = momentLocalizer(moment);
  const DragAndDropCalendar = withDragAndDrop(Calendar);
  const [formateur, setFormateur] = useState({});
  const [trainerAvailabilities, setTrainerAvailabilities] = useState([]);
  const [bookedDays, setBookedDays] = useState([]);

  useEffect(() => {
    calendarIdTrainer &&
      fetchFormateurById(calendarIdTrainer).then((d) => {
        setFormateur(d);
        let events = [];
        events = d.disponibilities.map((dispo) => ({
          id: dispo.id,
          start: new Date(dispo.startDate),
          end: new Date(dispo.endDate),
          style: { backgroundColor: "red" },
        }));
        setTrainerAvailabilities(events);

        fetchBookedDaysForTrainer(calendarIdTrainer).then(setBookedDays);

        if (bookedDays.length > 0 && trainerAvailabilities.length > 0) {
          let days = [];
          bookedDays.forEach((d) => {
            let startDateString = `${d.day}T${d.startTime}`;
            let endDateString = `${d.day}T${d.endTime}`;
            days.push({
              id: d.id,
              start: new Date(startDateString),
              end: new Date(endDateString),
            });
          });

          days.length > 0 &&
            days.forEach((d) => {
              setTrainerAvailabilities((prev) => [...prev, d]);
            });
        }
      });
  }, [show, calendarIdTrainer, trainerAvailabilities, bookedDays]);

  useEffect(() => {
    setFormateur({});
    setTrainerAvailabilities([]);
    setBookedDays([]);
  }, [onHide]);

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
          Calendrier du formateur : {formateur.firstName} {formateur.lastName}
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
                    defaultView={Views.MONTH}
                    events={trainerAvailabilities}
                    localizer={localizer}
                    step={15}
                    timeslots={4}
                    startAccessor="start"
                    endAccessor="end"
                    resizable
                    style={{ height: "1000px" }}
                    views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                    selectable={true}
                    eventPropGetter={eventStyleGetter}
                    components={{ event: CustomEvent }}
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

export default TrainerCalendarModal;
