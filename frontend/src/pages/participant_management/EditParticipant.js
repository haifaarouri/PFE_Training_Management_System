import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  editParticipant,
  fetchParticipantById,
} from "../../services/ParticipantServices";
import { FaChalkboardTeacher, FaPhoneAlt, FaBuilding } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { IoLocationSharp } from "react-icons/io5";

const EditParticipant = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [participant, setParticipant] = useState({
    firstName: "",
    lastName: "",
    email: "",
    type: "",
    address: "",
    phoneNumber: "",
    companyName: "",
  });

  useEffect(() => {
    const fetchParticipant = async () => {
      const participantData = await fetchParticipantById(id);
      setParticipant(participantData);
    };

    if (id) {
      fetchParticipant();
    }
  }, [id]);

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

  const handleUpdateParticipant = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(participant.phoneNumber) ||
        isWhitespace(participant.email)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("firstName", participant.firstName);
      formData.append("lastName", participant.lastName);
      formData.append("email", participant.email);
      formData.append("phoneNumber", participant.phoneNumber);
      formData.append("type", participant.type);
      formData.append("address", participant.address);
      participant.type === "Organisme" &&
        formData.append("companyName", participant.companyName);

      const res = await editParticipant(id, formData);

      if (res) {
        Swal.fire({
          icon: "success",
          title: "Participant modifié avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        setParticipant({
          firstName: "",
          lastName: "",
          email: "",
          type: "",
          address: "",
          phoneNumber: "",
          companyName: "",
        });

        navigate("/Participants");
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
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Mettre à jour les informations du Participant{" "}
                {participant.firstName} {participant.lastName}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateParticipant}
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
                      value={participant.firstName}
                      onChange={(e) =>
                        setParticipant((prevF) => ({
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
                      Veuillez saisir le nom du Participant !
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
                      value={participant.lastName}
                      onChange={(e) =>
                        setParticipant((prevF) => ({
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
                      Veuillez saisir le prénom du Participant !
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
                      value={participant.email}
                      onChange={(e) =>
                        setParticipant((prevF) => ({
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
                      Veuillez saisir l'e-mail du Participant !
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
                      value={participant.phoneNumber}
                      onChange={(e) =>
                        setParticipant((prevF) => ({
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
                      Veuillez saisir le numéro de téléphone du Participant qui
                      doit compter 8 caractères !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <IoLocationSharp
                            className="text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      name="address"
                      type="text"
                      placeholder="Saisir l'adresse"
                      value={participant.address}
                      onChange={(e) =>
                        setParticipant((prevF) => ({
                          ...prevF,
                          address: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir l'adresse du Participant !
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
                      value={participant.type}
                      onChange={(e) =>
                        setParticipant((prevF) => ({
                          ...prevF,
                          type: e.target.value,
                        }))
                      }
                      required
                    >
                      <option>Selectionner le Type du Participant</option>
                      <option value="Particulier">Particulier</option>
                      <option value="Organisme">Organisme</option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner le type du Participant !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                {participant.type === "Organisme" && (
                  <Form.Group className="mb-3">
                    <Form.Label>Nom de l'entreprise</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <FaBuilding
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        name="companyName"
                        type="text"
                        placeholder="Saisir le nom de l'entreprise"
                        value={participant.companyName}
                        onChange={(e) =>
                          setParticipant((prevF) => ({
                            ...prevF,
                            companyName: e.target.value,
                          }))
                        }
                        required
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir le nom de l'entreprise du Participant !
                      </Form.Control.Feedback>
                    </InputGroup>
                  </Form.Group>
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

export default EditParticipant;
