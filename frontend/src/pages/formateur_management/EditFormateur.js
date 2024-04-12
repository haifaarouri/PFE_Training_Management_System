import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  editFormateur,
  fetchFormateurById,
} from "../../services/FormateurServices";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../components/datePicker.css";
import { formatISO } from "date-fns";
import FileModal from "../../components/FileModal";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";
require("moment/locale/fr");

const EditFormateur = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [formateur, setFormateur] = useState({
    firstName: "",
    lastName: "",
    email: "",
    type: "",
    experience: "",
    phoneNumber: "",
  });
  const [certificates, setCertificates] = useState([]);
  const [showCertif, setShowCertif] = useState(false);
  const [dates, setDates] = useState([{ startDate: null, endDate: null }]);
  const [specialities, setSpecialities] = useState([""]);
  const [cv, setCv] = useState(null);
  const [urlFile, setURLfile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleShowFileModal = () => setShowFileModal(true);
  const handleCloseFileModal = () => setShowFileModal(false);

  const convertToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => {
      console.error("Error converting file to base64:", error);
    };
  };

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

  const removeCertificate = (index) => {
    const newCertificates = [...certificates];
    newCertificates.splice(index, 1);
    setCertificates(newCertificates);
  };

  const handleCertificateChange = (index, event) => {
    const newCertificates = [...certificates];
    newCertificates[index][event.target.name] = event.target.value;
    setCertificates(newCertificates);
  };

  useEffect(() => {
    const fetchFormateur = async () => {
      const formateurData = await fetchFormateurById(id);
      setFormateur(formateurData);
      const initialDates = formateurData.disponibilities.map((dispo) => {
        return {
          startDate: dispo.startDate ? new Date(dispo.startDate) : null,
          endDate: dispo.endDate ? new Date(dispo.endDate) : null,
        };
      });
      setDates(initialDates);
      formateurData.certificats.length > 0 &&
        setCertificates(formateurData.certificats);
      setSpecialities(formateurData.speciality.split(","));
      setCv(formateurData.cv);
    };

    if (id) {
      fetchFormateur();
    }
  }, [id]);

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

  const removeDisponibility = (index) => {
    if (index !== 0) {
      const newDisponibilities = [...dates];
      newDisponibilities.splice(index, 1);
      setDates(newDisponibilities);
    }
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

  const handleUpdateFormateur = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(formateur.firstName) ||
        isWhitespace(formateur.lastName) ||
        isWhitespace(formateur.phoneNumber) ||
        isWhitespace(formateur.email) ||
        cv.size > 2000000
      ) {
        event.preventDefault();
        event.stopPropagation();
        handleError("Fichier est trop volumineux !");
        setErrorMsg(
          "Fichier est trop volumineux ! La taille maximale est 2MB !"
        );
      }

      setValidated(true);

      const formattedDisponibility = dates.map((d) => ({
        startDate: d.startDate
          ? formatISO(d.startDate, { representation: "date" })
          : null,
        endDate: d.endDate
          ? formatISO(d.endDate, { representation: "date" })
          : null,
      }));

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("firstName", formateur.firstName);
      formData.append("lastName", formateur.lastName);
      formData.append("email", formateur.email);
      formData.append("phoneNumber", formateur.phoneNumber);
      formData.append("experience", formateur.experience);
      formData.append("type", formateur.type);
      formData.append("specialities", JSON.stringify(specialities));
      certificates.forEach((certificate, index) => {
        Object.keys(certificate).forEach((key) => {
          formData.append(`certificates[${index}][${key}]`, certificate[key]);
        });
      });
      formattedDisponibility.forEach((d, index) => {
        formData.append(`disponibility[${index}][startDate]`, d.startDate);
        formData.append(`disponibility[${index}][endDate]`, d.endDate);
      });
      formData.append("cv", cv);

      const res = await editFormateur(id, formData);

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Formateur modifié avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        setFormateur({
          firstName: "",
          lastName: "",
          email: "",
          type: "",
          experience: "",
          phoneNumber: "",
          speciality: "",
        });
        setSpecialities([""]);
        setCertificates([]);
        setDates([{ startDate: null, endDate: null }]);
        setCv("");

        navigate("/formateurs");
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

  const addSpeciality = () => {
    setSpecialities([...specialities, ""]);
  };

  const removeSpeciality = (index) => {
    if (index !== 0) {
      const newSpecialities = [...specialities];
      newSpecialities.splice(index, 1);
      setSpecialities(newSpecialities);
    }
  };

  const handleSpecialityChange = (index, event) => {
    const newSpecialities = [...specialities];
    newSpecialities[index] = event.target.value;
    setSpecialities(newSpecialities);
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Mettre à jour les informations du formateur{" "}
                {formateur.firstName} {formateur.lastName}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateFormateur}
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
                      value={formateur.firstName}
                      onChange={(e) =>
                        setFormateur((prevF) => ({
                          ...prevF,
                          firstName: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={formateur.lastName}
                      onChange={(e) =>
                        setFormateur((prevF) => ({
                          ...prevF,
                          lastName: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={formateur.email}
                      onChange={(e) =>
                        setFormateur((prevF) => ({
                          ...prevF,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={formateur.phoneNumber}
                      onChange={(e) =>
                        setFormateur((prevF) => ({
                          ...prevF,
                          phoneNumber: e.target.value,
                        }))
                      }
                      required
                      minLength={8}
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le numéro de téléphone du formateur qui
                      doit compter 8 caractères !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Disponibilité</Form.Label>
                  {dates.length > 0 &&
                    Array.isArray(dates) &&
                    dates.map((range, index) => (
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
                        <DatePicker
                          name="disponibility"
                          customInput={
                            <input
                              style={{
                                padding: "10px",
                                border: "none",
                                borderRadius: "4px",
                                width: "950px",
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
                          placeholderText="Séléctionner les intervalles des dates de disponibilité de ce formateur"
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
                        <Form.Control.Feedback>
                          Cela semble bon !
                        </Form.Control.Feedback>
                        <Form.Control.Feedback type="invalid">
                          Veuillez sélectionner la disponibilité du formateur !
                        </Form.Control.Feedback>
                        {index !== 0 && (
                          <Button
                            onClick={() => removeDisponibility(index)}
                            className="btn btn-info btn-rounded btn-inverse-danger"
                          >
                            <MdDeleteForever size={30} />
                          </Button>
                        )}
                      </InputGroup>
                    ))}
                  <div className="d-flex justify-content-end">
                    <Button
                      className="mb-3 mt-0 btn btn-info btn-rounded btn-inverse-info"
                      onClick={addNewRange}
                    >
                      Ajouter un intervalle <FaPlusCircle size={25} />
                    </Button>
                  </div>
                </Form.Group>
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
                      value={formateur.experience}
                      onChange={(e) =>
                        setFormateur((prevF) => ({
                          ...prevF,
                          experience: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le Nombre d'année d'expérience du
                      formateur !
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
                      value={formateur.type}
                      onChange={(e) =>
                        setFormateur((prevF) => ({
                          ...prevF,
                          type: e.target.value,
                        }))
                      }
                      required
                    >
                      <option>Selectionner le Type du formateur</option>
                      <option value="INTERNE">Interne à l'entreprise</option>
                      <option value="EXTERNE">Externe</option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner le type du formateur !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Spécialité(s)</Form.Label>
                  {specialities.map((speciality, index) => (
                    <InputGroup className="mb-3" key={index}>
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
                        type="text"
                        placeholder="Saisir la spécialité"
                        value={speciality}
                        onChange={(e) => handleSpecialityChange(index, e)}
                        required
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir la ou les Spécialité(s) du formateur !
                      </Form.Control.Feedback>
                      {index !== 0 && (
                        <Button
                          onClick={() => removeSpeciality(index)}
                          className="btn btn-info btn-rounded btn-inverse-danger"
                        >
                          <MdDeleteForever size={30} />
                        </Button>
                      )}
                    </InputGroup>
                  ))}
                </Form.Group>
                <div className="d-flex justify-content-end">
                  <Button
                    className="mb-3 mt-0 btn btn-info btn-rounded btn-inverse-info"
                    onClick={addSpeciality}
                  >
                    Ajouter une spécialité <FaPlusCircle size={25} />
                  </Button>
                </div>
                <Form.Group className="mb-3">
                  <Form.Label>CV</Form.Label>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <div
                      className="d-flex flex-column justify-content-center align-items-center"
                      style={{
                        border: "2px dashed #1475cf",
                        cursor: "pointer",
                        borderRadius: "5px",
                        height: "150px",
                        width: "100%",
                      }}
                      onClick={() =>
                        document.querySelector(".input-cv").click()
                      }
                    >
                      <Form.Control
                        hidden
                        name="cv"
                        type="file"
                        accept=".pdf,.png,.jpeg,.jpg"
                        placeholder="Sélectionner le cv"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFileName(file.name);
                            setCv(file);
                            convertToBase64(file, (base64) => {
                              setURLfile({
                                imgUpload: base64,
                                fileType: file.type,
                              });
                            });
                            if (file.size > 2000000) {
                              handleError("Fichier est trop volumineux !");
                            }
                          }
                        }}
                        required
                        className="input-cv"
                      />
                      <Form.Text
                        style={{ color: "#dc3545", fontWeight: "bold" }}
                      >
                        Taille maximale du fichier est 2MB
                      </Form.Text>
                      <MdCloudUpload color="#1475cf" size={60} />
                      <p>
                        Sélectionner le CV du formateur au format pdf, png, jpeg
                        ou jpg !
                      </p>
                    </div>
                    <section
                      className="d-flex justify-content-between align-items-center"
                      style={{
                        margin: "10px 0",
                        padding: "15px 20px",
                        borderRadius: "5px",
                        backgroundColor: "#e9f0ff",
                      }}
                    >
                      <AiFillFileImage color="#1475cf" />
                      <span>
                        {fileName} -
                        <MdDelete
                          className="text-primary"
                          style={{ fontSize: "1.2em" }}
                          onClick={() => {
                            setFileName("Aucun fichier sélectionné");
                            setCv(null);
                          }}
                        />
                      </span>
                    </section>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner les Spécifications Techniques du
                      matériel au format PDF !
                    </Form.Control.Feedback>
                    <Button
                      onClick={handleShowFileModal}
                      className="btn btn-inverse-info btn-icon mt-3 mx-3"
                    >
                      <i
                        className="mdi mdi-eye text-primary"
                        style={{ fontSize: "1.5em" }}
                      />
                    </Button>
                    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                  </InputGroup>
                  <div
                    style={{ display: "none", height: "25px" }}
                    className="progress mt-3"
                  >
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      aria-valuenow="0"
                      aria-valuemin="0"
                      aria-valuemax="100"
                      style={{ width: "0%", height: "100%" }}
                    >
                      0%
                    </div>
                  </div>
                </Form.Group>
                <FileModal
                  show={showFileModal}
                  handleClose={handleCloseFileModal}
                  selectedFile={cv}
                  urlFile={urlFile}
                  fileContent="CV"
                />
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
                              onChange={(e) =>
                                handleCertificateChange(index, e)
                              }
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
                              onChange={(e) =>
                                handleCertificateChange(index, e)
                              }
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
                              onChange={(e) =>
                                handleCertificateChange(index, e)
                              }
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
                              onChange={(e) =>
                                handleCertificateChange(index, e)
                              }
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
                              onChange={(e) =>
                                handleCertificateChange(index, e)
                              }
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
                    Mettre à jour
                  </Button>
                </div>
              </Form>
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFormateur;
