import React from "react";
import { Modal } from "react-bootstrap";
import { LiaCertificateSolid } from "react-icons/lia";
import { MdOutlineOpenInNew } from "react-icons/md";

const CertifModal = ({ show, handleClose, certif }) => {
  function redirectToExternalLink() {
    window.location.href = certif.urlCertificat;
  }
  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-md my-modal-certif"
      fullscreen="md-down"
      centered
    >
      <div className="solution_cards_box">
        {certif && (
          <div className="solution_card">
            <div className="hover_color_bubble"></div>
            <div className="solu_title d-flex justify-content-between">
              <h3>{certif.name}</h3>
              <LiaCertificateSolid style={{ fontSize: "4em" }} />
            </div>
            <div className="solu_description">
              <p>Oraganisme de délivrance : {certif.organisme}</p>
              <p>Date d'obtention : {certif.obtainedDate}</p>
              {certif.idCertificat && (
                <p>
                  ID du certficat :{" "}
                  {/* <Link to={certif.idCertificat}>
                    Afficher l'ID <MdOutlineOpenInNew />
                  </Link> */}
                  <button
                    onClick={() => (window.location.href = certif.idCertificat)}
                  >
                    Afficher l'ID <MdOutlineOpenInNew />
                  </button>{" "}
                </p>
              )}
              {certif.urlCertificat && (
                <p>
                  URL du certificat :{" "}
                  {/* <Link to={certif.urlCertificat}>
                    Afficher l'URL <MdOutlineOpenInNew />
                  </Link> */}
                  <button onClick={redirectToExternalLink}>
                    Afficher l'URL <MdOutlineOpenInNew />
                  </button>{" "}
                </p>
              )}
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="read_more_btn"
                  onClick={handleClose}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CertifModal;
