import React, { useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { FaPlusCircle, FaQuestionCircle } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { RiSurveyLine } from "react-icons/ri";
import Spinner from "../../components/Spinner";

function GoogleSurveyCreator() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([""]);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  // const [theme, setTheme] = useState({
  //   backgroundColor: "#ffffff",
  //   headerImage: "",
  //   textStyle: "Normal",
  // });
  const [loading, setLoading] = useState(false);

  const updateQuestion = (index, key, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [key]: value };
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { type: "text", title: "", options: [], rows: [], columns: [] },
    ]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("questions", JSON.stringify(questions));
      // formData.append("theme", theme);

      if (!localStorage.getItem("token")) {
        const res = await axios.post(
          `http://localhost:8000/api/proxy`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res) {
          setLoading(false)
          handleSuccess("Modèle du formulaire crée !");
          Swal.fire({
            icon: "success",
            title: "Modèle du formulaire crée avec succès !",
            showConfirmButton: false,
            timer: 1500,
          });
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
          `http://localhost:8000/api/proxy`,
          formData,
          {
            headers: headers,
          }
        );

        if (response) {
          setLoading(false)
          handleSuccess("Modèle du formulaire crée !");
          Swal.fire({
            icon: "success",
            title: "Modèle du formulaire crée !",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    } catch (error) {
      console.error("Error creating form:", error);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              {loading ? <Spinner /> : null}
              <h4 className="card-title mb-5 mt-2">
                Formulaire de création du modèle de questionnaire d'évaluation
                du session de formation
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleSubmit}
              >
                <Form.Group className="mb-3">
                  <Form.Label>Titre du questionnaire</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <RiSurveyLine
                            className="text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      name="title"
                      type="text"
                      placeholder="Saisir le titre du formulaire"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le titre du formulaire !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Question(s)</Form.Label>
                  {questions.map((question, index) => (
                    <InputGroup className="mb-3" key={index}>
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <FaQuestionCircle
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Select
                        value={question.type}
                        onChange={(e) =>
                          updateQuestion(index, "type", e.target.value)
                        }
                      >
                        <option value="text">Réponse courte</option>
                        <option value="paragraph">Paragraphe</option>
                        <option value="choice">Choix multiple</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="dropdown">Dropdown</option>
                        {/* <option value="file">File Upload</option> */}
                        <option value="scale">Echelle</option>
                        <option value="grid">Grille</option>
                        {/* <option value="date">Date</option>
                        <option value="time">Time</option> */}
                      </Form.Select>
                      <Form.Control
                        type="text"
                        placeholder="Question"
                        value={question.title}
                        onChange={(e) =>
                          updateQuestion(index, "title", e.target.value)
                        }
                      />
                      {question.type === "choice" && (
                        <Form.Control
                          type="text"
                          placeholder="Options (séparés par des virgules)"
                          value={question.options.join(",")}
                          onChange={(e) =>
                            updateQuestion(
                              index,
                              "options",
                              e.target.value.split(",")
                            )
                          }
                        />
                      )}
                      {question.type === "grid" && (
                        <>
                          <Form.Control
                            type="text"
                            placeholder="Lignes (séparés par des virgules)"
                            value={question.rows.join(",")}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "rows",
                                e.target.value.split(",")
                              )
                            }
                          />
                          <Form.Control
                            type="text"
                            placeholder="Colonnes (séparés par des virgules)"
                            value={question.columns.join(",")}
                            onChange={(e) =>
                              updateQuestion(
                                index,
                                "columns",
                                e.target.value.split(",")
                              )
                            }
                          />
                        </>
                      )}
                      {/* <Form.Control
                        type="text"
                        placeholder={`Saisir le question numéro : ${index + 1}`}
                        value={question}
                        onChange={(e) => handleQuestionChange(index, e)}
                        required
                      /> */}
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir la ou les question(s) du formulaire !
                      </Form.Control.Feedback>
                      {index !== 0 && (
                        <Button
                          onClick={() => removeQuestion(index)}
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
                    onClick={addQuestion}
                  >
                    Ajouter un question <FaPlusCircle size={25} />
                  </Button>
                </div>
                {/* <div>
                  <label>Background Color:</label>
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) =>
                      handleThemeChange("backgroundColor", e.target.value)
                    }
                  />
                  <label>Header Image URL:</label>
                  <input
                    type="text"
                    placeholder="Header Image URL"
                    value={theme.headerImage}
                    onChange={(e) =>
                      handleThemeChange("headerImage", e.target.value)
                    }
                  />
                </div> */}
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Enregistrer
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
}

export default GoogleSurveyCreator;
