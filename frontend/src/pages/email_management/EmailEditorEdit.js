import React, { useEffect, useRef, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import Swal from "sweetalert2";
import axios from "../../services/axios";
import { BiSolidCategory } from "react-icons/bi";
import { FaMailBulk } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import { MdAttachEmail } from "react-icons/md";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  editEmailTemplate,
  fetchEmailTemplateById,
} from "../../services/EmailTemplateServices";
import { useNavigate, useParams } from "react-router-dom";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";
import "react-toastify/dist/ReactToastify.css";

// let imageAttachement = [];

// class Base64UploadAdapter {
//   constructor(loader) {
//     this.loader = loader;
//   }

//   // Starts the upload process.
//   upload() {
//     return this.loader.file.then((file) => {
//       imageAttachement.push(file);
//       return new Promise((resolve, reject) => {
//         const reader = new FileReader();
//         reader.onload = () => {
//           resolve({ default: reader.result });
//         };
//         reader.onerror = (error) => {
//           reject(error);
//         };
//         reader.readAsDataURL(file);
//       });
//     });
//   }

//   // Aborts the upload process.
//   abort() {
//     console.log("Upload aborted.");
//   }
// }

// function MyCustomUploadAdapterPlugin(editor) {
//   editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
//     return new Base64UploadAdapter(loader);
//   };
// }

function EmailEditorEdit() {
  const [emailTemplate, setEmailTemplate] = useState({
    id: "",
    type: "",
    subject: "",
    content: "",
    imageAttachement: [],
  });
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [showAttachements, setShowAttachements] = useState(false);
  const params = useParams();
  const { id } = params;
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [imagesNames, setImagesNames] = useState([]);
  const [urlimgs, setURLimgs] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmailTemplateById(id).then((res) => {
      setEmailTemplate(res);
      const imageAttachmentsArray = JSON.parse(res.imageAttachement);
      setEmailTemplate((prev) => ({
        ...prev,
        imageAttachement: imageAttachmentsArray,
      }));
    });
  }, [id]);

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    if (data !== emailTemplate.content) {
      setEmailTemplate((prev) => ({
        ...prev,
        content: data,
      }));
    }
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

  const edit = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("emailType", emailTemplate.type);
      formData.append("subject", emailTemplate.subject);
      formData.append("content", emailTemplate.content);
      if (emailTemplate.imageAttachement.length > 0) {
        emailTemplate.imageAttachement.forEach((file, index) => {
          formData.append(`imageAttachement[${index}]`, file);
        });
      }

      setUploading(true);
      try {
        const res = await editEmailTemplate(id, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const { loaded, total } = progressEvent;
            const percent = Math.floor((loaded * 100) / total);
            setUploadProgress(percent);
          },
        });

        if (res) {
          handleSuccess("Modifié avec succès !");
          Swal.fire({
            icon: "success",
            title: "Succès",
            text: "Le modèle d'e-mail a été modifié avec succès !",
          });

          navigate("/email-templates");
        }
      } catch (error) {
        Swal.fire(
          "Error",
          "Echec de la modification du modèle d'e-mail.",
          "error"
        );
      } finally {
        setUploading(false);
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
    const fileToDelete = emailTemplate.imageAttachement[index];
    if (!fileToDelete) {
      console.error("No file to delete at index", index);
      return;
    }

    const updatedAttachments = [...emailTemplate.imageAttachement];
    updatedAttachments.splice(index, 1);
    setEmailTemplate((prev) => ({
      ...prev,
      imageAttachement: updatedAttachments,
    }));

    const formData = new FormData();
    formData.append("deleteImages", JSON.stringify([fileToDelete]));

    if (!localStorage.getItem("token")) {
      const res = await axios.post(
        `/api/delete-images-attachements/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        handleSuccess(res.data.message);
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
        `/api/delete-images-attachements/${id}`,
        formData,
        {
          headers: headers,
        }
      );

      if (response.status === 200) {
        handleSuccess(response.data.message);
      }
    }

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
    setEmailTemplate((prev) => ({
      ...prev,
      imageAttachement: [...prev.imageAttachement, ...files],
    }));
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Formulaire de modification du modèle d'e-mail
              </h4>
              <ToastContainer />
              <Form
                onSubmit={edit}
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
                      value={emailTemplate.type}
                      onChange={(e) =>
                        setEmailTemplate({
                          ...emailTemplate,
                          type: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Sélectionner le type d'e-mail</option>
                      <option value="Convocation">
                        Convocation pour les participants
                      </option>
                      <option value="SessionChanges">
                        Changements dans une session
                      </option>
                      <option value="RegistrationConfirmation">
                        Confirmation d'inscription pour les candidats
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
                      value={emailTemplate.subject}
                      onChange={(e) =>
                        setEmailTemplate({
                          ...emailTemplate,
                          subject: e.target.value,
                        })
                      }
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
                <Form.Group>
                  <Form.Label>Contenu de l'e-mail</Form.Label>
                  <Alert variant="info">
                    Veuillez saisir dans le contenu de l'e-mail les variables
                    qui seront remplacées par des valeurs dynamiques lors de
                    l'envoi de l'e-mail selon cette format :{" "}
                    <b>{"{nomDuVariable}"}</b>
                  </Alert>
                  <InputGroup className="mb-3 d-flex justify-content-center">
                    <div style={{ width: "100%" }}>
                      <Form.Control
                        value={emailTemplate.content}
                        onChange={(e) =>
                          setEmailTemplate({
                            ...emailTemplate,
                            content: e.target.value,
                          })
                        }
                        hidden
                        required
                      />
                      <CKEditor
                        style={{ width: "150%" }}
                        editor={ClassicEditor}
                        data={emailTemplate.content}
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
                </Form.Group>
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
                {emailTemplate.imageAttachement.length > 0 && (
                  <div className="d-flex flex-wrap m-5">
                    {emailTemplate.imageAttachement.map((attachment, index) => (
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
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Mettre à jour
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

export default EmailEditorEdit;