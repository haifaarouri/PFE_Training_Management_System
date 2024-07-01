import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  editVariable,
  fetchColonnesSource,
  fetchTablesSource,
  fetchVariableById,
} from "../../services/VariableServices";

const EditVariableTemplate = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [tables, setTables] = useState([]);
  const [colonnes, setColonnes] = useState([]);
  const [formData, setFormData] = useState({
    variable_name: "",
    description: "",
    source_model: "",
    source_field: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    fetchVariableById(id).then(setFormData);
    fetchTablesSource().then(setTables);
  }, [id]);

  useEffect(() => {
    if (formData.source_model) {
      fetchColonnesSource(formData.source_model).then(setColonnes);
    }
  }, [formData.source_model]);

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

  const handleUpdateVariables = async (event) => {
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
      formDataToSend.append("_method", "PUT");
      formDataToSend.append("variable_name", formData.variable_name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("source_model", formData.source_model);
      formDataToSend.append("source_field", formData.source_field);

      const res = await editVariable(id, formDataToSend);

      if (res) {
        Swal.fire({
          icon: "success",
          title: "Variables modifiée avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });

        setFormData({
          variable_name: "",
          description: "",
          source_model: "",
          source_field: "",
        });
        navigate("/templates-variables");
      }
    } catch (error) {
      console.log(error);
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
                Mettre à jour les informations de la Variable{" "}
                {formData.variable_name}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateVariables}
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                        <option value="">
                          Sélectionnez une colonne source
                        </option>
                        {colonnes.length > 0 &&
                          colonnes.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </Form.Select>
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
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
                    Metter à jour
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

export default EditVariableTemplate;
