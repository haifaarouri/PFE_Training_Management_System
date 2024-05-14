import { useRef, useState } from "react";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import { BsCalendar2PlusFill } from "react-icons/bs";

const EventCreationModal = ({ isOpen, onClose, onSave, slotInfo }) => {
  const [title, setTitle] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

  const handleSubmit = () => {
    onSave({
      title,
      start: slotInfo.start,
      end: slotInfo.end,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      show={isOpen}
      //   fullscreen="lg-down"
      onHide={onClose}
      aria-labelledby="contained-modal-title-vcenter"
      //   centered
      //   backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Créer un nouveau évenement
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`d-flex flex-column justify-content-between`}>
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleSubmit}
        >
          <Form.Group className="mb-3">
            <Form.Label>Titre de l'évenement</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <BsCalendar2PlusFill
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Saisir le title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir le title de l'évenement !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Sauvegarder
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button className="btn-inverse-primary" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
    // <div
    //   style={{
    //     // position: "fixed",
    //     // top: "20%",
    //     // left: "30%",
    //     backgroundColor: "white",
    //     padding: "20px",
    //     // zIndex: 1000,
    //   }}
    // >
    //   <h2>Create Event</h2>
    //   <input
    //     type="text"
    //     placeholder="Event Title"
    //     value={title}
    //     onChange={(e) => setTitle(e.target.value)}
    //   />
    //   <button onClick={handleSubmit}>Save</button>
    //   <button onClick={onClose}>Cancel</button>
    // </div>
  );
};

export default EventCreationModal;
