import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import { Card, Modal, Tab, Tabs } from "react-bootstrap";
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
import ReactPaginate from "react-paginate";
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
  emailTemplate &&
    console.log(
      JSON.parse(emailTemplate?.content)?.body?.rows[0].columns[0].contents[0]
        .values.html
    );
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
                    disabled={emailTemplate.variable_templates.length > 0}
                  >
                    <AiFillDelete size={22} />
                  </Button>
                </div>
              </div>
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    JSON.parse(emailTemplate?.content)?.body?.rows[0].columns[0]
                      .contents[0].values.html || emailTemplate.htmlContent,
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
  const [showEmailTemplateModal, setShowEmailTemplateModal] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 2;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = emailTemplates?.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(emailTemplates?.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % emailTemplates.length;
    setItemOffset(newOffset);
  };

  const [itemOffset2, setItemOffset2] = useState(0);
  const itemsPerPage2 = 5;
  const endOffset2 = itemOffset2 + itemsPerPage2;
  const currentItems2 = emailLogs?.slice(itemOffset2, endOffset2);
  const pageCount2 = Math.ceil(emailLogs?.length / itemsPerPage2);

  const handlePageClick2 = (event) => {
    const newOffset = (event.selected * itemsPerPage2) % emailLogs.length;
    setItemOffset2(newOffset);
  };

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
                          currentItems?.map((emailTemplate, index) => {
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
                                      disabled={
                                        emailTemplate.variable_templates
                                          .length > 0
                                      }
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
                          currentItems2?.map((emailLog, index) => {
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
