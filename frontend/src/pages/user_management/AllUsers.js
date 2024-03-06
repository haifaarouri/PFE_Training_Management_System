import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import Button from "react-bootstrap/Button";
import moment from "moment";
import { Badge, Pagination } from "react-bootstrap";
import CustomModal from "../../components/CustomModal";
import { ToastContainer, toast } from "react-toastify";
import { deleteUser } from "../../services/UserServices";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
require("moment/locale/fr");

function AllUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
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
      const response = await axios.get("/api/users");
      return response.data;
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

    if (successMsg) {
      handleSuccess(successMsg);
    }
    setMsgEdit(result.msg);

    if (result.msg) {
      handleSuccess(msgEdit);
    }
  }, [showModal, successMsg, result.msg, msgEdit]);

  const handleDataRecivedfromChild = (childData) => {
    setSuccessMsg(childData);
  };

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
              {successMsg && <ToastContainer />}
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
              <CustomModal
                show={showModal}
                handleClose={handleCloseAddModal}
                handleMsg={handleDataRecivedfromChild}
              />
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
                          <tr key={index}>
                            <td>
                              <img
                                src={`http://localhost:8000/profilePictures/${u.profileImage}`}
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
                                    paddingTop: "7%",
                                  }}
                                >
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
