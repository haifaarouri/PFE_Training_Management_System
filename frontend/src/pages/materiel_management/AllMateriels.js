import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Card, Col, Form, InputGroup, Pagination, Row } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import MaterielModal from "../../components/MaterielModal";
import { fetchAllMateriaux } from "../../services/MaterielServices";
require("moment/locale/fr");

function AllMateriels() {
  const [materiaux, setMateriaux] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const materiauxPerPage = 2;
  const lastIndex = currentPage * materiauxPerPage;
  const firstIndex = lastIndex - materiauxPerPage;
  const materiauxPage = materiaux.length > 0 && materiaux.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    materiaux.length > 0 && materiaux.length / materiauxPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState("");
  const [columnName, setColumnName] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne") {
      if (
        columnName === "name" ||
        columnName === "disposition" ||
        columnName === "state"
      ) {
        const newFilter =
          materiaux.length > 0 &&
          materiaux.filter((salle) =>
            salle[columnName].toLowerCase().includes(searchWord.toLowerCase())
          );
        setFilteredData(newFilter);
      } else if (columnName === "capacity") {
        const newFilter =
          materiaux.length > 0 &&
          materiaux.filter((salle) => salle[columnName] >= searchWord);
        setFilteredData(newFilter);
      }
    } else {
      const newFilter =
        materiaux.length > 0 &&
        materiaux.filter((salle) => {
          const salleFields = Object.values(salle).join(" ").toLowerCase();
          return salleFields.includes(searchWord);
        });
      setFilteredData(newFilter);
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
    navigate(`/edit-salle/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllMateriaux();
      return response;
    } catch (error) {
      console.log("Error fetching materiaux :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setMateriaux(d);
    };

    u();
  }, [showModal]);

  // const handleDeleteSalle = async (id) => {
  //   Swal.fire({
  //     title: "Êtes-vous sûr?",
  //     text: "Vous ne pourrez pas revenir en arrière !",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Oui, supprimer!",
  //   }).then(async (result) => {
  //     if (result.isConfirmed) {
  //       try {
  //         const res = await deleteSalle(id);
  //         Swal.fire({
  //           title: "Supprimé avec succès!",
  //           text: "Salle est supprimée !",
  //           icon: "success",
  //         });
  //         const d = await fetchData();
  //         setMateriaux(d);
  //         handleSuccess(res.message);
  //       } catch (error) {
  //         if (error && error.response.status === 422) {
  //           handleError(error.response.data.message);
  //         }
  //       }
  //     }
  //   });
  // };

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

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <ToastContainer />
              <div className="d-flex justify-content-between">
                <h4 className="card-title mb-5 mt-2">
                  Liste de tous les matériaux
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter un Matériel
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
              <MaterielModal
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
                                <option>Colonne</option>
                                <option value="name">Nom</option>
                                <option value="capacity">Capacité</option>
                                <option value="disposition">Disposition</option>
                                <option value="state">Etat</option>
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
                          <th>Image</th>
                          <th>Nom</th>
                          <th>Type</th>
                          <th>Quatité disponible</th>
                          <th>Etat</th>
                          <th>Cout</th>
                          <th>Date d'achat</th>
                          <th>Fournisseur</th>
                          <th>Spécifications Techniques</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((u, index) => {
                            return (
                              <tr key={index}>
                                <td style={{ width: "25%" }}>
                                  <img
                                    src={`http://localhost:8000/materielPictures/${u.image}`}
                                    alt={u.iamge}
                                    style={{
                                      borderRadius: "8px",
                                      width: "100%",
                                      height: "100%",
                                    }}
                                  />
                                </td>
                                <td>
                                  <h6>{u.name}</h6>
                                </td>
                                <td>{u.capacity}</td>
                                <td>{u.disponibility}</td>
                                <td>{u.state}</td>
                                <td>{u.disposition}</td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleButtonEdit(u.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Modifier{" "}
                                      <i className="mdi mdi-tooltip-edit"></i>
                                    </Button>
                                    <Button
                                      // onClick={() => handleDeleteSalle(u.id)}
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
                        ) : filteredData.length === 0 && materiaux.length === 0 ? (
                          <></>
                        ) : (
                          materiaux.length > 0 &&
                          materiauxPage.map((u, index) => {
                            return (
                              <tr key={index}>
                                <td style={{ width: "25%" }}>
                                  <img
                                    src={`http://localhost:8000/materielPictures/${u.image}`}
                                    alt={u.iamge}
                                    style={{
                                      borderRadius: "8px",
                                      width: "80%",
                                      height: "80%",
                                    }}
                                  />
                                </td>
                                <td>
                                  <h6>{u.name}</h6>
                                </td>
                                <td>{u.type}</td>
                                <td>{u.quantityAvailable}</td>
                                <td>{u.status}</td>
                                <td>{u.cost} DT</td>
                                <td>{u.purchaseDate}</td>
                                <td>{u.supplier}</td>
                                <td>{u.technicalSpecifications}</td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleButtonEdit(u.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Modifier{" "}
                                      <i className="mdi mdi-tooltip-edit"></i>
                                    </Button>
                                    <Button
                                      // onClick={() => handleDeleteSalle(u.id)}
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
                </>
              )}
              {showCarousel && (
                <Row xs={1} md={2} className="g-4">
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <Col key={idx}>
                      <Card border="primary">
                        <Card.Img variant="top" src="holder.js/100px160" />
                        <Card.Body>
                          <Card.Title>Card title</Card.Title>
                          <Card.Text>
                            This is a longer card with supporting text below as
                            a natural lead-in to additional content. This
                            content is a little bit longer.
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllMateriels;
