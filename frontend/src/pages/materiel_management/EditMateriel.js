import React, { useEffect, useRef, useState } from "react";
import { Alert, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  editMateriel,
  fetchMaterielById,
} from "../../services/MaterielServices";
import FileModal from "../../components/FileModal";
import { GiBuyCard, GiTakeMyMoney } from "react-icons/gi";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";

const EditMateriel = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [materiel, setMateriel] = useState({
    name: "",
    type: "",
    id: "",
    // quantityAvailable: "",
    status: "",
    cost: "",
    supplier: "",
    purchaseDate: "",
    image: "",
    technicalSpecifications: "",
  });
  const [imageName, setImageName] = useState("");
  const [fileName, setFileName] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  const [urlFile, setURLfile] = useState(null);
  const [urlimg, setURLimg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleShowFileModal = () => setShowFileModal(true);
  const handleCloseFileModal = () => setShowFileModal(false);

  useEffect(() => {
    const fetchmateriel = async () => {
      const materielData = await fetchMaterielById(id);
      setMateriel(materielData);
    };

    if (id) {
      fetchmateriel();
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

  const handleUpdateMateriel = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (
        form.checkValidity() === false ||
        isWhitespace(materiel.name) ||
        materiel.technicalSpecifications.size > 2000000
      ) {
        event.preventDefault();
        event.stopPropagation();
        handleError("Fichier est trop volumineux !");
        setErrorMsg(
          "Fichier est trop volumineux ! La taille maximale est 2MB !"
        );
      }

      if (materiel.technicalSpecifications.size <= 2000000) {
        setValidated(true);

        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("name", materiel.name);
        formData.append("type", materiel.type);
        // formData.append("quantityAvailable", materiel.quantityAvailable);
        formData.append("cost", materiel.cost);
        formData.append("purchaseDate", materiel.purchaseDate);
        formData.append("supplier", materiel.supplier);
        formData.append("status", materiel.status);
        formData.append("image", materiel.image);
        formData.append(
          "technicalSpecifications",
          materiel.technicalSpecifications
        );

        const res = await editMateriel(id, formData);

        if (res.status === 200) {
          Swal.fire({
            icon: "success",
            title: "Materiel modifiée avec succès !",
            showConfirmButton: false,
            timer: 1500,
          });

          setMateriel({
            name: "",
            type: "",
            id: "",
            // quantityAvailable: "",
            status: "",
            cost: "",
            supplier: "",
            purchaseDate: "",
            image: "",
            technicalSpecifications: "",
          });
          navigate("/materiaux");
        }
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

  const convertToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => {
      console.error("Error converting file to base64:", error);
    };
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Mettre à jour les informations du materiel {materiel.name}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateMateriel}
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
                      value={materiel.name}
                      onChange={(e) =>
                        setMateriel((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={materiel.type}
                      onChange={(e) =>
                        setMateriel((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={materiel.quantityAvailable}
                      onChange={(e) =>
                        setMateriel((prev) => ({
                          ...prev,
                          quantityAvailable: e.target.value,
                        }))
                      }
                      placeholder="Saisir la quantité disponible"
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={materiel.status}
                      onChange={(e) =>
                        setMateriel((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
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
                      <option value="À_Réapprovisionner">
                        À Réapprovisionner
                      </option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={materiel.purchaseDate}
                      onChange={(e) =>
                        setMateriel((prev) => ({
                          ...prev,
                          purchaseDate: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={materiel.cost}
                      onChange={(e) =>
                        setMateriel((prev) => ({
                          ...prev,
                          cost: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      value={materiel.supplier}
                      onChange={(e) =>
                        setMateriel((prev) => ({
                          ...prev,
                          supplier: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                      onClick={() =>
                        document.querySelector(".input-image").click()
                      }
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
                          setMateriel((prev) => ({
                            ...prev,
                            image: e.target.files[0],
                          }));
                        }}
                        required
                        className="input-image"
                      />
                      {materiel.image && urlimg ? (
                        <img
                          src={urlimg}
                          width={140}
                          height={140}
                          alt={imageName}
                        />
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
                            setMateriel((prev) => ({ ...prev, image: null }));
                          }}
                        />
                      </span>
                    </section>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                            setMateriel((prev) => ({
                              ...prev,
                              technicalSpecifications: e.target.files[0],
                            }));
                            convertToBase64(file, (base64) => {
                              setURLfile({
                                imgUpload: base64,
                                fileType: file.type,
                              });
                            });
                            if (file.size > 2000000) {
                              handleError("Fichier est trop volumineux !");
                            }
                          }
                        }}
                        required
                        className="input-technicalSpecifications"
                      />
                      <Form.Text
                        style={{ color: "#dc3545", fontWeight: "bold" }}
                      >
                        Taille maximale du fichier est 2MB
                      </Form.Text>
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez sélectionner les Spécifications Techniques du
                        matériel au format PDF !
                      </Form.Control.Feedback>
                      <MdCloudUpload color="#1475cf" size={60} />
                      <p>
                        Sélectionner les specifications techniques de matériel
                      </p>
                    </div>
                    <div className="d-flex flex-column">
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
                              setMateriel((prev) => ({
                                ...prev,
                                technicalSpecifications: null,
                              }));
                            }}
                          />
                        </span>
                        <Button
                          onClick={handleShowFileModal}
                          className="btn btn-inverse-info btn-icon mx-2"
                        >
                          <i
                            className="mdi mdi-eye text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </Button>
                      </section>
                      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                    </div>
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
                    Mettre à jour
                  </Button>
                </div>
              </Form>
              <FileModal
                show={showFileModal}
                handleClose={handleCloseFileModal}
                selectedFile={materiel.technicalSpecifications}
                urlFile={urlFile}
              />
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditMateriel;
