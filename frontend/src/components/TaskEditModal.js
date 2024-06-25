import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { editTask } from "../services/TaskServices";
import { fetchAllSessions } from "../services/SessionServices";

const TastEditModal = ({ taskToEdit, show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [task, setTask] = useState({});
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    setTask(taskToEdit);
    fetchAllSessions().then(setSessions);
  }, [taskToEdit]);

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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTask({
      ...task,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEditTask = async (event) => {
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
      formData.append("_method", "PUT");
      formData.append("title", task.title);
      formData.append("description", task.description);
      formData.append("due_date", task.due_date);
      formData.append("session_id", task.session_id);
      formData.append("completed", JSON.parse(task.completed));

      try {
        const res = await editTask(task.id, formData);

        if (res) {
          Swal.fire({
            icon: "success",
            title: "Tache modifiée avec succès !",
            showConfirmButton: false,
            timer: 2000,
          });

          setTask({
            title: "",
            description: "",
            due_date: "",
            session_id: "",
          });

          handleClose();
        }
      } catch (error) {
        console.log("Error editing a task :", error);
      }
    } catch (error) {
      if (error && error.response.status === 422) {
        handleError(error.response.data.message);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Quelque chose s'est mal passé !",
        });
      }
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
          <h5 className="modal-title">
            Formulaire pour modifier la tache : {taskToEdit?.title}
          </h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleEditTask}
        >
          <Form.Control
            className="mb-2"
            type="text"
            name="title"
            value={task?.title}
            onChange={handleInputChange}
            placeholder="Saisir le titre de la tache"
            required
          />
          <Form.Control
            className="mb-2"
            as="textarea"
            name="description"
            value={task?.description}
            onChange={handleInputChange}
            placeholder="Saisir la description de la tache"
          />
          <Form.Control
            className="mb-2"
            type="date"
            name="due_date"
            value={task?.due_date}
            onChange={handleInputChange}
          />
          <Form.Select
            className="mb-2"
            name="session_id"
            value={task?.session_id}
            onChange={handleInputChange}
          >
            <option value="">Sélectionner une session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} - {session.reference}
              </option>
            ))}
          </Form.Select>
          <Form.Check
            className="mx-4"
            label="Completée"
            type="checkbox"
            name="completed"
            checked={task?.completed}
            onChange={handleInputChange}
          />
          <div className="d-flex justify-content-center mt-4">
            <Button className="btn-inverse-primary" type="submit">
              Mettre à jour
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

export default TastEditModal;
