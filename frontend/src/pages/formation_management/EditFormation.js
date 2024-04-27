import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
  editFormation,
  fetchAllCategories,
  fetchFormationById,
} from "../../services/FormationServices";
import { FaBook, FaEdit, FaPlusCircle } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { MdDeleteForever, MdDescription } from "react-icons/md";
import { IoPricetags } from "react-icons/io5";
import { TbCategoryFilled, TbListCheck } from "react-icons/tb";

const EditFormation = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    personnesCible: "",
    price: "",
    categorieId: "",
    sousCategorieId: "",
    categorie_name: "",
    sous_categorie_name: "",
  });
  const [requirements, setRequirements] = useState([""]);
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSousCategory, setNewSousCategory] = useState("");
  const [showCat, setShowCat] = useState(false);

  useEffect(() => {
    const fetchFormation = async () => {
      const formationData = await fetchFormationById(id);
      setFormData(formationData);
      setRequirements(formationData.requirements.split(","));
    };

    if (id) {
      fetchFormation();
    }

    let f = async () => {
      let cats = await fetchAllCategories();
      setCategories(cats);
    };

    f();
  }, [id]);

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

  const handleUpdateformation = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formDatatoSend = new FormData();
      formDatatoSend.append("_method", "PUT");
      formDatatoSend.append("name", formData.name);
      formDatatoSend.append("description", formData.description);
      formDatatoSend.append("personnesCible", formData.personnesCible);
      formDatatoSend.append("price", formData.price);
      formDatatoSend.append("requirements", JSON.stringify(requirements));
      formDatatoSend.append(
        "categorie_name",
        newCategory ? newCategory : formData.categorie_name
      );
      formDatatoSend.append(
        "sous_categorie_name",
        newSousCategory ? newSousCategory : formData.sous_categorie_name
      );
      formDatatoSend.append("sous_categorie_id", formData.sousCategorieId);

      const res = await editFormation(id, formDatatoSend);

      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Formation modifiée avec succès !",
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
          categorie_name: "",
          sous_categorie_name: "",
        });
        setNewCategory("");
        setNewSousCategory("");
        setRequirements([""]);

        navigate("/formations");
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

  const editCategoryAndSubCategory = () => {
    setShowCat(!showCat);
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Mettre à jour les informations du formation {formData.name}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleUpdateformation}
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
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
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le prix de la formation !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
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
                      <Form.Control.Feedback>
                        Cela semble bon !
                      </Form.Control.Feedback>
                      <Form.Control.Feedback type="invalid">
                        Veuillez saisir le ou les prérequis pour cette formation
                        !
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
                {!showCat && formData && formData.sous_categorie && (
                  <div>
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
                        <Form.Control
                          value={
                            formData.sous_categorie.categorie.categorie_name
                          }
                          disabled="true"
                        />
                      </InputGroup>
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
                        <Form.Control
                          value={formData.sous_categorie.sous_categorie_name}
                          disabled="true"
                        />
                      </InputGroup>
                    </Form.Group>
                  </div>
                )}
                <div className="d-flex justify-content-end">
                  <Button
                    className="mb-3 mt-0 btn btn-info btn-rounded btn-inverse-info"
                    onClick={editCategoryAndSubCategory}
                  >
                    Modifier Catégorie et Sous catégorie{" "}
                    <FaEdit className="ml-2" size={25} />
                  </Button>
                </div>
                {showCat && (
                  <>
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
                        <Form.Control.Feedback>
                          Cela semble bon !
                        </Form.Control.Feedback>
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
                          <option value="">
                            Sélectionnez une sous-catégorie
                          </option>
                          {sousCategories.length > 0 &&
                            sousCategories.map((sousCategorie) => (
                              <option
                                key={sousCategorie.id}
                                value={sousCategorie.id}
                              >
                                {sousCategorie.sous_categorie_name}
                              </option>
                            ))}
                          <option value="newSubCategory">
                            Ajouter une nouvelle sous-catégorie
                          </option>
                        </Form.Select>
                        <Form.Control.Feedback>
                          Cela semble bon !
                        </Form.Control.Feedback>
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
                  </>
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
              <ToastContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFormation;
