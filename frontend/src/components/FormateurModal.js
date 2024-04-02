import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import "./datePicker.css";
import axios from "../services/axios";
import Swal from "sweetalert2";
// import { formatISO } from "date-fns";
import { FaChalkboardTeacher, FaPhoneAlt, FaPlusCircle } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import {
  MdDateRange,
  MdDeleteForever,
  MdWork,
  MdWorkHistory,
} from "react-icons/md";
import { LiaCertificateSolid } from "react-icons/lia";
import { GrOrganization } from "react-icons/gr";
import { GiDiploma } from "react-icons/gi";
import { PiCertificate } from "react-icons/pi";

const FormateurModal = ({ show, handleClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  // const [disponibility, setDisponibility] = useState([
  //   { startDate: null, endDate: null },
  // ]);
  const [experience, setExperience] = useState("");
  const [type, setType] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [showCertif, setShowCertif] = useState(false);
  const [certificates, setCertificates] = useState([]);

  // Function to handle adding a new certificate
  const addCertificate = () => {
    setCertificates([
      ...certificates,
      {
        name: "",
        organisme: "",
        obtainedDate: "",
        idCertificat: "",
        urlCertificat: "",
      },
    ]);
  };

  // Function to handle removing a certificate
  const removeCertificate = (index) => {
    const newCertificates = [...certificates];
    newCertificates.splice(index, 1);
    setCertificates(newCertificates);
  };

  // Function to handle certificate change
  const handleCertificateChange = (index, event) => {
    const newCertificates = [...certificates];
    newCertificates[index][event.target.name] = event.target.value;
    setCertificates(newCertificates);
  };

  // const handleDateChange = (dates, index) => {
  //   const [start, end] = dates;
  //   setDisponibility((current) =>
  //     current?.map((range, i) =>
  //       i === index ? { ...range, startDate: start, endDate: end } : range
  //     )
  //   );
  // };

  // const addNewRange = () => {
  //   setDisponibility((current) => [
  //     ...current,
  //     { startDate: null, endDate: null },
  //   ]);
  // };

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

  const handleAddFormateur = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(firstName) ||
        isWhitespace(lastName) ||
        isWhitespace(phoneNumber) ||
        isWhitespace(speciality) ||
        isWhitespace(firstName)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      // const formattedDisponibility = disponibility.map((range) => ({
      //   startDate: formatISO(range.startDate, { representation: "date" }),
      //   endDate: formatISO(range.endDate, { representation: "date" }),
      // }));

      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", email);
      formData.append("phoneNumber", phoneNumber);
      // formData.append("disponibility", JSON.stringify(formattedDisponibility));
      formData.append("experience", experience);
      formData.append("type", type);
      formData.append("speciality", speciality);
      certificates.forEach((certificate, index) => {
        Object.keys(certificate).forEach((key) => {
          formData.append(`certificates[${index}][${key}]`, certificate[key]);
        });
      });

      if (!localStorage.getItem("token")) {
        const res = await axios.post("/api/add-formateur", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Formateur ajouté avec succès !",
            showConfirmButton: false,
            timer: 1500,
          });

          setFirstName("");
          setLastName("");
          setEmail("");
          setPhoneNumber("");
          setExperience("");
          setType("");
          setSpeciality("");
          setCertificates([]);
          // setDisponibility([{ startDate: null, endDate: null }]);

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

        const response = await axios.post("/api/add-formateur", formData, {
          headers: headers,
        });

        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Formateur ajouté avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setFirstName("");
          setLastName("");
          setEmail("");
          setPhoneNumber("");
          setExperience("");
          setType("");
          setSpeciality("");
          // setDisponibility([{ startDate: null, endDate: null }]);

          handleClose();
        }
      }
    } catch (error) {
      if (
        error
        // (error.response.status === 422 || error.response.status === 400)
      ) {
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
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg"
      fullscreen="lg-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Formulaire pour ajouter un nouveau Formateur
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddFormateur}
        >
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaChalkboardTeacher
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="firstName"
                type="text"
                placeholder="Saisir le nom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nom du formateur !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaChalkboardTeacher
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="lastName"
                type="text"
                placeholder="Saisir le prénom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le prénom du formateur !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>E-mail</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <TfiEmail
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="email"
                type="email"
                placeholder="Saisir l'adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir l'e-mail du formateur !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Numéro de téléphone</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaPhoneAlt
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="phoneNumber"
                type="text"
                placeholder="Saisir la numéro de téléphone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                minLength={8}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le numéro de téléphone du formateur qui doit
                compter 8 caractères !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          {/* <Form.Group className="mb-3">
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
              {disponibility.length > 0 &&
                Array.isArray(disponibility) &&
                disponibility.map((range, index) => (
                  <DatePicker
                    name="disponibility"
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
          </Form.Group> */}
          <Form.Group className="mb-3">
            <Form.Label>Nombre d'année d'expérience</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <MdWorkHistory
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="experience"
                type="number"
                placeholder="Saisir la Nombre d'année d'expérience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le Nombre d'année d'expérience du formateur !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Type</Form.Label>
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
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option>Selectionner le Type du formateur</option>
                <option value="INTERNE">Interne à l'entreprise</option>
                <option value="EXTERNE">Externe</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner le type du formateur !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Spécialité(s)</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <MdWork
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="speciality"
                type="text"
                placeholder="Saisir la ou les Spécialité(s)"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la ou les Spécialité(s) du formateur !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Button
            className="mt-3 btn-icon-text btn-icon-prepend btn-info"
            style={{ color: "white" }}
            onClick={() => setShowCertif(!showCertif)}
          >
            Ajouter des certificats{" "}
            <LiaCertificateSolid style={{ fontSize: "1.5em" }} />
          </Button>
          {showCertif && (
            <div className="shadow-lg p-3 mb-5 mt-5 bg-white rounded">
              {certificates.map((certificate, index) => (
                <div key={index}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom du certifat</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <LiaCertificateSolid
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="name"
                        type="text"
                        placeholder="Saisir le nom"
                        value={certificate.name}
                        onChange={(e) => handleCertificateChange(index, e)}
                        required
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez sélectionner le nom de la certificat !
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Organisme de délivrance</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <GrOrganization
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="organisme"
                        type="text"
                        placeholder="Saisir l'organisme de délivrance"
                        value={certificate.organisme}
                        onChange={(e) => handleCertificateChange(index, e)}
                        required
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir l'organisme de délivrance de cette
                        certificat !
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Date d'obtention</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <MdDateRange
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="obtainedDate"
                        type="date"
                        placeholder="Sélectionner la date d'obtention"
                        value={certificate.obtainedDate}
                        onChange={(e) => handleCertificateChange(index, e)}
                        required
                        max={new Date().toISOString().split("T")[0]}
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez sélectionner la date d'obtention de cette
                        certificat !
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>ID du certificat</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <GiDiploma
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="idCertificat"
                        type="text"
                        placeholder="Saisir l'ID de la certificat"
                        value={certificate.idCertificat}
                        onChange={(e) => handleCertificateChange(index, e)}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>URL du certificat</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <PiCertificate
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="urlCertificat"
                        type="text"
                        placeholder="Saisir l'URL de la certificat"
                        value={certificate.urlCertificat}
                        onChange={(e) => handleCertificateChange(index, e)}
                      />
                    </InputGroup>
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button
                      className="btn btn-info btn-rounded btn-icon btn-inverse-danger"
                      onClick={() => removeCertificate(index)}
                    >
                      <MdDeleteForever size={25} />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="d-flex justify-content-end">
                <Button
                  className="my-3 btn btn-info btn-rounded btn-icon btn-inverse-info"
                  onClick={addCertificate}
                >
                  <FaPlusCircle size={25} />
                </Button>
              </div>
            </div>
          )}
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

export default FormateurModal;
