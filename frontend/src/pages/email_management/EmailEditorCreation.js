import React, { useEffect, useRef, useState } from "react";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "../../services/axios";
import { BiSolidCategory } from "react-icons/bi";
import { FaMailBulk } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { MdAttachEmail, MdCloudUpload, MdDelete } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { EmailEditor } from "react-email-editor";
import { fetchAllVariables } from "../../services/VariableServices";
import { PiTableLight } from "react-icons/pi";
import { AiFillFileImage } from "react-icons/ai";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

function EmailEditorCreation() {
  const [editorData, setEditorData] = useState("");
  const [emailType, setEmailType] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [imageAttachements, setImageAttachements] = useState([]);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [showAttachements, setShowAttachements] = useState(false);
  const navigate = useNavigate();
  const emailEditorRef = useRef(null);
  // const [preview, setPreview] = useState(false);
  const [variables, setVariables] = useState([]);
  const [variableTemplates, setVariableTemplates] = useState([]);
  const [imagesNames, setImagesNames] = useState([]);
  const [urlimgs, setURLimgs] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAllVariables().then(setVariableTemplates);
  }, []);

  const saveDesignJson = () => {
    const unlayer = emailEditorRef.current?.editor;

    unlayer?.saveDesign((design) => {
      console.log("saveDesign", design);
      alert("Design JSON has been logged in your developer console.");
    });
  };

  const saveDesignHtml = () => {
    emailEditorRef.current.editor.saveDesign((data) => {
      const { body } = data;
      if (data) {
        setContent(JSON.stringify(data));
      }
    });

    emailEditorRef.current.editor.exportHtml((data) => {
      const { design, html } = data;
      if (html) {
        setHtmlContent(html);
      }
    });
  };

  // const togglePreview = () => {
  //   const unlayer = emailEditorRef.current?.editor;

  //   if (preview) {
  //     unlayer?.hidePreview();
  //     setPreview(false);
  //   } else {
  //     unlayer?.showPreview("desktop");
  //     setPreview(true);
  //   }
  // };

  const onDesignLoad = (data) => {
    console.log("onDesignLoad", data);
  };

  const onReady = (unlayer) => {
    console.log("onReady", unlayer);
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

  const saveEmailTemplate = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      saveDesignHtml();

      const formData = new FormData();
      formData.append("emailType", emailType);
      formData.append("subject", subject);
      formData.append("content", content);
      formData.append("htmlContent", htmlContent);
      if (imageAttachements.length > 0) {
        const filesArray = Array.from(imageAttachements);
        filesArray.forEach((file, index) => {
          formData.append(`imageAttachement[${index}]`, file);
        });
      }
      formData.append("variable_ids", JSON.stringify(variables));

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/add-email-template", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            handleSuccess(res.data.message);
            Swal.fire(
              "Success",
              "Modèle d'e-mail enregistré avec succès !",
              "success"
            );

            setEditorData("");
            setEmailType("");
            setSubject("");
            setContent("");

            navigate("/email-templates");
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
            "/api/add-email-template",
            formData,
            {
              headers: headers,
            }
          );

          if (response.status === 201) {
            handleSuccess(response.data.message);
            Swal.fire(
              "Success",
              "Modèle d'e-mail enregistré avec succès !",
              "success"
            );

            setEditorData("");
            setEmailType("");
            setSubject("");
            setContent("");

            navigate("/email-templates");
          }
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Echec de l'enregistrement du modèle d'e-mail.",
          "error"
        );
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

  const handleDeleteAttachment = async (index) => {
    const fileToDelete = imageAttachements[index];
    if (!fileToDelete) {
      console.error("No file to delete at index", index);
      return;
    }

    const updatedAttachments = [...imageAttachements];
    updatedAttachments.splice(index, 1);
    setImageAttachements(updatedAttachments);

    const newImageNames = [...imagesNames];
    newImageNames.splice(index, 1);
    setImagesNames(newImageNames);

    const newUrls = [...urlimgs];
    newUrls.splice(index, 1);
    setURLimgs(newUrls);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImageNames = files.map((file) => file.name);
    const newUrls = files.map((file) => URL.createObjectURL(file));

    setImagesNames((prevNames) => [...prevNames, ...newImageNames]);
    setURLimgs((prevUrls) => [...prevUrls, ...newUrls]);
    if (imageAttachements?.length > 0) {
      setImageAttachements([...imageAttachements, ...files]);
    } else {
      setImageAttachements([...files]);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Etapes de création d'un nouvel modèle d'e-mail
              </h4>
              <ToastContainer />
              <Form
                onSubmit={saveEmailTemplate}
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
              >
                <Form.Group>
                  <Form.Label>Type d'e-mail</Form.Label>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <BiSolidCategory
                            style={{ fontSize: "1.5em" }}
                            className="text-primary"
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Select
                      value={emailType}
                      onChange={(e) => setEmailType(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner le type d'e-mail</option>
                      <option value="Convocation">
                        Convocation pour les participants
                      </option>
                      <option value="SessionChanges">
                        Changements dans une session
                      </option>
                      <option value="TrainerConfirmation">
                        Confirmation des formateurs
                      </option>
                      <option value="EvaluationLink">
                        Lien d'évaluation de la session
                      </option>
                      <option value="Thanking">Mail de remerciement</option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez sélectionner le type de modèle de l'e-mail !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Objet de l'e-mail</Form.Label>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <FaMailBulk
                            style={{ fontSize: "1.5em" }}
                            className="text-primary"
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Saisir l'objet de l'e-mail"
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir l'objet de l'e-mail !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Alert variant="info">
                  Veuillez saisir dans le contenu de l'e-mail les variables qui
                  seront remplacées par des valeurs dynamiques lors de l'envoi
                  de l'e-mail selon cette format : <b>{"{nomDuVariable}"}</b>
                </Alert>
                <Form.Group className="mb-3">
                  <Form.Label>Variables</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <i className="text-primary">
                            <PiTableLight size={30} />
                          </i>
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Select
                      multiple
                      name="variables"
                      value={variables}
                      onChange={(e) =>
                        setVariables(
                          [...e.target.selectedOptions].map((o) => o.value)
                        )
                      }
                      required
                    >
                      <option value="">
                        Selectionner les variables liée à ce document
                      </option>
                      {variableTemplates.length > 0 &&
                        variableTemplates.map((variable) => (
                          <option value={variable.id}>
                            {variable.variable_name}
                          </option>
                        ))}
                    </Form.Select>
                  </InputGroup>
                  <Link to="/templates-variables">
                    <Button className="btn-inverse-primary">
                      Ajouter nouvelle variable
                    </Button>
                  </Link>
                </Form.Group>
                <div className="my-3">
                  {variables.length > 0 && variableTemplates.length > 0 && (
                    <div> Variables séléctionnées :
                      {variableTemplates.map((v) => {
                        const found = variables.find((varItem) => varItem == v.id);
                        return found ? <span key={v.id}>{"{"}{v.variable_name}{"}"} - </span> : null;
                      })}
                    </div>
                  )}
                </div>
                <EmailEditor
                  ref={emailEditorRef}
                  // onLoad={()=>onLoad(<div>tempalte</div>)}
                  onReady={onReady}
                  options={{
                    projectId: 239297,
                    version: "latest",
                    appearance: {
                      theme: "modern_light",
                    },
                    tools: {
                      button: {
                        enabled: true,
                        properties: {
                          link: {
                            defaultValue:
                              "http://localhost:8000/api/track-click",
                          },
                        },
                      },
                    },
                  }}
                />
                {/* <Form.Group>
                  <Form.Label>Contenu de l'e-mail</Form.Label>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <div style={{ width: "100%" }}>
                      <Form.Control
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        hidden
                        required
                      />
                      <CKEditor
                        style={{ width: "150%" }}
                        editor={ClassicEditor}
                        data={editorData}
                        onChange={handleEditorChange}
                        config={{
                          // extraPlugins: [MyCustomUploadAdapterPlugin],
                          toolbar: [
                            "undo",
                            "redo",
                            "|",
                            "heading",
                            "bold",
                            "italic",
                            "underline",
                            "strikethrough",
                            "link",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "outdent",
                            "indent",
                            "|",
                            // "imageUpload",
                            "blockQuote",
                            "insertTable",
                            // "mediaEmbed",
                            // "|",
                            // "emoji",
                            // "resizeImage",
                          ],
                        }}
                      />
                    </div>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le contenu de l'e-mail !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group> */}
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    className="btn btn-block btn-inverse-primary btn-lg font-weight-medium auth-form-btn"
                    onClick={() => setShowAttachements(!showAttachements)}
                  >
                    Ajouter des pièces jointes <MdAttachEmail size={20} />
                  </Button>
                </div>
                {showAttachements && (
                  <Form.Group className="mt-3">
                    <Form.Label>
                      Sélectionner la ou les pièce(s) jointe(s)
                    </Form.Label>
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
                          document.querySelector(".input-image").click()
                        }
                      >
                        <Form.Control
                          multiple
                          hidden
                          type="file"
                          accept="image/*"
                          placeholder="Sélectionner l'image"
                          onChange={handleImageChange}
                          className="input-image"
                        />
                        {imagesNames.length > 0 ? (
                          <div className="d-flex flex-wrap">
                            {imagesNames.map((name, index) => (
                              <div key={index} className="m-2">
                                <img
                                  src={urlimgs[index]}
                                  alt={`Attachment ${index}`}
                                  style={{ width: "100px", height: "100px" }}
                                />
                                <p>{name}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            <MdCloudUpload color="#1475cf" size={60} />
                            <p>
                              Sélectionner une ou plusieurs pièce(s) jointe(s)
                            </p>
                          </>
                        )}
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
                        {imagesNames.length > 0 &&
                          imagesNames.map((imageName, i) => (
                            <div key={i}>
                              {imageName} -
                              <MdDelete
                                className="text-primary"
                                style={{ fontSize: "1.2em" }}
                                onClick={() => handleDeleteAttachment(i)}
                              />
                            </div>
                          ))}
                      </section>
                    </InputGroup>
                    {uploading && (
                      <div
                        className="d-flex justify-content-center mt-3"
                        style={{ width: 200, height: 200 }}
                      >
                        <CircularProgressbar
                          value={uploadProgress}
                          text={`${uploadProgress}%`}
                          styles={buildStyles({
                            textColor: "#1475cf",
                            pathColor: "#1475cf",
                          })}
                        />
                      </div>
                    )}
                  </Form.Group>
                )}
                {imageAttachements?.length > 0 && (
                  <div className="d-flex flex-wrap m-5">
                    {imageAttachements.map((attachment, index) => (
                      <div key={index} className="m-2">
                        <img
                          src={`http://localhost:8000/emailAttachements/${attachment}`}
                          alt={`Attachment ${index}`}
                          style={{ width: "100px", height: "100px" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteAttachment(index)}
                          className="btn btn-icon btn-inverse-danger btn-sm"
                        >
                          <MdDelete size={22} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* {showAttachements && (
                  <Form.Group className="mt-3">
                    <Form.Label>
                      Sélectionner la ou les pièce(s) jointe(s)
                    </Form.Label>
                    <InputGroup className="mb-3 d-flex justify-content-center">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setImageAttachements(e.target.files);
                        }}
                        multiple
                      />
                    </InputGroup>
                  </Form.Group>
                )} */}
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Enregister
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailEditorCreation;
