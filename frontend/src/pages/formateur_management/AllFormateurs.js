import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import {
  Card,
  Carousel,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
// import formateurModal from "../../components/formateurModal";
import { fetchAllFormateurs } from "../../services/FormateurServices";
import FormateurModal from "../../components/FormateurModal";
import CertifModal from "../../components/CertifModel";
import { LiaCertificateSolid } from "react-icons/lia";
import { MdOutlineOpenInNew } from "react-icons/md";
require("moment/locale/fr");

function AllFormateurs() {
  const [formateurs, setFormateurs] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const formateursPerPage = 2;
  const lastIndex = currentPage * formateursPerPage;
  const firstIndex = lastIndex - formateursPerPage;
  const formateursPage =
    formateurs.length > 0 && formateurs.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    formateurs.length > 0 && formateurs.length / formateursPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showCertificat, setShowCertificat] = useState(false);
  const [certifToShow, setCertifToShow] = useState(null);

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setFormateurs(d);
    };

    u();
  }, []);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne") {
      if (
        columnName === "name" ||
        columnName === "type" ||
        columnName === "status" ||
        columnName === "supplier"
      ) {
        const newFilter =
          formateurs.length > 0 &&
          formateurs.filter((formateur) =>
            formateur[columnName]
              .toLowerCase()
              .includes(searchWord.toLowerCase())
          );
        setFilteredData(newFilter);
        if (
          wordEntered &&
          wordEntered.length > 3 &&
          filteredData.length === 0
        ) {
          Swal.fire({
            text: "Pas de résultat pour ce mot de recherche entré !",
            icon: "error",
            position: "top",
            height: "10%",
          });
        }
      }
    } else {
      const newFilter =
        formateurs.length > 0 &&
        formateurs.filter((formateur) => {
          const formateurFields = Object.values(formateur)
            .join(" ")
            .toLowerCase();
          return formateurFields.includes(searchWord);
        });
      setFilteredData(newFilter);
      if (wordEntered && wordEntered.length > 3 && filteredData.length === 0) {
        Swal.fire({
          text: "Pas de résultat pour ce mot de recherche entré !",
          icon: "error",
          position: "top",
          height: "100px",
        });
      }
    }
  };

  const handleShowAddModal = () => setShowModal(true);
  const handleCloseAddModal = () => setShowModal(false);

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
    navigate(`/edit-formateur/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllFormateurs();

      return response;
    } catch (error) {
      console.log("Error fetching formateurs :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setFormateurs(d);
    };

    u();
  }, [showModal]);

  //   const handleDeleteformateur = async (id) => {
  //     Swal.fire({
  //       title: "Êtes-vous sûr?",
  //       text: "Vous ne pourrez pas revenir en arrière !",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#3085d6",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Oui, supprimer!",
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         try {
  //           const res = await deleteformateur(id);
  //           Swal.fire({
  //             title: "Supprimé avec succès!",
  //             text: "Matériel est supprimé !",
  //             icon: "success",
  //           });
  //           const d = await fetchData();
  //           setFormateurs(d);
  //           handleSuccess(res.message);
  //         } catch (error) {
  //           if (error && error.response.status === 422) {
  //             handleError(error.response.data.message);
  //           }
  //         }
  //       }
  //     });
  //   };

  const prevPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const changeCurrentPage = (n) => {
    setCurrentPage(n);
  };

  const nextPage = () => {
    if (currentPage !== numberPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleListView = () => {
    setShowList(true);
    setShowCarousel(false);
  };

  const handleCarouselView = () => {
    setShowCarousel(true);
    setShowList(false);
  };

  const handleCloseCertifModal = () => setShowCertificat(false);

  const handleCertifClick = (certif) => {
    setCertifToShow(certif);
    setShowCertificat(true);
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <ToastContainer />
              <div className="d-flex justify-content-between">
                <h4 className="card-title mb-5 mt-2">
                  Liste de tous les formateurs
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter un Formateur
                </Button>
              </div>
              <div className="d-flex justify-content-end px-3 py-3">
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
              <FormateurModal
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
                                onChange={(e) => {
                                  return setColumnName(e.target.value);
                                }}
                                required
                              >
                                <option value="">Colonne</option>
                                <option value="name">Nom</option>
                                <option value="type">Type</option>
                                <option value="status">Etat</option>
                                <option value="supplier">Fournisseur</option>
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
                                placeholder="Recherchez des administareurs ..."
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
                          <th>Nom</th>
                          <th>Prénom</th>
                          <th>E-mail</th>
                          <th>Numéro de téléphone</th>
                          <th>Nombre d'année d'expérience</th>
                          <th>Type</th>
                          <th>Spécialité(s)</th>
                          <th>Certificats</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((f, index) => {
                            return (
                              <tr key={index} className="text-center">
                                <td>
                                  <h6>{f.lastName}</h6>
                                </td>
                                <td>
                                  <h6>{f.firstName}</h6>
                                </td>
                                <td>{f.email}</td>
                                <td>{f.phoneNumber}</td>
                                <td style={{ width: "5%" }}>{f.experience}</td>
                                <td>{f.type}</td>
                                <td>{f.speciality}</td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    {f.certificats.map((c, i) => (
                                      <Button
                                        onClick={() => handleCertifClick(c)}
                                        className="btn btn-inverse-success btn-sm mb-2"
                                        key={i}
                                      >
                                        {c.name}{" "}
                                        <i
                                          className="mdi mdi-certificate"
                                          style={{ fontSize: "1.2em" }}
                                        />{" "}
                                      </Button>
                                    ))}
                                  </div>
                                </td>
                                <td style={{ width: "15%" }}>
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
                                      //   onClick={() => handleDeleteformateur(u.id)}
                                      variant="outline-danger"
                                      className="btn btn-sm"
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
                          formateurs.length === 0 ? (
                          <></>
                        ) : (
                          formateurs.length > 0 &&
                          formateursPage.map((f, index) => {
                            return (
                              <tr key={index} className="text-center">
                                <td>
                                  <h6>{f.lastName}</h6>
                                </td>
                                <td>
                                  <h6>{f.firstName}</h6>
                                </td>
                                <td>{f.email}</td>
                                <td>{f.phoneNumber}</td>
                                <td style={{ width: "5%" }}>{f.experience}</td>
                                <td>{f.type}</td>
                                <td>{f.speciality}</td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    {f.certificats.map((c, i) => {
                                      return (
                                        <Button
                                          onClick={() => handleCertifClick(c)}
                                          className="btn btn-inverse-success btn-sm mb-2"
                                          key={i}
                                        >
                                          {c.name}{" "}
                                          <i
                                            className="mdi mdi-certificate"
                                            style={{ fontSize: "1.2em" }}
                                          />{" "}
                                        </Button>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td style={{ width: "15%" }}>
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
                                      //   onClick={() => handleDeleteformateur(u.id)}
                                      variant="outline-danger"
                                      className="btn btn-sm"
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
                  <Pagination className="d-flex justify-content-center mt-5">
                    <Pagination.Prev
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      <i
                        className="mdi mdi-arrow-left-bold-circle-outline"
                        style={{ fontSize: "1.5em" }}
                      />
                    </Pagination.Prev>
                    {numbers.map((n, i) => (
                      <Pagination.Item
                        className={`${currentPage === n ? "active" : ""}`}
                        key={i}
                        style={{ fontSize: "1.5em" }}
                        onClick={() => changeCurrentPage(n)}
                      >
                        {n}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next
                      onClick={nextPage}
                      disabled={currentPage === numberPages}
                    >
                      <i
                        className="mdi mdi-arrow-right-bold-circle-outline"
                        style={{ fontSize: "1.5em" }}
                      />
                    </Pagination.Next>
                  </Pagination>
                  <CertifModal
                    show={showCertificat}
                    handleClose={handleCloseCertifModal}
                    certif={certifToShow}
                  />
                </>
              )}
              {showCarousel && (
                <Carousel
                  style={{ backgroundColor: "#D2D8EB" }}
                  className="shadow-lg p-5 mb-5 rounded"
                >
                  {formateurs.length > 0 &&
                    formateurs.map((f, idx) => (
                      <Carousel.Item key={idx}>
                        <div
                          className="d-flex justify-content-end"
                          style={{ marginRight: "5%" }}
                        >
                          <Button
                            onClick={() => handleButtonEdit(f.id)}
                            className="btn btn-sm m-1 btn-dark btn-rounded"
                          >
                            Modifier <i className="mdi mdi-tooltip-edit"></i>
                          </Button>
                          <Button
                            // onClick={() => handleDeleteformateur(f.id)}
                            className="btn btn-sm m-1 btn-rounded"
                          >
                            Supprimer <i className="mdi mdi-delete"></i>
                          </Button>
                        </div>
                        <div className="m-5">
                          <Card className="shadow-lg p-3 rounded">
                            <Card.Body>
                              <Card.Title>
                                <h2>
                                  {f.firstName} {f.lastName}
                                </h2>
                              </Card.Title>
                              <Card.Text className="d-flex justify-content-evenly">
                                <div className="mt-5">
                                  <p>
                                    <span className="text-primary fw-bold">
                                      Adresse E-mail :
                                    </span>{" "}
                                    {f.email}
                                  </p>
                                  <p>
                                    <span className="text-primary fw-bold">
                                      Numéro de téléphone :
                                    </span>{" "}
                                    {f.phoneNumber}
                                  </p>
                                  <p>
                                    <span className="text-primary fw-bold">
                                      Nombre d'année d'expérience :
                                    </span>{" "}
                                    {f.experience}
                                  </p>
                                  <p>
                                    <span className="text-primary fw-bold">
                                      Type :
                                    </span>{" "}
                                    {f.type}
                                  </p>
                                  <p>
                                    <span className="text-primary fw-bold">
                                      Spécialité(s) :
                                    </span>{" "}
                                    {f.speciality}
                                  </p>
                                </div>
                                <div className="solution_cards_box">
                                  {f.certificats.length>0 && 
                                    f.certificats.map((certif) => (<div className="solution_card">
                                      <div className="hover_color_bubble"></div>
                                      <div className="solu_title d-flex justify-content-between">
                                        <h3>{certif.name}</h3>
                                        <LiaCertificateSolid
                                          style={{ fontSize: "4em" }}
                                        />
                                      </div>
                                      <div className="solu_description">
                                        <p>
                                          Oraganisme de délivrance :{" "}
                                          {certif.organisme}
                                        </p>
                                        <p>
                                          Date d'obtention :{" "}
                                          {certif.obtainedDate}
                                        </p>
                                        {certif.idCertificat && (
                                          <p>
                                            ID du certficat :{" "}
                                            <button
                                              onClick={() =>
                                                (window.location.href =
                                                  certif.idCertificat)
                                              }
                                            >
                                              Afficher l'ID{" "}
                                              <MdOutlineOpenInNew />
                                            </button>{" "}
                                          </p>
                                        )}
                                        {certif.urlCertificat && (
                                          <p>
                                            URL du certificat :{" "}
                                            <button
                                              onClick={() =>
                                                (window.location.href =
                                                  certif.urlCertificat)
                                              }
                                            >
                                              Afficher l'URL{" "}
                                              <MdOutlineOpenInNew />
                                            </button>{" "}
                                          </p>
                                        )}
                                      </div>
                                    </div>))}
                                </div>
                              </Card.Text>
                            </Card.Body>
                          </Card>
                        </div>
                      </Carousel.Item>
                    ))}
                </Carousel>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllFormateurs;
