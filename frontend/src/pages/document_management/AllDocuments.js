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
import { Pagination, Tab, Tabs } from "react-bootstrap";

function Alldocuments() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const [showFileModal, setShowFileModal] = useState(false);
  const [file, setFile] = useState(null);
  const [docLogs, setDocLogs] = useState([]);
  const [showDoc, setShowDoc] = useState(false);
  const [doc, setDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const documentsPerPage = 5;
  const lastIndex = currentPage * documentsPerPage;
  const firstIndex = lastIndex - documentsPerPage;
  const documentsPage =
    documents.length > 0 && documents.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    documents.length > 0 && documents.length / documentsPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);
  const [currentPagedocLogs, setcurrentPagedocLogs] = useState(1);
  const docLogsPerPage = 5;
  const lastIndexEmailLog = currentPagedocLogs * docLogsPerPage;
  const firstIndexEmailLog = lastIndexEmailLog - docLogsPerPage;
  const docLogsPage =
    docLogs.length > 0 &&
    docLogs.slice(firstIndexEmailLog, lastIndexEmailLog);
  const nbrPages = Math.ceil(
    docLogs.length > 0 && docLogs.length / docLogsPerPage
  );
  const nbrs = [...Array(nbrPages + 1).keys()].slice(1);

  // const handleShowFileModal = (doc) => {
  //   setShowFileModal(true);
  //   setFile(doc);
  // };

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

  const prevLogsPage = () => {
    if (currentPagedocLogs !== 1) {
      setcurrentPagedocLogs(currentPagedocLogs - 1);
    }
  };

  const changeCurrentLogsPage = (n) => {
    setcurrentPagedocLogs(n);
  };

  const nextLogsPage = () => {
    if (currentPagedocLogs !== numberPages) {
      setcurrentPagedocLogs(currentPagedocLogs + 1);
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
                  Liste de tous les documents (modèles)
                </h4>
                <ToastContainer />
                <Link
                  className="btn btn-outline-success btn-sm m-3 mt-1"
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
                          documentsPage.map((d, index) => {
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
                          docLogsPage.map((docLog, index) => {
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
                    <Pagination className="d-flex justify-content-center mt-5">
                      <Pagination.Prev
                        onClick={prevLogsPage}
                        disabled={currentPagedocLogs === 1}
                      >
                        <i
                          className="mdi mdi-arrow-left-bold-circle-outline"
                          style={{ fontSize: "1.5em" }}
                        />
                      </Pagination.Prev>
                      {nbrs.map((n, i) => (
                        <Pagination.Item
                          className={`${
                            currentPagedocLogs === n ? "active" : ""
                          }`}
                          key={i}
                          style={{ fontSize: "1.5em" }}
                          onClick={() => changeCurrentLogsPage(n)}
                        >
                          {n}
                        </Pagination.Item>
                      ))}
                      <Pagination.Next
                        onClick={nextLogsPage}
                        disabled={currentPagedocLogs === nbrPages}
                      >
                        <i
                          className="mdi mdi-arrow-right-bold-circle-outline"
                          style={{ fontSize: "1.5em" }}
                        />
                      </Pagination.Next>
                    </Pagination>
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
