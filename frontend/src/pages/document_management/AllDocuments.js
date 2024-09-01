import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import {
  deleteDocument,
  fetchAllDocumentLogs,
  fetchAllDocuments,
} from "../../services/DocumentServices";
import FileModal from "../../components/FileModal";
import { HiDocumentPlus } from "react-icons/hi2";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import { Tab, Tabs } from "react-bootstrap";
import ReactPaginate from "react-paginate";

function Alldocuments() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const [showFileModal, setShowFileModal] = useState(false);
  const [file, setFile] = useState(null);
  const [docLogs, setDocLogs] = useState([]);
  const [showDoc, setShowDoc] = useState(false);
  const [doc, setDoc] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 2;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = documents?.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(documents?.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % documents.length;
    setItemOffset(newOffset);
  };

  const [itemOffset2, setItemOffset2] = useState(0);
  const itemsPerPage2 = 5;
  const endOffset2 = itemOffset2 + itemsPerPage2;
  const currentItems2 = docLogs?.slice(itemOffset2, endOffset2);
  const pageCount2 = Math.ceil(docLogs?.length / itemsPerPage2);

  const handlePageClick2 = (event) => {
    const newOffset = (event.selected * itemsPerPage2) % docLogs.length;
    setItemOffset2(newOffset);
  };

  const handleCloseFileModal = () => setShowFileModal(false);

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setDocuments(d);

      const doc = await fetchAllDocumentLogs();
      setDocLogs(doc);
    };

    u();
  }, []);

  const handleButtonEdit = (id) => {
    navigate(`/edit-document-template/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllDocuments();

      return response;
    } catch (error) {
      console.log("Error fetching documents :", error);
    }
  };

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

  const handleDeleteDocument = async (id) => {
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
          const res = await deleteDocument(id);
          if (res) {
            Swal.fire({
              title: "Supprimé avec succès!",
              text: "Modèle du document est supprimé !",
              icon: "success",
            });
            const d = await fetchData();
            setDocuments(d);
            handleSuccess(res.message);
          }
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

  const handleShowDoc = (f) => {
    setShowDoc(true);
    setDoc(f);
  };

  const handleCloseDoc = () => {
    setShowDoc(false);
    setDoc(null);
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
                  Liste de tous les documents (modèles)
                </h4>
                <ToastContainer />
                <Link
                  className="btn btn-outline-success btn-sm mb-5"
                  to="/add-document"
                >
                  Ajouter un document
                  <HiDocumentPlus size={22} />
                </Link>
              </div>
              <Tabs
                defaultActiveKey="listTemplates"
                id="justify-tab-example"
                className="mb-3"
                justify
              >
                <Tab
                  eventKey="listTemplates"
                  title="Liste de tous les modèles de documents"
                >
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Nom du document</th>
                          <th>Type du document</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documents.length > 0 &&
                          currentItems?.map((d, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{d.docName}</h6>
                                </td>
                                <td>{d.type}</td>
                                <td style={{ width: "15%" }}>
                                  <div className="d-flex flex-column justify-content-center">
                                    <Button
                                      variant="outline-primary"
                                      onClick={() => handleButtonEdit(d.id)}
                                      className="btn btn-sm mb-2"
                                    >
                                      Modifier{" "}
                                      <i className="mdi mdi-tooltip-edit"></i>
                                    </Button>
                                    {/* <Button
                                  onClick={() => handleShowFileModal(d)}
                                  className="btn btn-inverse-primary"
                                >
                                  <span>Ouvrir</span>
                                  <i
                                    className="mdi mdi-eye"
                                    style={{ fontSize: "1.5em" }}
                                  />
                                </Button> */}
                                    <Button
                                      onClick={() => handleDeleteDocument(d.id)}
                                      variant="outline-danger"
                                      className="btn btn-sm"
                                      disabled={d.variable_templates.length > 0}
                                    >
                                      Supprimer{" "}
                                      <i className="mdi mdi-delete"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        <FileModal
                          show={showFileModal}
                          handleClose={handleCloseFileModal}
                          selectedFile={file}
                          fileContent="Template"
                        />
                      </tbody>
                    </table>
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
                </Tab>
                <Tab eventKey="listLogs" title="Liste des documents générés">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Type d'e-mail</th>
                          <th>Participant ID</th>
                          <th>Session ID</th>
                          <th>Formation ID</th>
                          <th>Date d'envoi</th>
                          <th>Document généré</th>
                        </tr>
                      </thead>
                      <tbody>
                        {docLogs.length > 0 &&
                          currentItems2.map((docLog, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{docLog.document_type}</h6>
                                </td>
                                <td>{docLog.participant_id}</td>
                                <td>{docLog.session_id}</td>
                                <td>{docLog.formation_id}</td>
                                <td>{docLog.generated_at}</td>
                                <td>
                                  <Button
                                    className="btn btn-inverse-primary"
                                    onClick={() =>
                                      handleShowDoc(docLog.document_generated)
                                    }
                                  >
                                    Ouvrir le fichier{" "}
                                    <i
                                      className="mdi mdi-eye"
                                      style={{ fontSize: "1.2em" }}
                                    />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel="->"
                      onPageChange={handlePageClick2}
                      pageRangeDisplayed={3}
                      marginPagesDisplayed={2}
                      pageCount={pageCount2}
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
                    <FileModal
                      show={showDoc}
                      handleClose={handleCloseDoc}
                      selectedFile={doc}
                      fileContent="documentGenerated"
                    />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alldocuments;
