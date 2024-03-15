import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import moment from "moment";
import { Badge, Form, InputGroup, Pagination } from "react-bootstrap";
import CustomModal from "../../components/CustomModal";
import { ToastContainer, toast } from "react-toastify";
import { deleteUser, fetchAllUsers } from "../../services/UserServices";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
require("moment/locale/fr");

function AllUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [msgEdit, setMsgEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 4;
  const lastIndex = currentPage * usersPerPage;
  const firstIndex = lastIndex - usersPerPage;
  const usersPage = users.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    users.length > 0 && users.length / usersPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [userAuth, setUserAuth] = useState(null);

  const resultUser = useSelector((state) => state.user);

  useEffect(() => {
    setUserAuth(resultUser.user);
  }, [resultUser.user]);

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
      const response = await fetchAllUsers();
      return response;
    } catch (error) {
      console.log("Error fetching users :", error);
    }
  };

  const result = useSelector((state) => state.msg); //pour récuperer la value de msg inside redux

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setUsers(d);
    };

    u();
    setMsgEdit(result.msg);

    if (result.msg) {
      handleSuccess(msgEdit);
    }
  }, [showModal, result.msg, msgEdit]);

  const handleDeleteUser = async (id) => {
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
          const res = await deleteUser(id);
          console.log(res);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "Administarteur est supprimé !",
            icon: "success",
          });
          const d = await fetchData();
          setUsers(d);
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

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <ToastContainer />
              <div className="d-flex justify-content-between">
                <h4 className="card-title mb-5 mt-2">
                  Liste de tous les administareurs
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter un Admin
                </Button>
              </div>
              <CustomModal show={showModal} handleClose={handleCloseAddModal} />
              <div className="d-flex justify-content-center mt-3 mb-5">
                <Form style={{ width: "50%" }}>
                  <div className="inner-form">
                    {/* <div className="input-field first-wrap"> */}
                      <div className="input-select">
                        <Form.Group>
                          <InputGroup>
                            <Form.Select
                            style={{border: "none"}}
                              name="email"
                              // value={email}
                              // onChange={(e) => setEmail(e.target.value)}
                              required
                            >
                              <option>Categorie</option>
                              <option value="E-mail">E-mail</option>
                            </Form.Select>
                          </InputGroup>
                        </Form.Group>
                      </div>
                    {/* </div> */}
                    <div className="input-field second-wrap">
                      <Form.Group>
                        <InputGroup>
                          <Form.Control
                            id="search"
                            type="text"
                            placeholder="Recherchez des administareurs ..."
                            size="lg"
                            name=""
                            // value={email}
                            // onChange={(e) => setEmail(e.target.value)}
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
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Numéro de Téléphone</th>
                      <th>Role</th>
                      <th>Date de Création</th>
                      <th>Date de Modification</th>
                      <th>Date de Vérification de l'E-mail</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 &&
                      usersPage.map((u, index) => {
                        const dateCreated = moment(u.created_at);
                        dateCreated.locale("fr");

                        const dateModified = moment(u.updated_at);
                        dateModified.locale("fr");

                        const dateVerified = moment(u.email_verified_at);
                        dateCreated.locale("fr");
                        return (
                          u.id !== userAuth.id && (
                            <tr key={index}>
                              <td>
                                <img
                                  src={
                                    u.provider === "google"
                                      ? `${u.profileImage}`
                                      : `http://localhost:8000/profilePictures/${u.profileImage}`
                                  }
                                  alt={u.profileImage}
                                />
                              </td>
                              <td>
                                <h6>{u.firstName}</h6>
                              </td>
                              <td>{u.lastName}</td>
                              <td>{u.email}</td>
                              <td>{u.phoneNumber}</td>
                              <td>{u.role}</td>
                              <td>
                                {dateCreated
                                  .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                  .replace(/am/g, "matin")
                                  .replace(/pm/g, "après-midi")}
                              </td>
                              <td>
                                {dateModified
                                  .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                  .replace(/am/g, "matin")
                                  .replace(/pm/g, "après-midi")}
                              </td>
                              <td>
                                {u.email_verified_at ? (
                                  dateVerified
                                    .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                    .replace(/am/g, "matin")
                                    .replace(/pm/g, "après-midi")
                                ) : (
                                  <Badge
                                    pill
                                    bg="danger"
                                    style={{
                                      width: "100%",
                                      height: "30px",
                                      paddingTop: "5%",
                                    }}
                                  >
                                    <i className="mdi mdi-email me-2"></i>
                                    Email non vérifié
                                  </Badge>
                                )}
                              </td>
                              <td className="d-flex flex-column justify-content-center">
                                <Link
                                  to={`/super-admin/profile-user/${u.id}`}
                                  variant="outline-info"
                                  className="btn btn-sm mb-2 btn-outline-info"
                                >
                                  Détails
                                </Link>
                                <Button
                                  variant="outline-primary"
                                  onClick={() => handleButtonEdit(u.id)}
                                  className="btn btn-sm mb-2"
                                >
                                  Modifier
                                </Button>
                                <Button
                                  onClick={() => handleDeleteUser(u.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm"
                                >
                                  Supprimer
                                </Button>
                              </td>
                            </tr>
                          )
                        );
                      })}
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

export default AllUsers;
