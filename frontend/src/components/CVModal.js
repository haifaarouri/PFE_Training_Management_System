import React from "react";
import { Modal } from "react-bootstrap";

const CVModal = ({ show, handleClose, cv }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-md my-modal-certif"
      fullscreen="md-down"
      centered
    >
      <div className="solution_cards_box">
        {cv && (
          <div className="solution_card">
            <div className="hover_color_bubble"></div>
            <div className="solu_title d-flex justify-content-between">
              <h3>{cv.slice(13)}</h3>
            </div>
            <div className="solu_description">
              <iframe
                src={`http://localhost:8000/TrainersCV/${cv}`}
                width="100%"
                height="600px"
                title="PDF Viewer"
              ></iframe>
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

export default CVModal;
