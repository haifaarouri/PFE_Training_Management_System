import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import { editSalle, fetchSalleById } from "../../services/SalleServices";

const EditSalle = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [salle, setSalle] = useState({
    name: "",
    capacity: "",
    id: "",
    disposition: "",
    image: "",
    state: "",
  });

  useEffect(() => {
    const fetchSalle = async () => {
      const salleData = await fetchSalleById(id);
      setSalle(salleData);
    };

    if (id) {
      fetchSalle();
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

  const handleUpdateSalle = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false || isWhitespace(salle.name)) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", salle.name);
      formData.append("capacity", salle.capacity);
      formData.append("disposition", salle.disposition);
      formData.append("image", salle.image);
      formData.append("state", salle.state);

      const res = await editSalle(id, formData);

      if (res) {
        Swal.fire({
          icon: "success",
          title: "Salle modifiée avec succès !",
          showConfirmButton: false,
          timer: 1500,
        });

        setSalle({
          name: "",
          capacity: "",
          id: "",
          disposition: "",
          image: "",
          state: "",
        });
        navigate("/salles");
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
                Mettre à jour les informations de la salle {salle.name}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateSalle}
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
                      value={salle.name}
                      onChange={(e) =>
                        setSalle((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={salle.capacity}
                      onChange={(e) =>
                        setSalle((prev) => ({
                          ...prev,
                          capacity: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir la capacité de la salle !
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
                    {dates.length > 0 &&
                      Array.isArray(dates) &&
                      dates.map((range, index) => (
                        <DatePicker
                          key={index}
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner la disponibilité de la salle !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group> */}
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
                      value={salle.disposition}
                      onChange={(e) =>
                        setSalle((prev) => ({
                          ...prev,
                          disposition: e.target.value,
                        }))
                      }
                      required
                    >
                      <option>
                        Selectionner la disposition (forme de la salle)
                      </option>
                      <option value="U">En U</option>
                      <option value="CLASSROOM">Salle de classe</option>
                      <option value="THEATRE">Théâtre</option>
                      <option value="TABLE">
                        En Table (rectangulaire ou ronde)
                      </option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner la disposition de la salle !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Etat de la Salle</Form.Label>
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
                      name="state"
                      value={salle.state}
                      onChange={(e) =>
                        setSalle((prev) => ({ ...prev, state: e.target.value }))
                      }
                      required
                    >
                      <option>Selectionner l'état de la salle</option>
                      <option value="USED">En utilisation</option>
                      <option value="CANCELED">Annulé</option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner l'état de la salle !
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
                      onChange={(e) =>
                        setSalle((prev) => ({
                          ...prev,
                          image: e.target.files[0],
                        }))
                      }
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner l'image de la salle !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <img
                  src={`http://localhost:8000/sallePictures/${salle.image}`}
                  alt="salle"
                  width="50%"
                />
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Modifier
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

export default EditSalle;
