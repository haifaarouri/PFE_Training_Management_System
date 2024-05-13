import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  editPartenaire,
  fetchPartenaireById,
} from "../../services/PartenaireServices";
import { FaFax, FaPhoneAlt } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { MdContactPhone } from "react-icons/md";
import { GoOrganization } from "react-icons/go";
import { TbNetwork } from "react-icons/tb";
import { IoLocationOutline } from "react-icons/io5";
import "react-toastify/dist/ReactToastify.css";
require("moment/locale/fr");

const EditPartenaire = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [partenaire, setPartenaire] = useState({
    companyName: "",
    contactName: "",
    email: "",
    webSite: "",
    adresse: "",
    fax: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchPartenaire = async () => {
      const partenaireData = await fetchPartenaireById(id);
      setPartenaire(partenaireData);
    };

    if (id) {
      fetchPartenaire();
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

  const handleUpdatePartenaire = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(partenaire.phoneNumber) ||
        isWhitespace(partenaire.email)
      ) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("companyName", partenaire.companyName);
      formData.append("contactName", partenaire.contactName);
      formData.append("email", partenaire.email);
      formData.append("phoneNumber", partenaire.phoneNumber);
      formData.append("fax", partenaire.fax);
      formData.append("webSite", partenaire.webSite);
      formData.append("adresse", partenaire.adresse);

      const res = await editPartenaire(id, formData);

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Partenaire modifié avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        setPartenaire({
          companyName: "",
          contactName: "",
          email: "",
          webSite: "",
          adresse: "",
          fax: "",
          phoneNumber: "",
        });

        navigate("/partenaires");
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
                Mettre à jour les informations du partenaire{" "}
                {partenaire.companyName}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdatePartenaire}
              >
                <Form.Group className="mb-3">
                  <Form.Label>Nom de l'entreprise</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <GoOrganization
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
                      value={partenaire.companyName}
                      onChange={(e) =>
                        setPartenaire((prev) => ({
                          ...prev,
                          companyName: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le nom du entreprise !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Nom du contact</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <MdContactPhone
                            className="text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      name="contactName"
                      type="text"
                      placeholder="Saisir le nom du contact"
                      value={partenaire.contactName}
                      onChange={(e) =>
                        setPartenaire((prev) => ({
                          ...prev,
                          contactName: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le nom du contact !
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
                      value={partenaire.email}
                      onChange={(e) =>
                        setPartenaire((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir l'e-mail !
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
                      value={partenaire.phoneNumber}
                      onChange={(e) =>
                        setPartenaire((prev) => ({
                          ...prev,
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
                      Veuillez saisir le numéro de téléphone du Partenaire qui
                      doit compter 8 caractères !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Fax</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <FaFax
                            className="text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      name="fax"
                      type="text"
                      placeholder="Saisir le fax"
                      value={partenaire.fax}
                      onChange={(e) =>
                        setPartenaire((prev) => ({
                          ...prev,
                          fax: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le fax de l'entreprise !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Site web</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <TbNetwork
                            className="text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      name="webSite"
                      value={partenaire.webSite}
                      onChange={(e) =>
                        setPartenaire((prev) => ({
                          ...prev,
                          webSite: e.target.value,
                        }))
                      }
                      required
                      placeholder="Saisir l'url du site web"
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir l'url du site web !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Adresse de l'entreprise</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <IoLocationOutline
                            className="text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      name="adresse"
                      value={partenaire.adresse}
                      onChange={(e) =>
                        setPartenaire((prev) => ({
                          ...prev,
                          adresse: e.target.value,
                        }))
                      }
                      required
                      placeholder="Saisir l'adresse de l'entreprise"
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir l'adresse de l'entreprise !
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

export default EditPartenaire;
