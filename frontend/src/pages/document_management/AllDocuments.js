import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { ToastContainer } from "react-toastify";
import { fetchAllDocuments } from "../../services/DocumentServices";
import FileModal from "../../components/FileModal";
import { HiDocumentPlus } from "react-icons/hi2";

function Alldocuments() {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();
  const [showFileModal, setShowFileModal] = useState(false);
  const [file, setFile] = useState(null);

  const handleShowFileModal = (doc) => {
    setShowFileModal(true);
    setFile(doc);
  };
  const handleCloseFileModal = () => setShowFileModal(false);

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setDocuments(d);
    };

    u();
  }, []);

  const handleButtonEdit = (id) => {
    navigate(`/edit-formateur/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllDocuments();

      return response;
    } catch (error) {
      console.log("Error fetching documents :", error);
    }
  };

  //   const handleDeleteFormateur = async (id) => {
  //     Swal.fire({
  //       title: "Êtes-vous sûr?",
  //       text: "Vous ne pourrez pas revenir en arrière !",
  //       icon: "warning",
  //       showCancelButton: true,
  //       confirmButtonColor: "#3085d6",
  //       cancelButtonColor: "#d33",
  //       confirmButtonText: "Oui, supprimer!",
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         try {
  //           const res = await deleteFormateur(id);
  //           Swal.fire({
  //             title: "Supprimé avec succès!",
  //             text: "Formateur est supprimé !",
  //             icon: "success",
  //           });
  //           const d = await fetchData();
  //           setDocuments(d);
  //           handleSuccess(res.message);
  //         } catch (error) {
  //           if (error && error.response.status === 422) {
  //             handleError(error.response.data.message);
  //           }
  //         }
  //       }
  //     });
  //   };

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
                <Link
                  className="btn btn-outline-success btn-sm m-3 mt-1" 
                  to="/add-document"
                >
                  Ajouter un document <br/>
                  <HiDocumentPlus size={25}/>
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom du document</th>
                      <th>Taille du document</th>
                      <th>Date de dernière modification</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documents.length > 0 &&
                      documents.map((d, index) => {
                        return (
                          <tr key={index} className="text-center">
                            <td>
                              <h6>{d.name}</h6>
                            </td>
                            <td>
                              <h6>{d.size} bytes</h6>
                            </td>
                            <td>
                              <h6>
                                {new Date(d.last_modified).toLocaleString()}
                              </h6>
                            </td>
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
                                <Button
                                  onClick={() => handleShowFileModal(d)}
                                  className="btn btn-inverse-primary"
                                >
                                  <span>Ouvrir</span>
                                  <i
                                    className="mdi mdi-eye"
                                    style={{ fontSize: "1.5em" }}
                                  />
                                </Button>
                                <Button
                                  //   onClick={() => handleDeleteFormateur(d.id)}
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
                    <FileModal
                      show={showFileModal}
                      handleClose={handleCloseFileModal}
                      selectedFile={file}
                      fileContent="Template"
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Alldocuments;
