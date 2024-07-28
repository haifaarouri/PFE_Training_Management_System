import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, InputGroup, Alert } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { FaBook } from "react-icons/fa";
import { MdDescription, MdOutlineAbc } from "react-icons/md";
import { IoPeople, IoPricetags } from "react-icons/io5";
import { TbCategoryFilled, TbListCheck } from "react-icons/tb";
import { fetchAllCategories } from "../services/FormationServices";
import { FaPlusCircle } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaCalendarDays } from "react-icons/fa6";
import { PiCertificateDuotone } from "react-icons/pi";
import { GrPlan } from "react-icons/gr";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import { AiFillFileImage } from "react-icons/ai";
import FileModal from "./FileModal";

const FormationModal = ({ show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSousCategory, setNewSousCategory] = useState("");
  const [formData, setFormData] = useState({
    reference: "",
    entitled: "",
    description: "",
    numberOfDays: "",
    personnesCible: "",
    price: "",
    certificationOrganization: "",
    categorieId: "",
    sousCategorieId: "",
    categorie_name: "",
    sous_categorie_name: "",
    programme: {
      title: "",
      jours: [
        {
          dayName: "",
          sousParties: [
            {
              description: "",
            },
          ],
        },
      ],
    },
  });
  const [requirements, setRequirements] = useState([""]);
  const [fileName, setFileName] = useState("");
  const [showFileModal, setShowFileModal] = useState(false);
  const [urlFile, setURLfile] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [courseMaterial, setCourseMaterial] = useState("");

  const handleShowFileModal = () => setShowFileModal(true);
  const handleCloseFileModal = () => setShowFileModal(false);

  const convertToBase64 = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => callback(reader.result);
    reader.onerror = (error) => {
      console.error("Error converting file to base64:", error);
    };
  };

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  useEffect(() => {
    let f = async () => {
      let cats = await fetchAllCategories();
      setCategories(cats);
    };

    f();
  }, []);

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

  const handleAddFormation = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      if (typeof courseMaterial === "object" && courseMaterial.size > 2000000) {
        event.preventDefault();
        event.stopPropagation();
        handleError("Fichier est trop volumineux !");
        setErrorMsg(
          "Fichier est trop volumineux ! La taille maximale est 2MB !"
        );
      }

      setValidated(true);

      const formDataToken = new FormData();
      formDataToken.append("reference", formData.reference);
      formDataToken.append("entitled", formData.name);
      formDataToken.append("description", formData.description);
      formDataToken.append("numberOfDays", formData.numberOfDays);
      formDataToken.append("personnesCible", formData.personnesCible);
      formDataToken.append("price", formData.price);
      formDataToken.append(
        "certificationOrganization",
        formData.certificationOrganization
      );
      formDataToken.append("courseMaterial", courseMaterial);
      formDataToken.append(
        "categorie_name",
        newCategory ? newCategory : formData.categorie_name
      );
      formDataToken.append(
        "sous_categorie_name",
        newSousCategory ? newSousCategory : formData.sous_categorie_name
      );
      formDataToken.append("sous_categorie_id", formData.sousCategorieId);
      formDataToken.append("requirements", JSON.stringify(requirements));
      formDataToken.append(
        "programme",
        JSON.stringify({
          title: formData.programme.title,
          jours: formData.programme.jours.map((jour) => ({
            dayName: jour.dayName,
            sousParties: jour.sousParties.map((sousPartie) => ({
              description: sousPartie.description,
            })),
          })),
        })
      );

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/add-formation", formDataToken, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Formation ajoutée avec succès !",
              showConfirmButton: false,
              timer: 1500,
            });

            setFormData({
              reference: "",
              entitled: "",
              description: "",
              numberOfDays: "",
              personnesCible: "",
              price: "",
              certificationOrganization: "",
              categorieId: "",
              sousCategorieId: "",
              categorie_name: "",
              sous_categorie_name: "",
              programme: {
                title: "",
                jours: [],
              },
            });
            setNewCategory("");
            setNewSousCategory("");
            setRequirements([""]);
            setCourseMaterial("");

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
            "/api/add-formation",
            formDataToken,
            {
              headers: headers,
            }
          );

          if (response.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Formation ajoutée avec succès !",
              showConfirmButton: false,
              timer: 2000,
            });

            setFormData({
              reference: "",
              entitled: "",
              description: "",
              numberOfDays: "",
              personnesCible: "",
              price: "",
              certificationOrganization: "",
              categorieId: "",
              sousCategorieId: "",
              categorie_name: "",
              sous_categorie_name: "",
              programme: {
                title: "",
                jours: [],
              },
            });
            setNewCategory("");
            setNewSousCategory("");
            setRequirements([""]);
            setCourseMaterial("");

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

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;
    const selectedCategory = categories.find(
      (category) => String(category.id) === categoryId
    );

    setFormData((prevState) => ({
      ...prevState,
      categorieId: categoryId,
      categorie_name: selectedCategory ? selectedCategory.categorie_name : "",
    }));

    if (categoryId !== "" && categoryId !== "newCategory") {
      // Fetch sous-categories based on selected category
      if (!localStorage.getItem("token")) {
        const res = await axios.get(`/api/sous-category/${categoryId}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        setSousCategories(res.data);
      } else {
        const headers = {
          "Content-Type": "application/json",
        };

        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const response = await axios.get(`/api/sous-category/${categoryId}`, {
          headers,
        });
        setSousCategories(response.data);
      }
    }
  };

  const handleSousCategoryChange = (e) => {
    const sousCategoryId = e.target.value;
    const selectedSousCategory = sousCategories.find(
      (sousCategory) => String(sousCategory.id) === sousCategoryId
    );

    setFormData((prevState) => ({
      ...prevState,
      sousCategorieId: sousCategoryId,
      sous_categorie_name: selectedSousCategory
        ? selectedSousCategory.sous_categorie_name
        : "",
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleNewCategoryChange = (e) => {
    setNewCategory(e.target.value);
  };

  const handleNewSousCategoryChange = (e) => {
    setNewSousCategory(e.target.value);
  };

  const addRequirement = () => {
    setRequirements([...requirements, ""]);
  };

  const removeRequirement = (index) => {
    if (index !== 0) {
      const newrequirements = [...requirements];
      newrequirements.splice(index, 1);
      setRequirements(newrequirements);
    }
  };

  const handleChangeRequirement = (index, event) => {
    const newrequirements = [...requirements];
    newrequirements[index] = event.target.value;
    setRequirements(newrequirements);
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
            Formulaire pour ajouter une nouvelle Formation
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddFormation}
        >
          <Form.Group className="mb-3">
            <Form.Label>Réference</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <MdOutlineAbc
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="reference"
                type="text"
                placeholder="Saisir la reférence de la formation"
                value={formData.reference}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la réference de la formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Titre</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaBook
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="name"
                type="text"
                placeholder="Saisir le titre de la formation"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le titre de la formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <MdDescription
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
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
                Veuillez saisir la description de la formation!
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de jours</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <FaCalendarDays
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="numberOfDays"
                type="text"
                placeholder="Saisir le nombre de jours de cette formation"
                value={formData.numberOfDays}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nombre de jours de cette formation!
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Personnes Cibles</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <IoPeople
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="personnesCible"
                type="text"
                placeholder="Saisir les personnes cibles de la formation"
                value={formData.personnesCible}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir les personnes cibles de la formationr !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Prix</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <IoPricetags
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="price"
                type="number"
                placeholder="Saisir le prix de cette formation"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le prix de la formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nom de l'organisme de certification</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <PiCertificateDuotone
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                name="certificationOrganization"
                type="text"
                placeholder="Saisir le nom de l'organisme de certification"
                value={formData.certificationOrganization}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le nom de l'organisme de certification de cette
                formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Support du cours</Form.Label>
            <InputGroup className="mb-3 d-flex flex-column justify-content-center">
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
                  name="courseMaterial"
                  type="file"
                  accept=".pdf"
                  placeholder="Sélectionner le support du cours"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFileName(file.name);
                      setCourseMaterial(file);
                      convertToBase64(file, (base64) => {
                        setURLfile({ imgUpload: base64, fileType: file.type });
                      });
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
                <p>Sélectionner le Support du cours de cette formation</p>
              </div>
              <section
                className="d-flex justify-content-center align-items-center"
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
                      setCourseMaterial(null);
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
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez Séléctionner le Support du cours de cette formation !
              </Form.Control.Feedback>
            </InputGroup>
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
          </Form.Group>
          <FileModal
            show={showFileModal}
            handleClose={handleCloseFileModal}
            selectedFile={courseMaterial}
            urlFile={urlFile}
          />
          <Form.Group className="mb-3">
            <Form.Label>Prérequis</Form.Label>
            {requirements.map((requirement, index) => (
              <InputGroup className="mb-3" key={index}>
                <InputGroup.Text id="inputGroup-sizing-default">
                  <div className="input-group-prepend bg-transparent">
                    <span className="input-group-text bg-transparent border-right-0">
                      <TbListCheck
                        className="text-primary"
                        style={{ fontSize: "1.5em" }}
                      />
                    </span>
                  </div>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Saisir le prérequis pour cette formation"
                  value={requirement}
                  onChange={(e) => handleChangeRequirement(index, e)}
                  required
                />
                <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  Veuillez saisir le ou les prérequis pour cette formation !
                </Form.Control.Feedback>
                {index !== 0 && (
                  <Button
                    onClick={() => removeRequirement(index)}
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
              onClick={addRequirement}
            >
              Ajouter un prérequis <FaPlusCircle size={25} />
            </Button>
          </div>
          <Form.Group className="mb-3">
            <Form.Label>Catégorie</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <TbCategoryFilled
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="categorieId"
                value={formData.categorieId}
                onChange={handleCategoryChange}
                required
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categorie_name}
                  </option>
                ))}
                <option value="newCategory">
                  Ajouter une nouvelle catégorie
                </option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la catégorie de la formation !
              </Form.Control.Feedback>
            </InputGroup>
            {formData.categorieId === "newCategory" && (
              <Form.Control
                type="text"
                placeholder="Nouvelle catégorie"
                value={newCategory}
                onChange={handleNewCategoryChange}
                required
              />
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Sous Catégorie</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <TbCategoryFilled
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="sousCategorieId"
                value={formData.sousCategorieId}
                onChange={handleSousCategoryChange}
                required
              >
                <option value="">Sélectionnez une sous-catégorie</option>
                {sousCategories.length > 0 &&
                  sousCategories.map((sousCategorie) => (
                    <option key={sousCategorie.id} value={sousCategorie.id}>
                      {sousCategorie.sous_categorie_name}
                    </option>
                  ))}
                <option value="newSubCategory">
                  Ajouter une nouvelle sous-catégorie
                </option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la sous catégorie de la formation !
              </Form.Control.Feedback>
            </InputGroup>
            {formData.sousCategorieId === "newSubCategory" && (
              <Form.Control
                type="text"
                placeholder="Nouvelle sous catégorie"
                value={newSousCategory}
                onChange={handleNewSousCategoryChange}
                required
              />
            )}
          </Form.Group>
          <div>
            <Form.Group>
              <Form.Label>Programme de la formation</Form.Label>
              <InputGroup className="mb-3">
                <InputGroup.Text id="inputGroup-sizing-default">
                  <div className="input-group-prepend bg-transparent">
                    <span className="input-group-text bg-transparent border-right-0">
                      <GrPlan
                        className="text-primary"
                        style={{ fontSize: "1.5em" }}
                      />
                    </span>
                  </div>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Saisir titre du programme"
                  value={formData.programme.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      programme: {
                        ...formData.programme,
                        title: e.target.value,
                      },
                    })
                  }
                />
                <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
                <Form.Control.Feedback type="invalid">
                  Veuillez saisir le ou les sous parties pour cette formation !
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            {formData.programme.jours.map((jour, jourIndex) => (
              <div key={jourIndex}>
                <Form.Group>
                  <Form.Label>Jour</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <TbListCheck
                            className="text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Saisir le nom du jour"
                      value={jour.dayName || ""}
                      onChange={(e) => {
                        const updatedJours = formData.programme.jours.map(
                          (j, idx) =>
                            idx === jourIndex
                              ? { ...j, dayName: e.target.value }
                              : j
                        );
                        setFormData({
                          ...formData,
                          programme: {
                            ...formData.programme,
                            jours: updatedJours,
                          },
                        });
                      }}
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le ou les jours pour cette formation !
                    </Form.Control.Feedback>
                    <Button
                      onClick={() => {
                        const updatedJours = [...formData.programme.jours];
                        updatedJours.splice(jourIndex, 1);
                        setFormData({
                          ...formData,
                          programme: {
                            ...formData.programme,
                            jours: updatedJours,
                          },
                        });
                      }}
                      className="btn btn-info btn-rounded btn-inverse-danger"
                    >
                      <MdDeleteForever size={30} />
                    </Button>
                  </InputGroup>
                </Form.Group>
                {jour.sousParties.map((sousPartie, sousPartieIndex) => (
                  <Form.Group key={sousPartieIndex}>
                    <Form.Label>SousPartie Detail</Form.Label>
                    <InputGroup className="mb-3">
                      <InputGroup.Text id="inputGroup-sizing-default">
                        <div className="input-group-prepend bg-transparent">
                          <span className="input-group-text bg-transparent border-right-0">
                            <TbListCheck
                              className="text-primary"
                              style={{ fontSize: "1.5em" }}
                            />
                          </span>
                        </div>
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Saisir description de la sous partie"
                        value={sousPartie.description || ""}
                        onChange={(e) => {
                          const newDescription = e.target.value; // Get the new description from the event
                          const updatedJours = formData.programme.jours.map(
                            (currentJour, currentJourIndex) => {
                              if (currentJourIndex === jourIndex) {
                                // Check if this is the jour being edited
                                return {
                                  ...currentJour,
                                  sousParties: currentJour.sousParties.map(
                                    (sp, spIdx) => {
                                      if (spIdx === sousPartieIndex) {
                                        // Check if this is the sousPartie being edited
                                        return {
                                          ...sp,
                                          description: newDescription,
                                        }; // Update the description
                                      }
                                      return sp; // Return unmodified sousPartie
                                    }
                                  ),
                                };
                              }
                              return currentJour; // Return unmodified jour
                            }
                          );

                          setFormData({
                            ...formData,
                            programme: {
                              ...formData.programme,
                              jours: updatedJours,
                            },
                          });
                        }}
                      />
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir le ou les sous parties pour cette
                        formation !
                      </Form.Control.Feedback>
                      <Button
                        className="btn btn-info btn-rounded btn-inverse-danger"
                        onClick={() => {
                          const updatedSousParties = [...jour.sousParties];
                          updatedSousParties.splice(sousPartieIndex, 1);
                          const updatedJours = formData.programme.jours.map(
                            (currentJour, currentJourIndex) =>
                              currentJourIndex === jourIndex
                                ? {
                                    ...currentJour,
                                    sousParties: updatedSousParties,
                                  }
                                : currentJour
                          );
                          setFormData({
                            ...formData,
                            programme: {
                              ...formData.programme,
                              jours: updatedJours,
                            },
                          });
                        }}
                      >
                        <MdDeleteForever size={30} />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                ))}
                <div className="d-flex justify-content-end">
                  <Button
                    className="mb-3 mt-0 btn btn-info btn-rounded btn-inverse-info"
                    onClick={() => {
                      const newSousPartie = { description: "" }; // Ensure this matches your model structure
                      const updatedSousParties = [
                        ...jour.sousParties,
                        newSousPartie,
                      ];
                      const updatedJours = formData.programme.jours.map(
                        (j, idx) =>
                          idx === jourIndex
                            ? { ...j, sousParties: updatedSousParties }
                            : j
                      );
                      setFormData({
                        ...formData,
                        programme: {
                          ...formData.programme,
                          jours: updatedJours,
                        },
                      });
                    }}
                  >
                    Ajouter une sous-partie <FaPlusCircle size={25} />
                  </Button>
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-end">
              <Button
                className="mb-3 mt-0 btn btn-info btn-rounded btn-inverse-info"
                onClick={() => {
                  const updatedJours = [
                    ...formData.programme.jours,
                    { detail: "", sousParties: [""] },
                  ];
                  setFormData({
                    ...formData,
                    programme: {
                      ...formData.programme,
                      jours: updatedJours,
                    },
                  });
                }}
              >
                Ajouter un jour <FaPlusCircle size={25} />
              </Button>
            </div>
          </div>
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

export default FormationModal;
