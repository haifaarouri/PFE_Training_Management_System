import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import {
  Badge,
  Card,
  Carousel,
  Form,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  deleteParticipant,
  fetchAllParticipants,
} from "../../services/ParticipantServices";
import ParticipantModal from "../../components/ParticipantModal";
import { FaCalendarCheck } from "react-icons/fa";
import ParticipateSessionModal from "../../components/ParticipateSessionModal";
import { MdEdit } from "react-icons/md";
import EditStatusModal from "../../components/EditStatusModal";

function AllParticipants() {
  const [Participants, setParticipants] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ParticipantsPerPage = 2;
  const lastIndex = currentPage * ParticipantsPerPage;
  const firstIndex = lastIndex - ParticipantsPerPage;
  const ParticipantsPage =
    Participants.length > 0 && Participants.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    Participants.length > 0 && Participants.length / ParticipantsPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [showList, setShowList] = useState(true);
  const [showCarousel, setShowCarousel] = useState(false);
  const [showSession, setShowSession] = useState(false);
  const [participantId, setParticipantId] = useState("");
  const [participantIdToEditStatus, setParticipantIdToEditStatus] =
    useState("");
  const [sessionIdToEdit, setSessionIdToEdit] = useState("");
  const [showEditStatus, setShowEditStatus] = useState(false);

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setParticipants(d);
    };

    u();
  }, []);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne") {
      const newFilter =
        Participants.length > 0 &&
        Participants.filter((formateur) =>
          formateur[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else {
      const newFilter =
        Participants.length > 0 &&
        Participants.filter((formateur) => {
          const formateurFields = Object.values(formateur)
            .join(" ")
            .toLowerCase();
          return formateurFields.includes(searchWord);
        });
      setFilteredData(newFilter);
    }
  };

  // const handleShowAddModal = () => setShowModal(true);
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
    navigate(`/edit-participant/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllParticipants();

      return response;
    } catch (error) {
      console.log("Error fetching Participants :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setParticipants(d);
    };

    u();
  }, [showModal, showSession]);

  const handleDeleteParticipant = async (id) => {
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
          const res = await deleteParticipant(id);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "Participant est supprimé !",
            icon: "success",
          });
          const d = await fetchData();
          setParticipants(d);
          handleSuccess(res.message);
        } catch (error) {
          console.log(error);
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

  const handleShowSessions = (participantId) => {
    setShowSession(true);
    setParticipantId(participantId);
  };

  const handleCloseSessions = () => {
    setShowSession(false);
    setParticipantId("");
  };

  const handleShowEditParticipationStatus = (participantId, sessionId) => {
    setShowEditStatus(true);
    setParticipantIdToEditStatus(participantId);
    setSessionIdToEdit(sessionId);
  };

  const handleCloseEditParticipationStatus = () => {
    setShowEditStatus(false);
    setParticipantIdToEditStatus("");
    setSessionIdToEdit("");
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
                  Liste de tous les Participants
                </h4>
                {/* <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter un Participant
                </Button> */}
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
              <ParticipantModal
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
                                <option value="lastName">Nom</option>
                                <option value="firstName">Prénom</option>
                                <option value="email">E-mail</option>
                                <option value="type">Type</option>
                                <option value="companyName">Entreprise</option>
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
                                placeholder="Recherchez des Participants ..."
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
                          <th>Adresse</th>
                          <th>Type</th>
                          <th>Entreprise</th>
                          <th>Sessions</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length > 0 ? (
                          filteredData.map((f, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{f.lastName}</h6>
                                </td>
                                <td>
                                  <h6>{f.firstName}</h6>
                                </td>
                                <td>{f.email}</td>
                                <td>{f.phoneNumber}</td>
                                <td>{f.address}</td>
                                <td>{f.type}</td>
                                <td>{f.companyName}</td>
                                <td style={{ width: "30%" }}>
                                  {f.sessions.length > 0 &&
                                    f.sessions.map((form) => (
                                      <p
                                        key={form.id}
                                        className="rounded border border-primary p-2"
                                      >
                                        {form.title} - {form.reference}
                                        <br />
                                        Statut de participation :{" "}
                                        <Badge
                                          pill
                                          bg={
                                            form.pivot.participationStatus ===
                                              "EnAttente" ||
                                            form.pivot.participationStatus ===
                                              "Absent"
                                              ? "danger"
                                              : "success"
                                          }
                                        >
                                          {form.pivot.participationStatus}
                                        </Badge>
                                        <Button
                                          variant="outline-primary"
                                          onClick={() =>
                                            handleShowEditParticipationStatus(
                                              f.id,
                                              form.id
                                            )
                                          }
                                          className="btn btn-icon btn-rounded btn-sm m-2"
                                        >
                                          <MdEdit size={25} />
                                        </Button>
                                      </p>
                                    ))}
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
                                      variant="outline-success"
                                      onClick={() => handleShowSessions(f.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Assigner à une session
                                      <FaCalendarCheck />
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDeleteParticipant(f.id)
                                      }
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
                          Participants.length === 0 ? (
                          <></>
                        ) : (
                          Participants.length > 0 &&
                          ParticipantsPage.map((f, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{f.lastName}</h6>
                                </td>
                                <td>
                                  <h6>{f.firstName}</h6>
                                </td>
                                <td>{f.email}</td>
                                <td>{f.phoneNumber}</td>
                                <td>{f.address}</td>
                                <td>{f.type}</td>
                                <td>{f.companyName}</td>
                                <td style={{ width: "30%" }}>
                                  {f.sessions.length > 0 &&
                                    f.sessions.map((form) => (
                                      <p
                                        key={form.id}
                                        className="rounded border border-primary p-2"
                                      >
                                        {form.title} - {form.reference}
                                        <br />
                                        Statut de participation :{" "}
                                        <Badge
                                          pill
                                          bg={
                                            form.pivot.participationStatus ===
                                              "EnAttente" ||
                                            form.pivot.participationStatus ===
                                              "Absent"
                                              ? "danger"
                                              : "success"
                                          }
                                        >
                                          {form.pivot.participationStatus}
                                        </Badge>
                                        <Button
                                          variant="outline-primary"
                                          onClick={() =>
                                            handleShowEditParticipationStatus(
                                              f.id,
                                              form.id
                                            )
                                          }
                                          className="btn btn-icon btn-rounded btn-sm m-2"
                                        >
                                          <MdEdit size={25} />
                                        </Button>
                                      </p>
                                    ))}
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
                                      variant="outline-success"
                                      onClick={() => handleShowSessions(f.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Assigner à une session
                                      <FaCalendarCheck />
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDeleteParticipant(f.id)
                                      }
                                      variant="outline-danger"
                                      className="btn btn-sm"
                                    >
                                      Supprimer{" "}
                                      <i className="mdi mdi-delete"></i>
                                    </Button>
                                  </div>
                                </td>
                                <ParticipateSessionModal
                                  show={showSession}
                                  participantId={participantId}
                                  handleClose={handleCloseSessions}
                                />
                                <EditStatusModal
                                  show={showEditStatus}
                                  participantId={participantIdToEditStatus}
                                  sessionId={sessionIdToEdit}
                                  handleClose={
                                    handleCloseEditParticipationStatus
                                  }
                                  statusType="ParticipationStatus"
                                />
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
                  {Participants.length > 0 &&
                    Participants.map((f, idx) => {
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
                              onClick={() => handleDeleteParticipant(f.id)}
                              className="btn btn-sm m-1 btn-rounded col-lg-2 col-xs-12"
                            >
                              Supprimer <i className="mdi mdi-delete"></i>
                            </Button>
                          </div>
                          <div className="m-lg-5 m-md-5 m-sm-0 m-xs-0 p-sm-0 p-xs-0">
                            <Card className="shadow-lg p-3 rounded">
                              <Card.Body>
                                <Card.Title>
                                  <h2>
                                    {f.firstName} {f.lastName}
                                  </h2>
                                </Card.Title>
                                <Card.Text className="d-flex justify-content-evenly row">
                                  <div className="mt-5 mb-5 col-sm-12 col-md-12 col-lg-6">
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
                                        Adresse :
                                      </span>{" "}
                                      {f.address}
                                    </p>
                                    <p>
                                      <span className="text-primary fw-bold">
                                        Type :
                                      </span>{" "}
                                      {f.type}
                                    </p>
                                    {f.companyName && (
                                      <p>
                                        <span className="text-primary fw-bold">
                                          Entreprise :
                                        </span>{" "}
                                        {f.companyName}
                                      </p>
                                    )}
                                    {f.sessions.length > 0 && (
                                      <>
                                        <span className="text-primary fw-bold">
                                          Liste des sessions :
                                        </span>
                                        {f.sessions.map((session) => (
                                          <p key={session.id}>
                                            <span className="text-primary">
                                              {f.sessions.indexOf(session) + 1}/
                                              {"  "}
                                              {session.title} -{" "}
                                              {session.reference}
                                            </span>
                                            <br />
                                            Statut de participation :{" "}
                                            <Badge
                                              pill
                                              bg={
                                                session.pivot
                                                  .participationStatus ===
                                                  "EnAttente" ||
                                                session.pivot
                                                  .participationStatus ===
                                                  "Annulé"
                                                  ? "danger"
                                                  : "success"
                                              }
                                            >
                                              {
                                                session.pivot
                                                  .participationStatus
                                              }
                                            </Badge>{" "}
                                          </p>
                                        ))}
                                      </>
                                    )}
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

export default AllParticipants;
