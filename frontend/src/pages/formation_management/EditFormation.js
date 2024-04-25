import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams } from "react-router-dom";
import {
    fetchFormationById,
//   editformation,
} from "../../services/FormationServices";
import { FaBook } from "react-icons/fa";
import { TfiEmail } from "react-icons/tfi";
import { MdDescription } from "react-icons/md";
import { IoPricetags } from "react-icons/io5";
import { TbCategoryFilled, TbListCheck } from "react-icons/tb";

const EditFormation = () => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [formation, setFormation] = useState({
    name: "",
    description: "",
    perconnesCible: "",
    type: "",
    requirements: "",
    price: "",
  });
  const [categories, setCategories] = useState([]);
  const [sousCategories, setSousCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSousCategory, setNewSousCategory] = useState("");
  const [formData, setFormData] = useState({
    categorieId: "",
    sousCategorieId: "",
  });

  useEffect(() => {
    const fetchFormation = async () => {
      const formationData = await fetchFormationById(id);
      setFormation(formationData);
    };

    if (id) {
      fetchFormation();
    }
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

//   const handleUpdateformation = async (event) => {
//     event.preventDefault();
//     await csrf();
//     try {
//       const form = formRef.current;
//       if (
//         form.checkValidity() === false ||
//         isWhitespace(formation.name) ||
//         isWhitespace(formation.description) ||
//         isWhitespace(formation.price) ||
//         isWhitespace(formation.perconnesCible) ||
//         cv.size > 2000000
//       ) {
//         event.preventDefault();
//         event.stopPropagation();
//         handleError("Fichier est trop volumineux !");
//         setErrorMsg(
//           "Fichier est trop volumineux ! La taille maximale est 2MB !"
//         );
//       }

//       setValidated(true);

//       const formattedDisponibility = dates.map((d) => ({
//         startDate: d.startDate
//           ? formatISO(d.startDate, { representation: "date" })
//           : null,
//         endDate: d.endDate
//           ? formatISO(d.endDate, { representation: "date" })
//           : null,
//       }));

//       const formData = new FormData();
//       formData.append("_method", "PUT");
//       formData.append("name", formation.name);
//       formData.append("description", formation.description);
//       formData.append("perconnesCible", formation.perconnesCible);
//       formData.append("price", formation.price);
//       formData.append("requirements", formation.requirements);
//       formData.append("type", formation.type);
//       formData.append("specialities", JSON.stringify(specialities));
//       certificates.forEach((certificate, index) => {
//         Object.keys(certificate).forEach((key) => {
//           formData.append(`certificates[${index}][${key}]`, certificate[key]);
//         });
//       });
//       formattedDisponibility.forEach((d, index) => {
//         formData.append(`disponibility[${index}][startDate]`, d.startDate);
//         formData.append(`disponibility[${index}][endDate]`, d.endDate);
//       });
//       formData.append("cv", cv);

//       const res = await editformation(id, formData);

//       if (res.status === 200) {
//         Swal.fire({
//           icon: "success",
//           title: "formation modifié avec succès !",
//           showConfirmButton: false,
//           timer: 2000,
//         });

//         setFormation({
//           name: "",
//           description: "",
//           perconnesCible: "",
//           type: "",
//           requirements: "",
//           price: "",
//           speciality: "",
//         });
//         setSpecialities([""]);
//         setCertificates([]);
//         setDates([{ startDate: null, endDate: null }]);
//         setCv("");

//         navigate("/formations");
//       }
//     } catch (error) {
//       if (error && error.response.status === 422) {
//         handleError(error.response.data.message);
//         Swal.fire({
//           icon: "error",
//           title: "Oops...",
//           text: "Quelque chose s'est mal passé !",
//         });
//       }
//     }
//   };

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
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Mettre à jour les informations du formation{" "}
                {formation.name}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                // onSubmit={handleUpdateformation}
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
                      value={formation.name}
                      onChange={(e) =>
                        setFormation((prevF) => ({
                          ...prevF,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le titre du formation !
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
                      placeholder="Saisir la description"
                      value={formation.description}
                      onChange={(e) =>
                        setFormation((prevF) => ({
                          ...prevF,
                          description: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir la description du formation !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Perconnes cibles</Form.Label>
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
                      name="perconnesCible"
                      type="perconnesCible"
                      placeholder="Saisir les perconnes cibles"
                      value={formation.perconnesCible}
                      onChange={(e) =>
                        setFormation((prevF) => ({
                          ...prevF,
                          perconnesCible: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir les perconnes cibles pour cette formation !
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
                      placeholder="Saisir le prix"
                      value={formation.price}
                      onChange={(e) =>
                        setFormation((prevF) => ({
                          ...prevF,
                          price: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le Prix de cette formation !
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
                      placeholder="Saisir la Prérequis"
                      value={formation.requirements}
                      onChange={(e) =>
                        setFormation((prevF) => ({
                          ...prevF,
                          requirements: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le Nombre d'année d'expérience du
                      formation !
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
