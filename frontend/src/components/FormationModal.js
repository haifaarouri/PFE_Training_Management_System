import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { FaBook } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { MdDescription } from "react-icons/md";
import { IoPricetags } from "react-icons/io5";
import { TbCategoryFilled, TbListCheck } from "react-icons/tb";

const FormationModal = ({ show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSousCategory, setNewSousCategory] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personnesCible: "",
    price: "",
    categorieId: "",
    sousCategorieId: "",
  });

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
  console.log(formData);
  const handleAddFormateur = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formDataToSend = {
        name: formData.name,
        description: formData.description,
        personnesCible: formData.personnesCible,
        price: formData.price,
        requirements: formData.requirements,
        categorie_name: newCategory,
        sous_categorie_name: newSousCategory,
        sous_categorie_id: formData.sousCategorieId,
      };

      if (!localStorage.getItem("token")) {
        const res = await axios.post("/api/add-formation", formDataToSend, {
          headers: {
            "Content-Type": "application/json",
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
            name: "",
            description: "",
            personnesCible: "",
            price: "",
            categorieId: "",
            sousCategorieId: "",
          });
          setNewCategory("");
          setNewSousCategory("");

          handleClose();
        }
      } else {
        const headers = {
          "Content-Type": "application/json",
        };

        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.post("/api/add-formation", {
          headers,
          body: JSON.stringify(formDataToSend),
        });

        if (response.status === 201) {
          Swal.fire({
            icon: "success",
            title: "Formation ajoutée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setFormData({
            name: "",
            description: "",
            personnesCible: "",
            price: "",
            categorieId: "",
            sousCategorieId: "",
          });
          setNewCategory("");
          setNewSousCategory("");

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
  };

  const handleCategoryChange = (e) => {
    console.log(e.target.value);
    const categoryId = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      categorieId: categoryId,
    }));

    // Fetch sous-categories based on selected category
    // fetch(`/api/categories/${categoryId}/sousCategories`)
    //   .then((response) => response.json())
    //   .then((data) => setSousCategories(data));
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
          onSubmit={handleAddFormateur}
        >
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
            <Form.Label>Personnes Cibles</Form.Label>
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
            <Form.Label>Prérequis</Form.Label>
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
                name="requirements"
                type="text"
                placeholder="Saisir les prérequis nécessaires pour cette formation"
                value={formData.requirements}
                onChange={handleInputChange}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le prérequis de la formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
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
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionnez une sous-catégorie</option>
                {sousCategories.map((sousCategorie) => (
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
