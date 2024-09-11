import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  deletePartenaire,
  fetchAllPartenaires,
} from "../../services/PartenaireServices";
import PartenaireModal from "../../components/PartenaireModal";
import { FaLink } from "react-icons/fa";
import AssignFormationModal from "../../components/AssignFormationModal";
import ReactPaginate from "react-paginate";

function Allparteniares() {
  const [parteniares, setParteniares] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState(null);
  const [columnName, setColumnName] = useState(null);
  const [showAssignFormationModal, setShowAssignFormationModal] =
    useState(false);
  const [partenaireId, setpartenaireId] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 2;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = parteniares?.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(parteniares?.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % parteniares.length;
    setItemOffset(newOffset);
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setParteniares(d);
    };

    u();
  }, [showAssignFormationModal]);

  const handleFilter = (event) => {
    const searchWord = event.target.value.toLowerCase();
    setWordEntered(searchWord);
    if (columnName && columnName !== "Colonne") {
      const newFilter =
        parteniares.length > 0 &&
        parteniares.filter((formateur) =>
          formateur[columnName].toLowerCase().includes(searchWord.toLowerCase())
        );
      setFilteredData(newFilter);
    } else {
      const newFilter =
        parteniares.length > 0 &&
        parteniares.filter((formateur) => {
          const formateurFields = Object.values(formateur)
            .join(" ")
            .toLowerCase();
          return formateurFields.includes(searchWord);
        });
      setFilteredData(newFilter);
    }
  };

  const handleShowAddModal = () => setShowModal(true);
  const handleCloseAddModal = () => setShowModal(false);

  const handleShowAssignFormationModalModal = (partenaireId) => {
    setShowAssignFormationModal(true);
    setpartenaireId(partenaireId);
  };
  const handleCloseAssignFormationModalModal = () =>
    setShowAssignFormationModal(false);

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
    navigate(`/edit-partenaire/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllPartenaires();

      return response;
    } catch (error) {
      console.log("Error fetching parteniares :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setParteniares(d);
    };

    u();
  }, [showModal]);

  const handleDeletePartenaire = async (id) => {
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
          const res = await deletePartenaire(id);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "Partenaire est supprimé !",
            icon: "success",
          });
          const d = await fetchData();
          setParteniares(d);
          handleSuccess(res.message);
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
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
                  Liste de tous les partenaires
                </h4>
                <Button
                  variant="outline-success"
                  className="btn btn-sm m-3 mt-1"
                  onClick={handleShowAddModal}
                >
                  Ajouter un Partenaire
                </Button>
              </div>
              <PartenaireModal
                show={showModal}
                handleClose={handleCloseAddModal}
              />
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
                            <option value="companyName">
                              Nom de l'entreprise
                            </option>
                            <option value="contactName">Nom du contact</option>
                            <option value="email">E-mail</option>
                            <option value="webSite">Site web</option>
                            <option value="adresse">Adresse</option>
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
                            placeholder="Recherchez des parteniares ..."
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
                    <tr style={{ color: "black" }}>
                      <th>Nom de l'entreprise</th>
                      <th>Nom du contact</th>
                      <th>E-mail</th>
                      <th>Numéro de téléphone</th>
                      <th>Fax</th>
                      <th>Site web</th>
                      <th>Adresse</th>
                      <th>Formations assignées</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((p, index) => {
                        return (
                          <tr key={index} className="text-center">
                            <td>
                              <h6>{p.companyName}</h6>
                            </td>
                            <td>
                              <h6>{p.contactName}</h6>
                            </td>
                            <td>{p.email}</td>
                            <td>{p.phoneNumber}</td>
                            <td>{p.fax}</td>
                            <td>{p.webSite}</td>
                            <td>{p.adresse}</td>
                            <td>
                              {p.formations.length > 0 ? (
                                p.formations.map((f) => (
                                  <p key={f.id}>
                                    {f.reference} - {f.entitled}
                                  </p>
                                ))
                              ) : (
                                <p>Pas de Formations</p>
                              )}
                            </td>
                            <td style={{ width: "15%" }}>
                              <div className="d-flex flex-column justify-content-center">
                                <Button
                                  variant="outline-primary"
                                  onClick={() => handleButtonEdit(p.id)}
                                  className="btn btn-sm mb-2"
                                >
                                  Modifier{" "}
                                  <i className="mdi mdi-tooltip-edit"></i>
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleShowAssignFormationModalModal(p.id)
                                  }
                                  variant="outline-warning"
                                  className="btn btn-sm mb-2"
                                >
                                  Assigner une formation{" "}
                                  <i>
                                    <FaLink />
                                  </i>
                                </Button>
                                <Button
                                  onClick={() => handleDeletePartenaire(p.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm"
                                  disabled={p.formations.length > 0}
                                >
                                  Supprimer <i className="mdi mdi-delete"></i>
                                </Button>
                              </div>
                            </td>
                            <AssignFormationModal
                              show={showAssignFormationModal}
                              handleClose={handleCloseAssignFormationModalModal}
                              partenaireId={partenaireId}
                            />
                          </tr>
                        );
                      })
                    ) : filteredData.length === 0 &&
                      parteniares.length === 0 ? (
                      <></>
                    ) : (
                      parteniares.length > 0 &&
                      currentItems?.map((p, index) => {
                        return (
                          <tr key={index} className="text-center">
                            <td>
                              <h6>{p.companyName}</h6>
                            </td>
                            <td>
                              <h6>{p.contactName}</h6>
                            </td>
                            <td>{p.email}</td>
                            <td>{p.phoneNumber}</td>
                            <td>{p.fax}</td>
                            <td>{p.webSite}</td>
                            <td>{p.adresse}</td>
                            <td>
                              {p.formations.length > 0 ? (
                                p.formations.map((f) => (
                                  <p key={f.id}>
                                    {f.reference} - {f.entitled}
                                  </p>
                                ))
                              ) : (
                                <p>Pas de Formations</p>
                              )}
                            </td>
                            <td style={{ width: "15%" }}>
                              <div className="d-flex flex-column justify-content-center">
                                <Button
                                  variant="outline-primary"
                                  onClick={() => handleButtonEdit(p.id)}
                                  className="btn btn-sm mb-2"
                                >
                                  Modifier{" "}
                                  <i className="mdi mdi-tooltip-edit"></i>
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleShowAssignFormationModalModal(p.id)
                                  }
                                  variant="outline-warning"
                                  className="btn btn-sm mb-2"
                                >
                                  Assigner une formation{" "}
                                  <i>
                                    <FaLink />
                                  </i>
                                </Button>
                                <Button
                                  onClick={() => handleDeletePartenaire(p.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm"
                                  disabled={p.formations.length > 0}
                                >
                                  Supprimer <i className="mdi mdi-delete"></i>
                                </Button>
                              </div>
                            </td>
                            <AssignFormationModal
                              show={showAssignFormationModal}
                              handleClose={handleCloseAssignFormationModalModal}
                              partenaireId={partenaireId}
                            />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Allparteniares;
