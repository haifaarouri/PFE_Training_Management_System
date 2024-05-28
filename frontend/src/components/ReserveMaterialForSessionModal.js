import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import { reserveMaterielForSession } from "../services/SessionServices";
import { MdLaptopChromebook } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "../services/axios";
import Swal from "sweetalert2";
import { fetchAllMateriaux } from "../services/MaterielServices";

function ReserveMaterialForSessionModal({ show, onHide, session }) {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [quantity, setQuantity] = useState("");
  const [materialType, setMaterialType] = useState("");

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

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const reserveMaterial = async (event) => {
    event.preventDefault();
    await csrf();

    try {
      if (!materialType || !quantity) {
        handleError(
          "Veuillez sélectionner une type de matériel et la quantité requise !"
        );
        return;
      }

      const form = formRef.current;
      if (form.checkValidity() === false) {
        event.preventDefault();
        event.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("materialType", materialType);
      formData.append("quantity", quantity);

      const response = await reserveMaterielForSession(session.id, formData);

      if (response) {
        handleSuccess("Le matériel a été réservé avec succès !");
        Swal.fire({
          icon: "success",
          title: "Le matériel a été réservé avec succès !",
          showConfirmButton: false,
          timer: 2000,
        });
        onHide();
      }
    } catch (error) {
      if (error) {
        if (error.response.data.error) {
          Object.values(error.response.data.error).forEach((element) => {
            handleError(element[0]);
          });
        }
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
    <>
      {show && (
        <div
          style={{
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: "999",
          }}
        ></div>
      )}
      <Modal show={show} onHide={onHide} centered>
        <ToastContainer />
        <Modal.Header closeButton>
          <Modal.Title>
            Réserver matériel pour la session : {session.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex justify-content-between">
          <Form
            className="d-flex justify-content-between mb-2"
            ref={formRef}
            noValidate
            validated={validated}
            onSubmit={reserveMaterial}
          >
            <Form.Group>
              <Form.Select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value)}
                required
              >
                <option>Selectionner le type</option>
                <option value="MatérielInformatique">
                  Matériel Informatique
                </option>
                <option value="MatérielAudioVidéo">
                  Matériel Audio / Vidéo
                </option>
                <option value="Chaise">Chaise</option>
                <option value="Écran">Écran</option>
                <option value="Imprimante">Imprimante</option>
                <option value="Table">Table</option>
                <option value="Projecteur">Projecteur</option>
                <option value="Scanner">Scanner</option>
                <option value="MatérielRéseautage">
                  Matériel de Réseautage
                </option>
                <option value="Accessoires">Accessoires</option>
                <option value="Papier">Papier</option>
                <option value="Stylo">Stylo</option>
                <option value="BlocNotes">BlocNotes</option>
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez Séléctionner un type de matériel !
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Control
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                  height: "40px",
                }}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir la quantité requise pour cette session !
              </Form.Control.Feedback>
            </Form.Group>
            <Button type="submit" className="btn-sm btn-icon">
              <MdLaptopChromebook size={18} />
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ReserveMaterialForSessionModal;
