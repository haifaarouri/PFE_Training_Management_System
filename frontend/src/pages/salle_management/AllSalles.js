import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import moment from "moment";
import { Card, Form, InputGroup, Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { deleteSalle, fetchAllSalles } from "../../services/SalleServices";
import SalleModal from "../../components/SalleModal";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import Carousel from "react-bootstrap/Carousel";
import Swal from "sweetalert2";
require("moment/locale/fr");

function AllSalles() {
  const [salles, setSalles] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const sallesPerPage = 2;
  const lastIndex = currentPage * sallesPerPage;
  const firstIndex = lastIndex - sallesPerPage;
  const sallesPage = salles.length > 0 && salles.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    salles.length > 0 && salles.length / sallesPerPage
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
      const newFilter =
        salles.length > 0 &&
        salles.filter((salle) =>
          salle[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else {
      const newFilter =
        salles.length > 0 &&
        salles.filter((salle) => {
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
    navigate(`/super-admin/edit-user/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllSalles();
      return response;
    } catch (error) {
      console.log("Error fetching salles :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setSalles(d);
    };

    u();
  }, [showModal]);

  const handleDeleteSalle = async (id) => {
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
          const res = await deleteSalle(id);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "Salle est supprimée !",
            icon: "success",
          });
          const d = await fetchData();
          setSalles(d);
          handleSuccess(res.message);
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

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
                  Liste de toutes les salles
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter une Salle
                </Button>
              </div>
              <div className="d-flex justify-content-end px-3 pt-2">
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
              <div className="d-flex justify-content-center mt-3 mb-5">
                <Form style={{ width: "50%" }}>
                  <div className="inner-form">
                    <div className="input-select">
                      <Form.Group>
                        <InputGroup>
                          <Form.Select
                            style={{ border: "none" }}
                            name="email"
                            value={columnName}
                            onChange={(e) => setColumnName(e.target.value)}
                            required
                          >
                            <option>Colonne</option>
                            <option value="email">E-mail</option>
                            <option value="firstName">Prénom</option>
                            <option value="lastName">Nom</option>
                            <option value="role">Role</option>
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
                          ></Form.Control>
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
              <SalleModal show={showModal} handleClose={handleCloseAddModal} />
              {showList && (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Image de la Salle</th>
                          <th>Nom de la Salle</th>
                          <th>Capacité</th>
                          <th>Disponibilité</th>
                          <th>Disposition (Forme de la Salle)</th>
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
                                    src={`http://localhost:8000/sallePictures/${u.image}`}
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
                                <td>
                                  {Array.isArray(u.disponibility) &&
                                    u.disponibility.map((d, i) => {
                                      const startDate = moment(d.startDate.date)
                                        .locale("fr")
                                        .format("LL");
                                      const endDate = moment(d.endDate.date)
                                        .locale("fr")
                                        .format("LL");
                                      return (
                                        <div
                                          pill
                                          className="badge badge-outline-success badge-pill mb-2"
                                          key={i}
                                        >
                                          <p>{`${startDate} - ${endDate}`}</p>
                                        </div>
                                      );
                                    })}
                                </td>
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
                                      onClick={() => handleDeleteSalle(u.id)}
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
                        ) : filteredData.length === 0 && salles.length === 0 ? (
                          <></>
                        ) : (
                          salles.length > 0 &&
                          sallesPage.map((u, index) => {
                            return (
                              <tr key={index}>
                                <td style={{ width: "25%" }}>
                                  <img
                                    src={`http://localhost:8000/sallePictures/${u.image}`}
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
                                <td>
                                  {Array.isArray(u.disponibility) &&
                                    u.disponibility.map((d, i) => {
                                      const startDate = moment(d.startDate.date)
                                        .locale("fr")
                                        .format("LL");
                                      const endDate = moment(d.endDate.date)
                                        .locale("fr")
                                        .format("LL");
                                      return (
                                        <div
                                          pill
                                          className="badge badge-outline-success badge-pill mb-2"
                                          key={i}
                                        >
                                          <p>{`${startDate} - ${endDate}`}</p>
                                        </div>
                                      );
                                    })}
                                </td>
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
                                      onClick={() => handleDeleteSalle(u.id)}
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
                <Carousel
                  style={{ backgroundColor: "#D2D8EB" }}
                  className="shadow-lg p-5 mb-5 rounded"
                >
                  {salles.length > 0 &&
                    salles.map((s, i) => {
                      let dispo = s.disponibility;

                      const object = {};
                      dispo.forEach((obj, i) => {
                        const key = `selection${i + 1}`;
                        object[key] = {
                          startDate: new Date(obj.startDate.date),
                          endDate: new Date(obj.endDate.date),
                          key: key,
                        };
                      });
                      return (
                        <Carousel.Item key={i}>
                          <div
                            className="d-flex justify-content-end"
                            style={{ marginRight: "5%" }}
                          >
                            <Button
                              onClick={() => handleButtonEdit(s.id)}
                              className="btn btn-sm m-1 btn-dark btn-rounded"
                            >
                              Modifier <i className="mdi mdi-tooltip-edit"></i>
                            </Button>
                            <Button
                              onClick={() => handleDeleteSalle(s.id)}
                              className="btn btn-sm m-1 btn-rounded"
                            >
                              Supprimer <i className="mdi mdi-delete"></i>
                            </Button>
                          </div>
                          <div className="m-5">
                            <Card className="shadow-lg p-3 rounded">
                              <Card.Body>
                                <Card.Title>
                                  <h2>{s.name}</h2>
                                </Card.Title>
                                <Card.Text className="d-flex justify-content-evenly">
                                  <div className="d-flex flex-column justify-content-center m-5">
                                    <h5>Capacité {s.capacity}</h5>
                                    <h5>Disposition {s.disposition}</h5>
                                    <h5>Image</h5>
                                    <img
                                      src={`http://localhost:8000/sallePictures/${s.image}`}
                                      alt={s.iamge}
                                      style={{
                                        borderRadius: "8px",
                                        width: "100%",
                                        height: "100%",
                                      }}
                                    />
                                  </div>
                                  <div className="d-flex flex-column justify-content-center m-5">
                                    <h5>Disponibilité</h5>
                                    <div style={{ position: "relative" }}>
                                      {/* {Object.values(object).map((d) => (
                                        <p key="hh">
                                          {moment(d.startDate)
                                            .locale("fr")
                                            .format("LL")}{" "}
                                          {moment(d.endDate)
                                            .locale("fr")
                                            .format("LL")}
                                        </p>
                                      ))} */}
                                      <DateRange
                                        ranges={Object.values(object)}
                                        disabledDay={() => true}
                                        editableDateInputs={true}
                                        moveRangeOnFirstSelection={false}
                                      />
                                      <div
                                        style={{
                                          pointerEvents: "none",
                                          opacity: 0.5,
                                          position: "absolute",
                                          top: 0,
                                          right: 0,
                                          bottom: 0,
                                          left: 0,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
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

export default AllSalles;
