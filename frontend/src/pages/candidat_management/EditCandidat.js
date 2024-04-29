import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  editCandidat,
  fetchCandidatById,
} from "../../services/CandidatServices";
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
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";

const EditCandidat = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [candidat, setCandidat] = useState({
    firstName: "",
    lastName: "",
    email: "",
    type: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchCandidat = async () => {
      const candidatData = await fetchCandidatById(id);
      setCandidat(candidatData);
    };

    if (id) {
      fetchCandidat();
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

  const handleUpdateCandidat = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(candidat.firstName) ||
        isWhitespace(candidat.lastName) ||
        isWhitespace(candidat.phoneNumber) ||
        isWhitespace(candidat.email)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("firstName", candidat.firstName);
      formData.append("lastName", candidat.lastName);
      formData.append("email", candidat.email);
      formData.append("phoneNumber", candidat.phoneNumber);
      formData.append("type", candidat.type);

      const res = await editCandidat(id, formData);

      if (res.id) {
        Swal.fire({
          icon: "success",
          title: "Candidat modifié avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        setCandidat({
          firstName: "",
          lastName: "",
          email: "",
          type: "",
          phoneNumber: "",
        });

        navigate("/candidats");
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
                Mettre à jour les informations du candidat {candidat.firstName}{" "}
                {candidat.lastName}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateCandidat}
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
                      value={candidat.firstName}
                      onChange={(e) =>
                        setCandidat((prevF) => ({
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
                      Veuillez saisir le nom du candidat !
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
                      value={candidat.lastName}
                      onChange={(e) =>
                        setCandidat((prevF) => ({
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
                      Veuillez saisir le prénom du candidat !
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
                      value={candidat.email}
                      onChange={(e) =>
                        setCandidat((prevF) => ({
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
                      Veuillez saisir l'e-mail du candidat !
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
                      value={candidat.phoneNumber}
                      onChange={(e) =>
                        setCandidat((prevF) => ({
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
                      Veuillez saisir le numéro de téléphone du candidat qui
                      doit compter 8 caractères !
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
                      value={candidat.type}
                      onChange={(e) =>
                        setCandidat((prevF) => ({
                          ...prevF,
                          type: e.target.value,
                        }))
                      }
                      required
                    >
                      <option>Selectionner le Type du candidat</option>
                      <option value="Particulier">Particulier</option>
                      <option value="Organisme">Organisme</option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner le type du candidat !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
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

export default EditCandidat;
