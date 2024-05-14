import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import { useCallback, useEffect, useState } from "react";
import EventCreationModal from "../../components/EventCreationModal";

const AllSessions = () => {
  const localizer = momentLocalizer(moment);
  const DragAndDropCalendar = withDragAndDrop(Calendar);
  const MOCK_EVENTS = [
    {
      id: 1,
      title: "Event 1",
      start: "2024-05-15T08:31:38",
      end: "2024-05-15T18:15:58",
      description:
        "Etiam vel augue. Vestibulum rutrum rutrum neque. Aenean auctor gravida sem.\n\nPraesent id massa id nisl venenatis lacinia. Aenean sit amet justo. Morbi ut odio.",
      color: "#0DCAF0",
    },
    {
      id: 2,
      title: "Event 2",
      start: "2024-05-16T13:30:02",
      end: "2024-05-16T17:30:20",
      description:
        "Duis bibendum, felis sed interdum venenatis, turpis enim blandit mi, in porttitor pede justo eu massa. Donec dapibus. Duis at velit eu est congue elementum.\n\nIn hac habitasse platea dictumst. Morbi vestibulum, velit id pretium iaculis, diam erat fermentum justo, nec condimentum neque sapien placerat ante. Nulla justo.\n\nAliquam quis turpis eget elit sodales scelerisque. Mauris sit amet eros. Suspendisse accumsan tortor quis turpis.",
      color: "#0DCAF0",
    },
  ];
  const myEvents = MOCK_EVENTS.map((event) => {
    // dates must be in this format : new Date(Y, M, D, H, MIN)
    return {
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: new Date(event.end),
      color: event.color,
      isDraggable: true,
      isResizable: true,
    };
  });
  const [events, setEvents] = useState(myEvents);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalPosition, setModalPosition] = useState({
    top: "",
    left: "",
  });

  const onChangeEventTime = useCallback((start, end, eventId) => {
    setEvents((prevEvents) => {
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

  const handleSelectSlot = (slotInfo, event) => {
    const bounds = event.target.getBoundingClientRect();
    setModalPosition({
      top: bounds.top + window.scrollY,
      left: bounds.left + window.scrollX,
    });
    setSelectedSlot(slotInfo);
    setModalOpen(true);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!selectedSlot || !modalOpen) return;

      const calendarElement = document.querySelector(".rbc-time-slot"); // Adjust selector as needed
      if (calendarElement) {
        const bounds = calendarElement.getBoundingClientRect();
        setModalPosition({
          top: bounds.top + window.scrollY,
          left: bounds.left + window.scrollX,
        });
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [selectedSlot, modalOpen]);

  // const handleSelectSlot = (slotInfo) => {
  //   const bounds =
  //     slotInfo.bounds ||
  //     (slotInfo.action && slotInfo.action.target.getBoundingClientRect()); // This method is used to get the position of the slot relative to the viewport, which allows you to position the modal accurately.

  //   // Create a temporary event for visual feedback
  //   const tempEvent = {
  //     id: "temp",
  //     title: "New Event",
  //     start: slotInfo.start,
  //     end: slotInfo.end,
  //     color: "#7991e2",
  //     isTemporary: true,
  //   };

  //   // Update events to include this temporary event
  //   setEvents((prevEvents) => [
  //     ...prevEvents.filter((event) => !event.isTemporary),
  //     tempEvent,
  //   ]);
  //   setSelectedSlot(slotInfo);
  //   setModalPosition({ top: bounds.top, left: bounds.left + bounds.width }); // Adjust as needed
  //   setModalOpen(true);
  // };

  const addNewEvent = (newEvent) => {
    setEvents((prevEvents) => [
      ...prevEvents.filter((event) => !event.isTemporary), // Remove temporary event
      { ...newEvent, id: prevEvents.length + 1, color: "#0DCAF0" }, // Add new event
    ]);
    setModalOpen(false);
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              {/* <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{
                  height: "1000px",
                }}
                eventPropGetter={(event) => {
                  return {
                    style: {
                      backgroundColor: event.color,
                    },
                  };
                }}
                onSelectEvent={(event) => alert(event.title)}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                defaultDate={new Date()}
                defaultView={"week"}
                min={moment().toDate()}
                step={15}
                timeslots={4}
              /> */}
              <DragAndDropCalendar
                defaultDate={new Date()}
                defaultView={Views.WEEK}
                events={events}
                localizer={localizer}
                onEventDrop={onEventDrop}
                onEventResize={onEventResize}
                resizableAccessor="isResizable"
                draggableAccessor="isDraggable"
                resizable
                style={{ height: "1000px" }}
                // eventPropGetter={(event) => ({
                //   style: { backgroundColor: event.color },
                // })}
                views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                onSelectSlot={handleSelectSlot}
                selectable={true}
                eventPropGetter={(event, start, end, isSelected) => ({
                  style: isSelected
                    ? {
                        backgroundColor: "#7991e2",
                        borderColor: "#223e9c",
                        borderStyle: "dashed",
                      }
                    : { backgroundColor: event.color },
                })}
              />
              <EventCreationModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={addNewEvent}
                slotInfo={selectedSlot}
                style={{
                  position: "fixed",
                  top: modalPosition.top + "px",
                  left: modalPosition.left + "px",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSessions;
