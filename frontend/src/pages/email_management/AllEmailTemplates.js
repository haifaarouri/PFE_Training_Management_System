import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Pagination } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  deleteEmailTemplate,
  fetchAllEmailTemplates,
} from "../../services/EmailTemplateServices";
require("moment/locale/fr");

function AllEmailTemplates() {
  const [emailTemplates, setEmailTemplates] = useState([]);
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const emailTemplatesPerPage = 2;
  const lastIndex = currentPage * emailTemplatesPerPage;
  const firstIndex = lastIndex - emailTemplatesPerPage;
  const emailTemplatesPage =
    emailTemplates.length > 0 && emailTemplates.slice(firstIndex, lastIndex);
  const numberPages = Math.ceil(
    emailTemplates.length > 0 && emailTemplates.length / emailTemplatesPerPage
  );
  const numbers = [...Array(numberPages + 1).keys()].slice(1);

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setEmailTemplates(d);
    };

    u();
  }, []);

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
    navigate(`/edit-EmailTemplates/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await fetchAllEmailTemplates();

      return response;
    } catch (error) {
      console.log("Error fetching emailTemplates :", error);
    }
  };

  const handleDeleteEmailTemplate = async (id) => {
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
          const res = await deleteEmailTemplate(id);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "EmailTemplates est supprimé !",
            icon: "success",
          });
          const d = await fetchData();
          setEmailTemplates(d);
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
                  Liste de tous les modèles d'e-mail
                </h4>
                <Link to="/add-email-templates">
                  <Button
                    variant="outline-success"
                    className="btn btn-sm m-3 mt-1"
                  >
                    Ajouter un modèle
                  </Button>
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <colgroup>
                    <col span="1" style={{ width: "10%" }} />
                    <col span="1" style={{ width: "10%" }} />
                    <col span="1" style={{ width: "50%" }} />
                    <col span="1" style={{ width: "18%" }} />
                    <col span="1" style={{ width: "12%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Object</th>
                      <th>Contenu</th>
                      <th>Pièces jointes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailTemplates.length > 0 &&
                      emailTemplatesPage.map((emailTemplate, index) => {
                        const imageAttachementString =
                          emailTemplate.imageAttachement;
                        const imageAttachement = JSON.parse(
                          imageAttachementString
                        );
                        return (
                          <tr key={index} className="text-center">
                            <td>
                              <h6>{emailTemplate.type}</h6>
                            </td>
                            <td>{emailTemplate.subject}</td>
                            <td style={{ width: "600px" }}>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: emailTemplate.content,
                                }}
                              ></div>
                            </td>
                            <td>
                              {imageAttachement &&
                                imageAttachement.length > 0 &&
                                imageAttachement.map((image, index) => (
                                  <img
                                    key={index}
                                    src={`http://localhost:8000/emailAttachements/${image}`}
                                    alt={`emailAttachements ${index}`}
                                    style={{
                                      borderRadius: "8px",
                                      width: "100%",
                                      height: "100%",
                                      marginBottom: "5px",
                                    }}
                                  />
                                ))}
                            </td>
                            <td>
                              <div className="d-flex flex-column justify-content-center">
                                <Button
                                  variant="outline-primary"
                                  onClick={() =>
                                    handleButtonEdit(emailTemplate.id)
                                  }
                                  className="btn btn-sm mb-2"
                                >
                                  Modifier{" "}
                                  <i className="mdi mdi-tooltip-edit"></i>
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleDeleteEmailTemplate(emailTemplate.id)
                                  }
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

export default AllEmailTemplates;
