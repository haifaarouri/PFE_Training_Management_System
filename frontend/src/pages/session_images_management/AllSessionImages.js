import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Form, InputGroup, Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import { deleteSalle, fetchAllSalles } from "../../services/SalleServices";
import SalleModal from "../../components/SalleModal";
import Swal from "sweetalert2";
import ShareImageOnLinkedIn from "../../components/ShareImageOnLinkedIn";

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
  const [loginUrl, setLoginUrl] = useState(null);

//   useEffect(() => {
//     fetch("http://localhost:8000/auth/linkedin", {
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         }
//         throw new Error("Something went wrong!");
//       })
//       .then((data) => setLoginUrl(data.url))
//       .catch((error) => console.error(error));
//   }, []);

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
          salles.length > 0 &&
          salles.filter((salle) =>
            salle[columnName].toLowerCase().includes(searchWord.toLowerCase())
          );
        setFilteredData(newFilter);
      } else if (columnName === "capacity") {
        const newFilter =
          salles.length > 0 &&
          salles.filter((salle) => salle[columnName] >= searchWord);
        setFilteredData(newFilter);
      }
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
    navigate(`/edit-salle/${id}`);
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

  const handleLogin = () => {
    window.location.href = "http://localhost:8000/auth/linkedin";
    // window.location.href = "https://www.linkedin.com/oauth/v2/authorization?client_id=78qcie9wzyy5ml&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flinkedin%2Fcallback&scope=openid+profile+email+w_member_social&response_type=code"
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
                  Liste de toutes les images des sessions
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter une Image
                </Button>
              </div>
              {/* {loginUrl != null && (
                <Link
                  to={loginUrl}
                  type="button"
                  className="btn btn-linkedin btn-social-icon-text mb-3"
                >
                  <i className="mdi mdi-linkedin"></i> LinkedIn
                </Link>
              )} */}
              <button onClick={handleLogin}>Login with LinkedIn</button>
              <ShareImageOnLinkedIn />
              <SalleModal show={showModal} handleClose={handleCloseAddModal} />
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
                              // e.target.options[4].selected
                              //   ? setShowDispoModal(true)
                              //   : setShowDispoModal(false);
                              // !e.target.options[4].selected &&
                              //   setOtherFilters(true);
                              return setColumnName(e.target.value);
                            }}
                            required
                          >
                            <option>Colonne</option>
                            <option value="name">Nom</option>
                            <option value="capacity">Capacité</option>
                            <option value="disposition">Disposition</option>
                            <option value="state">Etat</option>
                            {/* <option value="disponibility">
                                  Disponibilité
                                </option> */}
                          </Form.Select>
                        </InputGroup>
                        {/* <DisponibilityModal
                              show={showDispoModal}
                              handleClose={handleCloseDispoModal}
                              handleCallback={handleCallback}
                            /> */}
                      </Form.Group>
                    </div>
                    <div className="input-field second-wrap">
                      <Form.Group>
                        <InputGroup>
                          {/* {!showDispoModal && ( */}
                          <Form.Control
                            id="search"
                            type="text"
                            placeholder="Recherchez des salles ..."
                            size="lg"
                            name=""
                            value={wordEntered}
                            onChange={handleFilter}
                            required
                          />
                          {/* )} */}
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
                  {/* {modalDates && !otherFilters && (
                        <Card className="shadow-lg p-3 mb-2 mt-3 rounded">
                          {modalDates.map((d, i) => (
                            <div
                              pill
                              className="badge badge-outline-success badge-pill mb-2"
                              key={i}
                            >
                              {moment(d.startDate).locale("fr").format("LL")} -{" "}
                              {moment(d.endDate).locale("fr").format("LL")}
                            </div>
                          ))}
                        </Card>
                      )} */}
                </Form>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Image de la Salle</th>
                      <th>Nom de la Salle</th>
                      <th>Capacité</th>
                      <th>Disponibilité</th>
                      <th>Etat</th>
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
                              {u.disponibility}
                              {/* {Array.isArray(u.disponibility) &&
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
                                    })} */}
                            </td>
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
                                  onClick={() => handleDeleteSalle(u.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm"
                                >
                                  Supprimer <i className="mdi mdi-delete"></i>
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
                              {u.disponibility}
                              {/* {Array.isArray(u.disponibility) &&
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
                                    })} */}
                            </td>
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
                                  onClick={() => handleDeleteSalle(u.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm"
                                >
                                  Supprimer <i className="mdi mdi-delete"></i>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllSalles;
