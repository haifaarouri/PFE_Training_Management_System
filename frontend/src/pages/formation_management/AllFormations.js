import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Card, Carousel, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import FormationModal from "../../components/FormationModal";
import {
  deleteFormation,
  fetchAllFormations,
} from "../../services/FormationServices";
import FileModal from "../../components/FileModal";
import { GrPlan } from "react-icons/gr";
import ProgrammeFormationModal from "../../components/ProgrammeFormationModal";
import axios from "../../services/axios";
import ReactPaginate from "react-paginate";
import Spinner from "../../components/Spinner";
require("moment/locale/fr");

function AllFormations() {
  const [formations, setFormations] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [programme, setProgramme] = useState("");
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 2;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = formations?.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(formations?.length / itemsPerPage);
  const [loading, setLoading] = useState(false);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % formations.length;
    setItemOffset(newOffset);
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setFormations(d);
    };

    u();
  }, []);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (
      columnName &&
      columnName !== "Colonne" &&
      columnName !== "price" &&
      columnName !== "numberOfDays"
    ) {
      const newFilter =
        formations.length > 0 &&
        formations.filter((formation) =>
          formation[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else if (
      columnName &&
      columnName !== "Colonne" &&
      (columnName === "price" || columnName === "numberOfDays")
    ) {
      const newFilter =
        formations.length > 0 &&
        formations.filter(
          (formation) => formation[columnName] === parseInt(searchWord)
        );
      setFilteredData(newFilter);
    } else {
      const newFilter =
        formations.length > 0 &&
        formations.filter((formation) => {
          const formationFields = Object.values(formation)
            .join(" ")
            .toLowerCase();
          return formationFields.includes(searchWord);
        });
      setFilteredData(newFilter);
    }
  };

  const handleShowAddModal = () => setShowModal(true);
  const handleCloseAddModal = () => setShowModal(false);

  const handleShowFileModal = (courseMaterial) => {
    setShowFileModal(true);
    setSelectedFile(courseMaterial);
  };
  const handleCloseFileModal = () => setShowFileModal(false);

  const handleShowProgrammeModal = (p) => {
    setShowProgrammeModal(true);
    setProgramme(p);
  };
  const handleCloseProgrammeModal = () => setShowProgrammeModal(false);

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

  const handleButtonEdit = (id) => {
    navigate(`/edit-formation/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllFormations();
      return response;
    } catch (error) {
      console.log("Error fetching formations :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setFormations(d);
    };

    u();
  }, [showModal]);

  const handleDeleteFormation = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr?",
      text: "Vous ne pourrez pas revenir en arrière !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteFormation(id);
          Swal.fire({
            title: "Supprimée avec succès!",
            text: "Formation est supprimée !",
            icon: "success",
          });
          const d = await fetchData();
          setFormations(d);
          handleSuccess(res.message);
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

  const handleListView = () => {
    setShowList(true);
    setShowCarousel(false);
  };

  const handleCarouselView = () => {
    setShowCarousel(true);
    setShowList(false);
  };

  const handleCatalog = async (type) => {
    setLoading(true);
    try {
      if (!localStorage.getItem("token")) {
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          withCredentials: true,
        };

        const response = await axios.get(`/api/training-catalog/${type}`, {
          headers: headers,
        });

        if (response.status === 200) {
          setLoading(false);
          window.open(response.data.url, "_blank");
          Swal.fire({
            icon: "success",
            title: "Document généré avec succès !",
          });
        }
      } else {
        const token = localStorage.getItem("token");
        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          withCredentials: true,
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(
          `http://localhost:8000/api/training-catalog/${type}`,
          { headers }
        );

        if (!response.ok) {
          setLoading(false);
          const errorData = await response.json();
          throw new Error(`API request failed: ${errorData.error}`);
        }
        setLoading(false);
        const json = await response.json();
        window.open(json.url, "_blank");
        Swal.fire({
          icon: "success",
          title: "Document généré avec succès !",
        });
      }
    } catch (error) {
      setLoading(false);
      if (!localStorage.getItem("token")) {
        handleError(error.response.data.error);
        Swal.fire({
          icon: "error",
          title: error.response.data.error,
          text: "Veillez vérifier si ce modèle existe si non, créez un nouveau modèle de document !",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: error,
          text: "Veillez vérifier si ce modèle existe si non, créez un nouveau modèle de document !",
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
              <ToastContainer />
              {loading ? <Spinner /> : null}
              <div className="d-flex justify-content-between">
                <h4 className="card-title mb-5 mt-2">
                  Liste de toutes les formations
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter une Formation
                </Button>
              </div>
              <div className="d-flex justify-content-between px-3 py-3">
                <div>
                  <p>Télécharger le catalogue des formations</p> 
                  <div className="btn-group">
                    <Button
                      className="btn btn-sm btn-inverse-success"
                      onClick={() =>
                        handleCatalog("CatalogueDesFormationParMois")
                      }
                    >
                      Par mois
                    </Button>
                    <Button
                      className="btn btn-sm btn-inverse-success"
                      onClick={() =>
                        handleCatalog("CatalogueDesFormationParTrimestre")
                      }
                    >
                      Par trimestre
                    </Button>
                    <Button
                      className="btn btn-sm btn-inverse-success"
                      onClick={() =>
                        handleCatalog("CatalogueDesFormationParSemestre")
                      }
                    >
                      Par semestre
                    </Button>
                    <Button
                      className="btn btn-sm btn-inverse-success"
                      onClick={() =>
                        handleCatalog("CatalogueDesFormationParAn")
                      }
                    >
                      Par an
                    </Button>
                  </div>
                </div>
                <div className="btn-group">
                  <Button
                    className="btn btn-lg btn-inverse-success btn-icon"
                    onClick={handleListView}
                  >
                    <i className="icon-lg mdi mdi-view-list"></i>
                  </Button>
                  <Button
                    className="btn btn-lg btn-inverse-success btn-icon"
                    onClick={handleCarouselView}
                  >
                    <i className="icon-lg mdi mdi-view-carousel"></i>
                  </Button>
                </div>
              </div>
              <FormationModal
                show={showModal}
                handleClose={handleCloseAddModal}
              />
              {showList && (
                <>
                  <div className="d-flex justify-content-center mt-3 mb-5">
                    <Form style={{ width: "50%" }}>
                      <div className="inner-form">
                        <div className="input-select">
                          <Form.Group>
                            <InputGroup>
                              <Form.Select
                                style={{ border: "none" }}
                                value={columnName}
                                onChange={(e) => setColumnName(e.target.value)}
                                required
                              >
                                <option value="">Colonne</option>
                                <option value="reference">Réference</option>
                                <option value="entitled">Intitulé</option>
                                <option value="personneCible">
                                  Personnes cibles
                                </option>
                                <option value="requiremnts">Prérequis</option>
                                <option value="certificationOrganisme">
                                  Organisme de certification
                                </option>
                                <option value="category">Catégorie</option>
                                <option value="sousCategory">
                                  Sous catégorie
                                </option>
                                <option value="price">Prix</option>
                                <option value="numberOfDays">
                                  Nombre de jours
                                </option>
                              </Form.Select>
                            </InputGroup>
                          </Form.Group>
                        </div>
                        <div className="input-field second-wrap">
                          <Form.Group>
                            <InputGroup>
                              <Form.Control
                                id="search"
                                type="text"
                                placeholder="Recherchez des formations ..."
                                size="lg"
                                name=""
                                value={wordEntered}
                                onChange={handleFilter}
                                required
                              />
                            </InputGroup>
                          </Form.Group>
                        </div>
                        <div className="input-field third-wrap">
                          <button className="btn-search" type="button">
                            <svg
                              className="svg-inline--fa fa-search fa-w-16"
                              aria-hidden="true"
                              data-prefix="fas"
                              data-icon="search"
                              role="img"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                            >
                              <path
                                fill="currentColor"
                                d="M505 442.7L405.3 343c-4.5-4.5-10.6-7-17-7H372c27.6-35.3 44-79.7 44-128C416 93.1 322.9 0 208 0S0 93.1 0 208s93.1 208 208 208c48.3 0 92.7-16.4 128-44v16.3c0 6.4 2.5 12.5 7 17l99.7 99.7c9.4 9.4 24.6 9.4 33.9 0l28.3-28.3c9.4-9.4 9.4-24.6.1-34zM208 336c-70.7 0-128-57.2-128-128 0-70.7 57.2-128 128-128 70.7 0 128 57.2 128 128 0 70.7-57.2 128-128 128z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </Form>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Réference</th>
                          <th>Intitulé</th>
                          <th>Description</th>
                          <th>Nombre de jours</th>
                          <th>Personnes Cibles</th>
                          <th>Prix</th>
                          <th>Prérequis</th>
                          <th>Organisme de certification</th>
                          <th>Catégorie</th>
                          <th>Sous Catégorie</th>
                          <th>Support du cours</th>
                          <th>Programme de la formation</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((f, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{f.reference}</h6>
                                </td>
                                <td>
                                  <h6>{f.entitled}</h6>
                                </td>
                                <td>
                                  <h6>{f.description}</h6>
                                </td>
                                <td>{f.numberOfDays}</td>
                                <td>{f.personnesCible}</td>
                                <td>{f.price} DT</td>
                                <td>{f.requirements}</td>
                                <td>{f.certificationOrganization}</td>
                                <td>
                                  {f.sous_categorie.categorie.categorie_name}
                                </td>
                                <td>{f.sous_categorie.sous_categorie_name}</td>
                                <td>
                                  {f.courseMaterial && (
                                    <Button
                                      onClick={() =>
                                        handleShowFileModal(f.courseMaterial)
                                      }
                                      className="btn btn-inverse-primary"
                                    >
                                      <span>Ouvrir</span>
                                      <i
                                        className="mdi mdi-eye"
                                        style={{ fontSize: "1.5em" }}
                                      />
                                    </Button>
                                  )}
                                </td>
                                <td>
                                  {f.programme && (
                                    <Button
                                      onClick={() =>
                                        handleShowProgrammeModal(f.programme)
                                      }
                                      className="btn btn-inverse-info"
                                    >
                                      <span>Programme</span>
                                      <i style={{ fontSize: "1.5em" }}>
                                        <GrPlan />
                                      </i>
                                    </Button>
                                  )}
                                </td>
                                <ProgrammeFormationModal
                                  show={showProgrammeModal}
                                  handleClose={handleCloseProgrammeModal}
                                  programme={programme}
                                />
                                <FileModal
                                  show={showFileModal}
                                  handleClose={handleCloseFileModal}
                                  selectedFile={selectedFile}
                                  fileContent="CourseMaterial"
                                />
                                <td>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleButtonEdit(f.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Modifier{" "}
                                      <i className="mdi mdi-tooltip-edit"></i>
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDeleteFormation(f.id)
                                      }
                                      variant="outline-danger"
                                      className="btn btn-sm"
                                      disabled={f.candidats.length > 0 || f.sessions.length > 0}
                                    >
                                      Supprimer{" "}
                                      <i className="mdi mdi-delete"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : filteredData.length === 0 &&
                          formations.length === 0 ? (
                          <></>
                        ) : (
                          formations.length > 0 &&
                          currentItems?.map((f, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{f.reference}</h6>
                                </td>
                                <td>
                                  <h6>{f.entitled}</h6>
                                </td>
                                <td>
                                  <h6>{f.description}</h6>
                                </td>
                                <td>{f.numberOfDays}</td>
                                <td>{f.personnesCible}</td>
                                <td>{f.price} DT</td>
                                <td>{f.requirements}</td>
                                <td>{f.certificationOrganization}</td>
                                <td>
                                  {f.sous_categorie.categorie.categorie_name}
                                </td>
                                <td>{f.sous_categorie.sous_categorie_name}</td>
                                <td>
                                  {f.courseMaterial && (
                                    <Button
                                      onClick={() =>
                                        handleShowFileModal(f.courseMaterial)
                                      }
                                      className="btn btn-inverse-primary"
                                    >
                                      <span>Ouvrir</span>
                                      <i
                                        className="mdi mdi-eye"
                                        style={{ fontSize: "1.5em" }}
                                      />
                                    </Button>
                                  )}
                                </td>
                                <td>
                                  {f.programme && (
                                    <Button
                                      onClick={() =>
                                        handleShowProgrammeModal(f.programme)
                                      }
                                      className="btn btn-inverse-info"
                                    >
                                      <span>Programme</span>
                                      <i style={{ fontSize: "1.5em" }}>
                                        <GrPlan />
                                      </i>
                                    </Button>
                                  )}
                                </td>
                                <ProgrammeFormationModal
                                  show={showProgrammeModal}
                                  handleClose={handleCloseProgrammeModal}
                                  programme={programme}
                                />
                                <FileModal
                                  show={showFileModal}
                                  handleClose={handleCloseFileModal}
                                  selectedFile={selectedFile}
                                  fileContent="CourseMaterial"
                                />
                                <td>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleButtonEdit(f.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Modifier{" "}
                                      <i className="mdi mdi-tooltip-edit"></i>
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDeleteFormation(f.id)
                                      }
                                      variant="outline-danger"
                                      className="btn btn-sm"
                                      disabled={f.candidats.length > 0 || f.sessions.length > 0}
                                    >
                                      Supprimer{" "}
                                      <i className="mdi mdi-delete"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <ReactPaginate
                    breakLabel="..."
                    nextLabel="->"
                    onPageChange={handlePageClick}
                    pageRangeDisplayed={3}
                    marginPagesDisplayed={2}
                    pageCount={pageCount}
                    previousLabel="<-"
                    renderOnZeroPageCount={null}
                    containerClassName="pagination justify-content-center mt-4"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    breakClassName="page-item"
                    breakLinkClassName="page-link"
                    activeClassName="active"
                  />
                </>
              )}
              {showCarousel && (
                <Carousel
                  style={{ backgroundColor: "#D2D8EB" }}
                  className="shadow-lg p-5 mb-5 rounded"
                >
                  {formations.length > 0 &&
                    formations.map((f, idx) => {
                      return (
                        <Carousel.Item key={idx} className="row">
                          <div
                            className="d-flex justify-content-end row"
                            style={{ marginRight: "5%" }}
                          >
                            <Button
                              onClick={() => handleButtonEdit(f.id)}
                              className="btn btn-sm m-1 btn-dark btn-rounded col-lg-2 col-xs-12"
                            >
                              Modifier <i className="mdi mdi-tooltip-edit"></i>
                            </Button>
                            <Button
                              onClick={() => handleDeleteFormation(f.id)}
                              className="btn btn-sm m-1 btn-rounded col-lg-2 col-xs-12"
                              disabled={f.candidats.length > 0 || f.sessions.length > 0}
                            >
                              Supprimer <i className="mdi mdi-delete"></i>
                            </Button>
                          </div>
                          <div className="m-lg-5 m-md-5 m-sm-0 m-xs-0 p-sm-0 p-xs-0">
                            <Card className="shadow-lg rounded m-5">
                              <Card.Body>
                                <Card.Title>
                                  <h2>
                                    {f.reference} - {f.entitled}
                                  </h2>
                                </Card.Title>
                                <Card.Text className="d-flex justify-content-evenly row">
                                  <div className="mt-5 mb-5 col-sm-12 col-md-12 col-lg-6">
                                    <div className="d-flex justify-content-between">
                                      <div>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Description :
                                          </span>{" "}
                                          {f.description}
                                        </p>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Personnes cibles :
                                          </span>{" "}
                                          {f.personnesCible}
                                        </p>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Nombre des jours :
                                          </span>{" "}
                                          {f.numberOfDays}
                                        </p>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Prix :
                                          </span>{" "}
                                          {f.price} DT
                                        </p>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Prérequis :
                                          </span>{" "}
                                          {f.requirements}
                                        </p>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Nom de l'organisme de certification
                                            :
                                          </span>{" "}
                                          {f.certificationOrganization}
                                        </p>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Catégorie :
                                          </span>{" "}
                                          {
                                            f.sous_categorie.categorie
                                              .categorie_name
                                          }
                                        </p>
                                        <p>
                                          <span className="text-primary fw-bold">
                                            Sous Catégorie :
                                          </span>{" "}
                                          {f.sous_categorie.sous_categorie_name}
                                        </p>
                                      </div>
                                      <div>
                                        {f.programme.title}
                                        {f.programme.jour_formations.map(
                                          (j, i) => (
                                            <div key={i}>
                                              <p>{j.dayName}</p>
                                              {j.sous_parties.map(
                                                (sp, index) => (
                                                  <p key={index}>
                                                    {sp.description}
                                                  </p>
                                                )
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {f.courseMaterial && (
                                    <>
                                      <span className="text-primary fw-bold">
                                        Support du cours :
                                      </span>
                                      <iframe
                                        src={`http://localhost:8000/CoursesMaterials/${f.courseMaterial}`}
                                        width="100%"
                                        height="600px"
                                        title="PDF Viewer"
                                      ></iframe>
                                    </>
                                  )}
                                </Card.Text>
                              </Card.Body>
                            </Card>
                          </div>
                        </Carousel.Item>
                      );
                    })}
                </Carousel>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllFormations;
