import React, { useState, useEffect, useRef } from "react";
import axios from "../services/axios";
import { deleteTask, fetchAllTasks } from "../services/TaskServices";
import { fetchAllSessions } from "../services/SessionServices";
import { Button, Form } from "react-bootstrap";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import {
  FaSortAmountUp,
  FaSortAmountDown,
  FaTrash,
  FaEdit,
} from "react-icons/fa";
import { BsPlusCircle } from "react-icons/bs";
import TastEditModal from "../components/TaskEditModal";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    due_date: "",
    session_id: "",
  });
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("added-date");
  const [order, setOrder] = useState("asc");

  useEffect(() => {
    fetchAllTasks(filter, sort, order).then(setTasks);
    fetchAllSessions().then(setSessions);
  }, [filter, showEdit, order, sort]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
  };

  const handleOrderChange = (order) => {
    setOrder(order);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({ ...newTask, [name]: value });
  };

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

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleAddTask = async (event) => {
    event.preventDefault();
    await csrf();
    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      try {
        if (!localStorage.getItem("token")) {
          const res = await axios.post("/api/tasks", newTask, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (res.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Tache ajoutée avec succès !",
              showConfirmButton: false,
              timer: 2000,
            });

            setNewTask({
              title: "",
              description: "",
              due_date: "",
              session_id: "",
            });

            fetchAllTasks().then(setTasks);
          }
        } else {
          const headers = {
            "Content-Type": "multipart/form-data",
          };

          const token = localStorage.getItem("token");
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }

          const response = await axios.post("/api/tasks", newTask, {
            headers: headers,
          });

          if (response.status === 201) {
            Swal.fire({
              icon: "success",
              title: "Tache ajoutée avec succès !",
              showConfirmButton: false,
              timer: 2000,
            });

            setNewTask({
              title: "",
              description: "",
              due_date: "",
              session_id: "",
            });

            fetchAllTasks().then(setTasks);
          }
        }
      } catch (error) {
        console.log("Error adding a new materiel :", error);
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

  const handleEditTask = async (task) => {
    setShowEdit(true);
    setTaskToEdit(task);
    console.log(task);
  };

  const handleCloseEditTask = async () => {
    setShowEdit(false);
    setTaskToEdit(null);
  };

  const handleDeleteTask = async (taskId) => {
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
          const res = await deleteTask(taskId);
          Swal.fire({
            title: "Supprimé avec succès!",
            text: "Tache est supprimée !",
            icon: "success",
          });
          fetchAllTasks().then(setTasks);
          handleSuccess(res.message);
        } catch (error) {
          if (error && error.response.status === 422) {
            handleError(error.response.data.message);
          }
        }
      }
    });
  };

  return (
    <div className="task-list">
      <ToastContainer />
      <div className="row m-1 p-3 px-5 justify-content-between">
        <div className="col-auto d-flex align-items-center">
          <label className="text-secondary view-opt-label mx-2">Filtrer</label>
          <Form.Select value={filter} onChange={handleFilterChange}>
            <option value="all" selected="">
              Toutes
            </option>
            <option value="completed">Completées</option>
            <option value="active">En cours</option>
            <option value="has-due-date">Avec date d'échéance</option>
          </Form.Select>
        </div>
        <div className="col-auto d-flex align-items-center">
          <label className="text-secondary view-opt-label mx-2">Trier</label>
          <Form.Select value={sort} onChange={handleSortChange}>
            <option value="added-date-asc" selected="">
              Date d'ajout
            </option>
            <option value="due-date-desc">Échéance</option>
          </Form.Select>
          <i
            className="text-info btn mx-0 px-0 pl-1"
            data-toggle="tooltip"
            data-placement="bottom"
            title="Ascendant"
            onClick={() => handleOrderChange("asc")}
          >
            <FaSortAmountUp size={25} />
          </i>
          <i
            className="text-info btn mx-0 px-0 pl-1"
            data-toggle="tooltip"
            data-placement="bottom"
            title="Décroissant"
            onClick={() => handleOrderChange("desc")}
          >
            <FaSortAmountDown size={25} />
          </i>
        </div>
        <Button
          className="btn-icon btn-inverse-primary btn-rounded"
          onClick={() => setShowAdd(!showAdd)}
        >
          <BsPlusCircle size={25} />
        </Button>
      </div>
      {showAdd && (
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAddTask}
        >
          <Form.Control
            className="mb-2"
            type="text"
            name="title"
            value={newTask.title}
            onChange={handleInputChange}
            placeholder="Saisir le titre de la tache"
            required
          />
          <Form.Control
            className="mb-2"
            as="textarea"
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            placeholder="Saisir la description de la tache"
          />
          <Form.Control
            className="mb-2"
            type="date"
            name="due_date"
            value={newTask.due_date}
            onChange={handleInputChange}
          />
          <Form.Select
            name="session_id"
            value={newTask.session_id}
            onChange={handleInputChange}
          >
            <option value="">Sélectionner une session</option>
            {sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.title} - {session.reference}
              </option>
            ))}
          </Form.Select>
          <div className="d-flex justify-content-center mt-4">
            <Button className="btn-inverse-primary" type="submit">
              Ajouter
            </Button>
          </div>
        </Form>
      )}
      <TastEditModal
        taskToEdit={taskToEdit}
        show={showEdit}
        handleClose={handleCloseEditTask}
      />
      <div className="row mx-1 w-80 mt-4">
        <ul>
          {tasks.map((task) => (
            <li
              key={task.id}
              className="d-flex justify-content-between task-card"
            >
              <div>
                <h3 className="task-title">{task.title}</h3>
                <p className="task-description">{task.description}</p>
                <p className="task-details">Due: {task.due_date}</p>
                <p className="task-details">
                  Session:{" "}
                  {task.session_id
                    ? sessions.find((s) => s.id === task.session_id)?.title
                    : "None"}
                </p>
                <p className="task-details">
                  {task.completed ? "Completée" : "En cours"}
                </p>
              </div>
              <div className="task-actions">
                <Button
                  onClick={() => handleDeleteTask(task.id)}
                  className="btn btn-info btn-rounded btn-inverse-danger mx-2 p-2"
                >
                  <FaTrash size={22} />
                </Button>
                <Button
                  onClick={() => handleEditTask(task)}
                  className="btn btn-info btn-rounded btn-inverse-info mx-2 p-2"
                >
                  <FaEdit size={22} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;
