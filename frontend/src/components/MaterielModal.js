import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { GiBuyCard, GiTakeMyMoney } from "react-icons/gi";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";
import FileModal from "./FileModal";
// import Resumable from "resumablejs";

const MaterielModal = ({ show, handleClose }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  // const [quantityAvailable, setQuantityAvailable] = useState("");
  const [cost, setCost] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [supplier, setSupplier] = useState("");
  const [image, setImage] = useState("");
  const [technicalSpecifications, setTechnicalSpecifications] = useState("");
  const [status, setStatus] = useState("");
  const [validated, setValidated] = useState(false);
  const [imageName, setImageName] = useState("");
  const [fileName, setFileName] = useState("");
  const formRef = useRef();
  const [showFileModal, setShowFileModal] = useState(false);
  const [urlFile, setURLfile] = useState(null);
  const [urlimg, setURLimg] = useState(null);
  // const [csrfToken, setCsrfToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleShowFileModal = () => setShowFileModal(true);
  const handleCloseFileModal = () => setShowFileModal(false);

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

  // This function converts a file to a base64 string
  const convertToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => {
      console.error("Error converting file to base64:", error);
    };
  };

  // const handleFileUpload = async () => {
  //   const t = await csrf();

  //   var resumable = new Resumable({
  //     target: `http://localhost:8000/upload-chunk`,
  //     query: { _token: t },
  //     fileType: ["pdf"],
  //     maxFileSize: 10 * 1024 * 1024, // 10 MB
  //     chunkSize: 3 * 1024 * 1024, // 2 MB
  //     testChunks: false,
  //     throttleProgressCallbacks: 1,
  //     headers: {
  //       Accept: "application/json",
  //       "X-CSRF-TOKEN": t,
  //     },
  //   });

  //   resumable.assignBrowse(
  //     document.getElementsByClassName("input-technicalSpecifications")
  //   );

  //   resumable.on("fileAdded", function (file) {
  //     // Show progress bar
  //     document.querySelector(".progress").style.display = "block";
  //     resumable.upload();
  //   });

  //   resumable.on("fileProgress", function (file) {
  //     // Update progress bar
  //     var progress = Math.floor(resumable.progress() * 100);
  //     var progressBar = document.querySelector(".progress-bar");
  //     progressBar.style.width = progress + "%";
  //     progressBar.textContent = progress + "%";
  //   });

  //   resumable.on("fileSuccess", function (file, response) {
  //     // Hide progress bar and show success message
  //     document.querySelector(".progress").style.display = "none";
  //     handleSuccess("Fichier télechargé avec succès !");
  //   });

  //   resumable.on("fileError", function (file, message) {
  //     // Show error message
  //     handleError("Error lors du téléchargement du Fichier !");
  //   });
  // };

  const handleAddMateriel = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(name) ||
        technicalSpecifications.size > 2000000
      ) {
        event.preventDefault();
        event.stopPropagation();
        handleError("Fichier est trop volumineux !");
        setErrorMsg(
          "Fichier est trop volumineux ! La taille maximale est 2MB !"
        );
      }

      setValidated(true);

      // var resumable = new Resumable({
      //   target: `http://localhost:8000/api/add-materiel`,
      //   query: { _token: "csrfToken" },
      //   fileType: ["pdf"],
      //   maxFileSize: 10 * 1024 * 1024, // 10 MB
      //   chunkSize: 2 * 1024 * 1024, // 2 MB
      //   testChunks: false,
      //   throttleProgressCallbacks: 1,
      //   headers: {
      //     Accept: "application/json",
      //     // "X-CSRF-TOKEN": csrfToken,
      //   },
      // });

      // resumable.assignBrowse(
      //   document.getElementsByClassName("input-technicalSpecifications")
      // );

      // resumable.on("fileAdded", function (file) {
      //   // Show progress bar
      //   document.querySelector(".progress").style.display = "block";
      //   resumable.upload();
      // });

      // resumable.on("fileProgress", function (file) {
      //   // Update progress bar
      //   var progress = Math.floor(resumable.progress() * 100);
      //   var progressBar = document.querySelector(".progress-bar");
      //   progressBar.style.width = progress + "%";
      //   progressBar.textContent = progress + "%";
      // });

      // resumable.on("fileSuccess", function (file, response) {
      //   // Hide progress bar and show success message
      //   document.querySelector(".progress").style.display = "none";
      //   handleSuccess("Fichier télechargé avec succès !");
      // });

      // resumable.on("fileError", function (file, message) {
      //   // Show error message
      //   handleError("Error lors du téléchargement du Fichier !");
      // });

      const formData = new FormData();
      formData.append("name", name);
      formData.append("type", type);
      // formData.append("quantityAvailable", quantityAvailable);
      formData.append("cost", cost);
      formData.append("purchaseDate", purchaseDate);
      formData.append("supplier", supplier);
      formData.append("image", image);
      formData.append("technicalSpecifications", technicalSpecifications);
      formData.append("status", status);
      // formData.append("resumable", JSON.stringify(resumable));

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/add-materiel", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Matériel ajoutée avec succès !",
              showConfirmButton: false,
              timer: 2000,
            });

            setName("");
            setType("");
            // setQuantityAvailable("");
            setCost("");
            setPurchaseDate("");
            setSupplier("");
            setImage("");
            setTechnicalSpecifications("");
            setStatus("");

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

          const response = await axios.post("/api/add-materiel", formData, {
            headers: headers,
          });
          console.log(response);
          if (response.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Matériel ajoutée avec succès !",
              showConfirmButton: false,
              timer: 2000,
            });

            setName("");
            setType("");
            // setQuantityAvailable("");
            setCost("");
            setPurchaseDate("");
            setSupplier("");
            setImage("");
            setTechnicalSpecifications("");
            setStatus("");

            handleClose();
          }
        }
      } catch (error) {
        console.log("Error adding a new materiel :", error);
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
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg"
      fullscreen="lg-down"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">
            Formulaire pour ajouter un nouveau Matériel
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddMateriel}
        >
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-laptop text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="name"
                type="text"
                placeholder="Saisir le nom"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nom du matériel !
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
                      className="mdi mdi-settings text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
              >
                <option>Selectionner le type du matériel</option>
                <option value="MatérielInformatique">
                  Matériel Informatique
                </option>
                <option value="MatérielAudioVidéo">
                  Matériel Audio / Vidéo
                </option>
                <option value="Chaise">Chaise</option>
                <option value="Écran">Écran</option>
                <option value="Imprimante">Imprimante</option>
                <option value="Table">Table</option>
                <option value="Projecteur">Projecteur</option>
                <option value="Scanner">Scanner</option>
                <option value="MatérielRéseautage">
                  Matériel de Réseautage
                </option>
                <option value="Accessoires">Accessoires</option>
                <option value="Papier">Papier</option>
                <option value="Stylo">Stylo</option>
                <option value="BlocNotes">BlocNotes</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner le type du matériel !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          {/* <Form.Group className="mb-3">
            <Form.Label>Quantité Disponible</Form.Label>
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
                type="number"
                name="quantityAvailable"
                value={quantityAvailable}
                onChange={(e) => setQuantityAvailable(e.target.value)}
                placeholder="Saisir la quantité disponible"
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la quantité disponible de ce matériel !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group> */}
          <Form.Group className="mb-3">
            <Form.Label>Etat du matériel</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-ev-station text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option>Selectionner l'état du matériel</option>
                <option value="Neuf">Neuf</option>
                <option value="Fonctionnel">Fonctionnel</option>
                <option value="Réparé">Réparé</option>
                <option value="HorsService">Hors Service</option>
                <option value="EnMaintenance">En Maintenance</option>
                <option value="EnAttenteDeRéparation">
                  En Attente De Réparation
                </option>
                <option value="Suffisant">Suffisant</option>
                <option value="À_Réapprovisionner">À Réapprovisionner</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner l'état du matériel !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Date d'achat</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-calendar text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="purchaseDate"
                type="date"
                placeholder="Sélectionner la date d'achat"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner la date d'achat de ce matériel !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cout</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <GiTakeMyMoney
                      style={{ fontSize: "1.5em" }}
                      className="text-primary"
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="cost"
                type="number"
                placeholder="Saisir le cout"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le cout de ce matériel !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Fournisseur</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <GiBuyCard
                      style={{ fontSize: "1.5em" }}
                      className="text-primary"
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="supplier"
                type="text"
                placeholder="Saisir le fournisser"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le fournisser de ce matériel !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
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
                onClick={() => document.querySelector(".input-image").click()}
              >
                <Form.Control
                  hidden
                  name="image"
                  type="file"
                  accept="image/*"
                  placeholder="Sélectionner l'image"
                  onChange={(e) => {
                    setImageName(e.target.files[0].name);
                    setURLimg(URL.createObjectURL(e.target.files[0]));
                    setImage(e.target.files[0]);
                  }}
                  required
                  className="input-image"
                />
                {image && urlimg ? (
                  <img src={urlimg} width={140} height={140} alt={imageName} />
                ) : (
                  <>
                    <MdCloudUpload color="#1475cf" size={60} />
                    <p>Sélectionner l'image de matériel</p>
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
                <span>
                  {imageName} -
                  <MdDelete
                    className="text-primary"
                    style={{ fontSize: "1.2em" }}
                    onClick={() => {
                      setImageName("Aucune image sélectionnée");
                      setImage(null);
                    }}
                  />
                </span>
              </section>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner l'image du matériel !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Spécifications Techniques</Form.Label>
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
                  document
                    .querySelector(".input-technicalSpecifications")
                    .click()
                }
              >
                <Form.Control
                  hidden
                  name="technicalSpecifications"
                  type="file"
                  //   accept=".doc, .docx, .ppt, .pptx, .txt, .pdf"
                  accept=".pdf"
                  placeholder="Sélectionner l'technicalSpecifications"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFileName(file.name);
                      setTechnicalSpecifications(file);
                      convertToBase64(file, (base64) => {
                        setURLfile({ imgUpload: base64, fileType: file.type });
                      });
                      // handleFileUpload();
                      if (file.size > 2000000) {
                        handleError("Fichier est trop volumineux !");
                      }
                    }
                  }}
                  required
                  className="input-technicalSpecifications"
                />
                <Form.Text style={{ color: "#dc3545", fontWeight: "bold" }}>
                  Taille maximale du fichier est 2MB
                </Form.Text>
                <MdCloudUpload color="#1475cf" size={60} />
                <p>Sélectionner les specifications techniques de matériel</p>
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
                      setTechnicalSpecifications(null);
                    }}
                  />
                </span>
              </section>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez sélectionner les Spécifications Techniques du matériel
                au format PDF !
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
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Ajouter
            </Button>
          </div>
        </Form>
        <FileModal
          show={showFileModal}
          handleClose={handleCloseFileModal}
          selectedFile={technicalSpecifications}
          urlFile={urlFile}
        />
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

export default MaterielModal;
