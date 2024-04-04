import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datePicker.css";

function DisponibilityModal({ show, handleClose, handleCallback }) {
  const [dates, setDates] = useState([{ startDate: null, endDate: null }]);

  const handleDateChange = (dates, index) => {
    const [start, end] = dates;
    setDates((current) =>
      current?.map((range, i) =>
        i === index ? { ...range, startDate: start, endDate: end } : range
      )
    );
  };

  const addNewRange = () => {
    setDates((current) => [...current, { startDate: null, endDate: null }]);
  };

  const handleFilter = () => {
    handleCallback(dates);
    handleClose();
  };

  return (
    <Modal
      show={show}
      fullscreen="lg-down"
      onHide={handleClose}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Séléctionner des intervalles de disponibilités
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`d-flex flex-column justify-content-between`}>
        {dates.length > 0 &&
          Array.isArray(dates) &&
          dates.map((range, index) => (
            <DatePicker
              key={index}
              name="disponibility"
              customInput={
                <input
                  style={{
                    border: "none",
                    borderRadius: "4px",
                    width: "80%",
                  }}
                />
              }
              selectsRange={true}
              startDate={range.startDate}
              endDate={range.endDate}
              onChange={(dates) => handleDateChange(dates, index)}
              withPortal
              minDate={new Date()}
              isClearable
              showYearDropdown
              scrollableMonthYearDropdown
              placeholderText="Rechercher par disponibilités"
              monthsShown={2}
              dateFormat="dd/MM/yyyy"
              renderCustomHeader={({
                monthDate,
                customHeaderCount,
                decreaseMonth,
                increaseMonth,
              }) => (
                <div>
                  <button
                    aria-label="Previous Month"
                    className={
                      "react-datepicker__navigation react-datepicker__navigation--previous"
                    }
                    style={
                      customHeaderCount === 1 ? { visibility: "hidden" } : null
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      decreaseMonth();
                    }}
                  >
                    <span
                      className={
                        "react-datepicker__navigation-icon react-datepicker__navigation-icon--previous"
                      }
                    >
                      {"<"}
                    </span>
                  </button>
                  <span className="react-datepicker__current-month">
                    {monthDate.toLocaleString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <button
                    aria-label="Next Month"
                    className={
                      "react-datepicker__navigation react-datepicker__navigation--next"
                    }
                    style={
                      customHeaderCount === 0 ? { visibility: "hidden" } : null
                    }
                    onClick={(e) => {
                      e.preventDefault();
                      increaseMonth();
                    }}
                  >
                    <span
                      className={
                        "react-datepicker__navigation-icon react-datepicker__navigation-icon--next"
                      }
                    >
                      {">"}
                    </span>
                  </button>
                </div>
              )}
            />
          ))}
        <Button
          className="btn btn-inverse-primary btn-icon"
          style={{ marginLeft: "30%", marginTop: "3%" }}
          onClick={addNewRange}
        >
          <i className="mdi mdi-calendar-plus"></i>
        </Button>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button className="btn-inverse-primary" onClick={handleFilter}>
          Filtrer{" "}
          <svg
            className="svg-inline--fa fa-search fa-w-16"
            aria-hidden="true"
            data-prefix="fas"
            data-icon="search"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width="5%"
          >
            <path
              fill="currentColor"
              d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
            />
          </svg>
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DisponibilityModal;
