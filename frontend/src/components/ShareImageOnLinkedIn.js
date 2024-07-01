import React, { useRef, useState } from "react";
import axios from "axios";
import { Button, Form, Modal } from "react-bootstrap";
import { ToastContainer } from "react-toastify";

const ShareImageOnLinkedIn = ({ show, handleClose, image }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef();
  const [validated, setValidated] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await axios.post("/api/sessions/images/share/linkedin", {
        image_id: image.id,
        message: message,
      });
      alert("Image shared successfully on LinkedIn!");
    } catch (error) {
      alert("Failed to share image on LinkedIn: " + error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      dialogClassName="modal-lg"
      fullscreen="lg-down"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">Partager sur LinkedIn</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleShare}
        >
          <Form.Control
            className="mb-2"
            as="textarea"
            name="description"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Saisir un message"
          />
          <div className="d-flex justify-content-center mt-4">
            <Button
              disabled={loading}
              className="btn-inverse-primary"
              type="submit"
            >
              Partager{" "}
              {loading ? "Partage en cours..." : "Partagé sur LinkedIn !"}
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareImageOnLinkedIn;
