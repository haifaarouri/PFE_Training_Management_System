import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import ShareImageOnLinkedIn from "../../components/ShareImageOnLinkedIn";
import SessionImageModal from "../../components/SessionImageModal";
import {
  deleteImageSession,
  fetchAllImageSessions,
} from "../../services/ImageSessionServices";
import { PiShareFat } from "react-icons/pi";
import ImageSessionShareModal from "../../components/ImageSessionShareModal";
import ReactPaginate from "react-paginate";

function AllimagesSessions() {
  const [imagesSessions, setImagesSessions] = useState([]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [wordEntered, setWordEntered] = useState("");
  const [columnName, setColumnName] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [imageToShare, setImageToShare] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 2;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = imagesSessions?.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(imagesSessions?.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % imagesSessions.length;
    setItemOffset(newOffset);
  };

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
          imagesSessions.length > 0 &&
          imagesSessions.filter((salle) =>
            salle[columnName].toLowerCase().includes(searchWord.toLowerCase())
          );
        setFilteredData(newFilter);
      } else if (columnName === "capacity") {
        const newFilter =
          imagesSessions.length > 0 &&
          imagesSessions.filter((salle) => salle[columnName] >= searchWord);
        setFilteredData(newFilter);
      }
    } else {
      const newFilter =
        imagesSessions.length > 0 &&
        imagesSessions.filter((salle) => {
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
    navigate(`/edit-image-session/${id}`);
  };

  useEffect(() => {
    fetchAllImageSessions().then(setImagesSessions);
  }, [showModal]);

  const handleDeleteImageSession = async (id) => {
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
          const res = await deleteImageSession(id);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "Image de la session est supprimée !",
            icon: "success",
          });
          const d = await fetchAllImageSessions();
          setImagesSessions(d);
          handleSuccess(res.message);
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

  const handleShowShareModal = (i) => {
    setImageToShare(i);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setImageToShare(null);
    setShowShareModal(false);
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
              <ShareImageOnLinkedIn />
              <SessionImageModal
                show={showModal}
                handleClose={handleCloseAddModal}
              />
              <ImageSessionShareModal
                show={showShareModal}
                handleClose={handleCloseShareModal}
                imageToShare={imageToShare}
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
                            onChange={(e) => {
                              return setColumnName(e.target.value);
                            }}
                            required
                          >
                            <option>Colonne</option>
                            <option value="type">Type</option>
                            <option value="session_id">Session</option>
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
                            placeholder="Recherchez des images de sessions ..."
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
                      <th>Image de la session</th>
                      <th>Type de l'image</th>
                      <th>Session</th>
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
                                src={`http://localhost:8000/SessionImages/${u.path}`}
                                alt={u.path}
                                style={{
                                  borderRadius: "8px",
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </td>
                            <td>
                              <h6>{u.type}</h6>
                            </td>
                            <td>{u.session_id}</td>
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
                                  onClick={() => handleDeleteImageSession(u.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm"
                                >
                                  Supprimer <i className="mdi mdi-delete"></i>
                                </Button>
                                <Button
                                  onClick={() => handleShowShareModal(u)}
                                  variant="outline-info"
                                  className="btn btn-sm"
                                >
                                  Partager <PiShareFat size={20} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : filteredData.length === 0 &&
                      imagesSessions.length === 0 ? (
                      <></>
                    ) : (
                      imagesSessions.length > 0 &&
                      currentItems?.map((u, index) => {
                        return (
                          <tr key={index}>
                            <td style={{ width: "25%" }}>
                              <img
                                src={`http://localhost:8000/SessionImages/${u.path}`}
                                alt={u.path}
                                style={{
                                  borderRadius: "8px",
                                  width: "100%",
                                  height: "100%",
                                }}
                              />
                            </td>
                            <td>
                              <h6>{u.type}</h6>
                            </td>
                            <td>{u.session_id}</td>
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
                                  onClick={() => handleDeleteImageSession(u.id)}
                                  variant="outline-danger"
                                  className="btn btn-sm mb-2"
                                >
                                  Supprimer <i className="mdi mdi-delete"></i>
                                </Button>
                                <Button
                                  onClick={() => handleShowShareModal(u)}
                                  variant="outline-info"
                                  className="btn btn-sm"
                                >
                                  Partager <PiShareFat size={20} />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllimagesSessions;
