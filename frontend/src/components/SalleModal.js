import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./datePicker.css";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { formatISO } from "date-fns";

const SalleModal = ({ show, handleClose }) => {
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [disponibility, setDisponibility] = useState([
    { startDate: null, endDate: null },
  ]);
  const [disposition, setDisposition] = useState("");
  const [image, setImage] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  // const [dateRanges, setDateRanges] = useState([
  //   { startDate: null, endDate: null },
  // ]);

  const handleDateChange = (dates, index) => {
    const [start, end] = dates;
    // setDateRanges((current) =>
    //   current.map((range, i) =>
    //     i === index ? { ...range, startDate: start, endDate: end } : range
    //   )
    // );
    setDisponibility((current) =>
      current?.map((range, i) =>
        i === index ? { ...range, startDate: start, endDate: end } : range
      )
    );
  };

  const addNewRange = () => {
    // setDateRanges((current) => [
    //   ...current,
    //   { startDate: null, endDate: null },
    // ]);
    setDisponibility((current) => [
      ...current,
      { startDate: null, endDate: null },
    ]);
  };

  const isWhitespace = (str) => {
    return str.trim() === "";
  };

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

  const handleAddSalle = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false || isWhitespace(name)) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formattedDisponibility = disponibility.map((range) => ({
        startDate: formatISO(range.startDate, { representation: "date" }),
        endDate: formatISO(range.endDate, { representation: "date" }),
      }));

      const formData = new FormData();
      formData.append("name", name);
      formData.append("capacity", capacity);
      formData.append("disposition", disposition);
      formData.append("disponibility", JSON.stringify(formattedDisponibility));
      formData.append("image", image);

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/add-salle", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Salle ajoutée avec succès !",
              showConfirmButton: false,
              timer: 1500,
            });

            setCapacity(null);
            setDisponibility(null);
            setDisposition(null);
            setImage(null);
            setName(null);

            handleClose();
          }
        } else {
          const headers = {
            "Content-Type": "multipart/form-data",
          };

          const token = localStorage.getItem("token");
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          const response = await axios.post("/api/add-salle", formData, {
            headers: headers,
          });

          if (response.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Salle ajoutée avec succès !",
              showConfirmButton: false,
              timer: 1500,
            });

            setCapacity(null);
            setDisponibility(null);
            setDisposition(null);
            setImage(null);
            setName(null);

            handleClose();
          }
        }
      } catch (error) {
        console.log("Error adding a new user :", error);
      }
    } catch (error) {
      if (error && error.response.status === 422) {
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
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg"
      fullscreen="lg-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Formulaire pour ajouter une nouvelle Salle
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddSalle}
        >
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-home-variant text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="name"
                type="text"
                placeholder="Saisir le nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nom de la salle !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Capacité</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-format-list-numbers text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="capacity"
                type="number"
                placeholder="Saisir la capacité"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la capacité de la salle !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Disponibilité</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-calendar-multiple-check text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              {disponibility.map((range, index) => (
                <DatePicker
                  name="disponibility"
                  value={disponibility}
                  customInput={
                    <input
                      style={{
                        padding: "10px",
                        border: "none",
                        borderRadius: "4px",
                        width: "600px",
                        height: "64px",
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
                  placeholderText="Séléctionner les intervalles des dates de disponibilité de cette salle"
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
                          customHeaderCount === 1
                            ? { visibility: "hidden" }
                            : null
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
                          customHeaderCount === 0
                            ? { visibility: "hidden" }
                            : null
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
                className="btn btn-inverse-primary btn-rounded btn-icon"
                onClick={addNewRange}
              >
                <i className="mdi mdi-calendar-plus"></i>
              </Button>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner la disponibilité de la salle !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Disposition</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-shape-plus text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="disposition"
                value={disposition}
                onChange={(e) => setDisposition(e.target.value)}
                required
              >
                <option>Selectionner la disposition (forme de la salle)</option>
                <option value="U">En U</option>
                <option value="CLASSROOM">Salle de classe</option>
                <option value="THEATRE">Théâtre</option>
                <option value="TABLE">En Table (rectangulaire ou ronde)</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner la disposition de la salle !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                name="image"
                type="file"
                accept="image/*"
                placeholder="Sélectionner l'image"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner l'image de la salle !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Ajouter
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SalleModal;
