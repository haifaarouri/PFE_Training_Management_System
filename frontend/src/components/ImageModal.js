import React, { useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";

const ImageModal = ({ show, handleClose, handleMsg, userId }) => {
  const [profileImage, setProfileImage] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();

  const csrf = () => axios.get("/sanctum/csrf-cookie");

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

  const handleEditImage = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append("profileImage", profileImage);

      const res = await axios.post(
        `/api/update-user-image/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.message) {
        handleMsg(res.message);

        setProfileImage("");

        handleClose();
      }
    } catch (error) {
      if (error && error.response.status === 422) {
        handleError(error.response.data.message);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">Formulaire de modification de l'image</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleEditImage}
          // encType="multipart/form-data"
        >
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                name="profileImage"
                style={{ height: "150%" }}
                type="file"
                accept="image/*"
                placeholder="Selectionner l'image de l'admin"
                onChange={(e) => setProfileImage(e.target.files[0])}
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez selectionner l'image de l'admin !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Modifier Image
            </Button>
          </div>
        </Form>
        <ToastContainer />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageModal;
