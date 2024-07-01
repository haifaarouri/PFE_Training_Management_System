import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import {
  deleteVariable,
  fetchAllVariables,
} from "../../services/VariableServices";
import VariableModal from "../../components/VariableModal";
import Swal from "sweetalert2";

function Allvariables() {
  const [variables, setVariables] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const variablesPerPage = 2;
  const lastIndex = currentPage * variablesPerPage;
  const firstIndex = lastIndex - variablesPerPage;
  const variablesPage =
    variables.length > 0 && variables.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    variables.length > 0 && variables.length / variablesPerPage
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
    navigate(`/edit-variable/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllVariables();
      return response;
    } catch (error) {
      console.log("Error fetching variables :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setVariables(d);
    };

    u();
  }, [showModal]);

  const handleDeleteVariable = async (id) => {
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
          const res = await deleteVariable(id);
          Swal.fire({
            title: "Supprimée avec succès!",
            text: "Variable est supprimée !",
            icon: "success",
          });
          const d = await fetchData();
          setVariables(d);
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
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              <ToastContainer />
              <div className="d-flex justify-content-between">
                <h4 className="card-title mb-5 mt-2">
                  Liste de toutes les variables
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter une Variable
                </Button>
              </div>
              <VariableModal
                show={showModal}
                handleClose={handleCloseAddModal}
              />
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom de la Variable</th>
                      <th>Description</th>
                      <th>Table Source</th>
                      <th>Colonne source</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variables.length > 0 &&
                      variablesPage.map((u, index) => {
                        return (
                          <tr key={index}>
                            <td>
                              <h6>{u.variable_name}</h6>
                            </td>
                            <td>{u.description}</td>
                            <td>{u.source_model}</td>
                            <td>{u.source_field}</td>
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
                                  onClick={() => handleDeleteVariable(u.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm"
                                >
                                  Supprimer <i className="mdi mdi-delete"></i>
                                </Button>
                              </div>
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

export default Allvariables;
