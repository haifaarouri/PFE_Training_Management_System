import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../services/axios";
import Swal from "sweetalert2";
import {
  fetchColonnesSource,
  fetchTablesSource,
} from "../services/VariableServices";

const VariableModal = ({ show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [tables, setTables] = useState([]);
  const [colonnes, setColonnes] = useState([]);
  const [formData, setFormData] = useState({
    variable_name: "",
    description: "",
    source_model: "",
    source_field: "",
  });

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  useEffect(() => {
    fetchTablesSource().then(setTables);
  }, []);

  useEffect(() => {
    if (formData.source_model) {
      fetchColonnesSource(formData.source_model).then(setColonnes);
    }
  }, [formData.source_model]);

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

  const handleAddVariable = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formDataToSend = new FormData();
      formDataToSend.append("variable_name", formData.variable_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("source_model", formData.source_model);
      formDataToSend.append("source_field", formData.source_field);

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post(
            "/api/add-variable-template",
            formDataToSend,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (res.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Variable ajoutée avec succès !",
              showConfirmButton: false,
              timer: 1500,
            });

            setFormData({
              variable_name: "",
              description: "",
              source_model: "",
              source_field: "",
            });

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

          const response = await axios.post(
            "/api/add-variable-template",
            formDataToSend,
            {
              headers: headers,
            }
          );

          if (response.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Variable ajoutée avec succès !",
              showConfirmButton: false,
              timer: 2000,
            });

            setFormData({
              variable_name: "",
              description: "",
              source_model: "",
              source_field: "",
            });

            handleClose();
          }
        }
      } catch (error) {
        if (error) {
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
    } catch (error) {
      if (error) {
        console.log(error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
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
            Formulaire pour ajouter une nouvelle variable pour les modèles de
            documents et d'emails
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddVariable}
        >
          <Form.Group className="mb-3">
            <Form.Label>Nom de la variable</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                name="variable_name"
                type="text"
                placeholder="Saisir le nom de la variable"
                value={formData.variable_name}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nom de la variable !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                name="description"
                type="text"
                placeholder="Saisir une description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la description de la variable !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Séléctionner la table source</Form.Label>
            <InputGroup className="mb-3">
              <Form.Select
                name="source_model"
                value={formData.source_model}
                onChange={handleInputChange}
                required
              >
                <option value="">Séléctionner la table source</option>
                {tables.length > 0 &&
                  tables.map((table) => (
                    <option key={table} value={table}>
                      {table}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la table source !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          {tables.length > 0 && formData.source_model && (
            <Form.Group className="mb-3">
              <Form.Label>Séléctionner la colonne source</Form.Label>
              <InputGroup className="mb-3">
                <Form.Select
                  name="source_field"
                  value={formData.source_field}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionnez une colonne source</option>
                  {colonnes.length > 0 &&
                    colonnes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  Veuillez saisir la colonne source !
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
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

export default VariableModal;
