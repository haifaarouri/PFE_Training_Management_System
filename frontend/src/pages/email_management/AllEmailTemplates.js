import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Card, Modal, Pagination, Tab, Tabs } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  deleteEmailTemplate,
  fetchAllEmailLogs,
  fetchAllEmailTemplates,
} from "../../services/EmailTemplateServices";
import { AiFillDelete } from "react-icons/ai";
import { BiSolidCalendarEdit } from "react-icons/bi";
import "react-toastify/dist/ReactToastify.css";
require("moment/locale/fr");

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

const EmailTemplateModal = ({ show, onHide, emailTemplate }) => {
  const handleDelete = async (id) => {
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
          if (res) {
            Swal.fire({
              title: "Supprimé avec succès!",
              text: "Modèle d'e-mail est supprimé !",
              icon: "success",
            });
            handleSuccess(res.message);
            onHide();
          }
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

  return (
    emailTemplate && (
      <Modal
        show={show}
        onHide={onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="event-modal"
        fullscreen="lg-down"
      >
        <Modal.Header closeButton className="modal-header-custom">
          <Modal.Title
            id="contained-modal-title-vcenter"
            style={{ color: "#223e9c" }}
          >
            Modèle d'e-mail de type : {emailTemplate.type}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-body-custom">
          <Card className="mb-3">
            <Card.Body>
              <div className="d-flex justify-content-between mb-5">
                <h5 className="align-self-center">
                  Objet : {emailTemplate.subject}
                </h5>
                <div className="d-flex ">
                  <Link to={`/edit-email-template/${emailTemplate.id}`}>
                    <Button className="btn-sm btn-icon btn-inverse-info mx-1">
                      <BiSolidCalendarEdit size={22} />
                    </Button>
                  </Link>
                  <Button
                    className="btn-sm btn-icon btn-inverse-danger mx-1"
                    onClick={() => handleDelete(emailTemplate.id)}
                  >
                    <AiFillDelete size={22} />
                  </Button>
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html: JSON.parse(emailTemplate?.content)?.body?.rows[0]
                    .columns[0].contents[0].values.html,
                }}
              ></div>
            </Card.Body>
          </Card>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={onHide} variant="info">
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    )
  );
};

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
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);

  const handleShowEmailTemplateModal = (t) => {
    setShowEmailTemplateModal(true);
    setEmailTemplate(t);
  };

  const handleCloseEmailTemplateModal = () => {
    setShowEmailTemplateModal(false);
    setEmailTemplate(null);
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setEmailTemplates(d);

      const e = await fetchAllEmailLogs();
      setEmailLogs(e);
    };

    u();
  }, []);

  const handleButtonEdit = (id) => {
    navigate(`/edit-email-template/${id}`);
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
          if (res) {
            Swal.fire({
              title: "Supprimé avec succès!",
              text: "EmailTemplates est supprimé !",
              icon: "success",
            });
            const d = await fetchData();
            setEmailTemplates(d);
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
                <EmailTemplateModal
                  show={showEmailTemplateModal}
                  onHide={handleCloseEmailTemplateModal}
                  emailTemplate={emailTemplate}
                />
                <Link to="/add-email-templates">
                  <Button
                    variant="outline-success"
                    className="btn btn-sm m-3 mt-1"
                  >
                    Ajouter un modèle
                  </Button>
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
                  title="Liste de tous les modèles d'e-mails"
                >
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      {/* <colgroup>
                    <col span="1" style={{ width: "10%" }} />
                    <col span="1" style={{ width: "10%" }} />
                    <col span="1" style={{ width: "50%" }} />
                    <col span="1" style={{ width: "18%" }} />
                    <col span="1" style={{ width: "12%" }} />
                  </colgroup> */}
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
                              <tr key={index}>
                                <td>
                                  <h6>{emailTemplate.type}</h6>
                                </td>
                                <td>{emailTemplate.subject}</td>
                                <td>
                                  <Button
                                    className="btn-sm btn-inverse-primary"
                                    onClick={() =>
                                      handleShowEmailTemplateModal(
                                        emailTemplate
                                      )
                                    }
                                  >
                                    Voir le modèle{" "}
                                    <i
                                      className="mdi mdi-eye"
                                      style={{ fontSize: "1.5em" }}
                                    />
                                  </Button>
                                </td>
                                <td>
                                  {imageAttachement &&
                                    imageAttachement.length > 0 &&
                                    imageAttachement.map((image, index) => (
                                      <>
                                        <img
                                          key={index}
                                          src={`http://localhost:8000/emailAttachements/${image}`}
                                          alt={`emailAttachements ${index}`}
                                          style={{
                                            borderRadius: "8px",
                                            width: "100px",
                                            height: "100px",
                                            marginBottom: "5px",
                                          }}
                                        />
                                        <br />
                                      </>
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
                                        handleDeleteEmailTemplate(
                                          emailTemplate.id
                                        )
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
                          })}
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
                <Tab eventKey="listLogs" title="Liste des e-mails envoyés">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Type d'e-mail</th>
                          <th>Participant ID</th>
                          <th>Session ID</th>
                          <th>Date d'envoi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emailLogs.length > 0 &&
                          emailLogs.map((emailLog, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  <h6>{emailLog.email_type}</h6>
                                </td>
                                <td>{emailLog.participant_id}</td>
                                <td>{emailLog.session_id}</td>
                                <td>{emailLog.sent_at}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
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

export default AllEmailTemplates;
