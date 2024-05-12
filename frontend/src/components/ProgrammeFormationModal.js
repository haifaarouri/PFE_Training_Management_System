import React from "react";
import { Modal } from "react-bootstrap";
import { GrPlan } from "react-icons/gr";

const ProgrammeFormationModal = ({ show, handleClose, programme }) => {
  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-md my-modal-certif"
      fullscreen="md-down"
      centered
    >
      <div className="solution_cards_box">
        {programme && (
          <div className="solution_card">
            <div className="hover_color_bubble"></div>
            <div className="solu_title d-flex justify-content-between">
              <h3>{programme.title}</h3>
              <GrPlan style={{ fontSize: "4em" }} />
            </div>
            <div className="solu_description">
              {programme.jour_formations.map((j, i) => (
                <div key={i}>
                  <dl>
                    <dt style={{ color: "rgb(54 81 207)" }}>{j.dayName}</dt>
                    {j.sous_parties.map((sp, index) => (
                      <dd key={index}>{sp.description}</dd>
                    ))}
                  </dl>
                </div>
              ))}
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

export default ProgrammeFormationModal;
