import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import {
  assignFormation,
  fetchPartenaireById,
} from "../services/PartenaireServices";
import { useEffect, useRef, useState } from "react";
import {
  fetchAllFormations,
  fetchFormationByRef,
} from "../services/FormationServices";
import Swal from "sweetalert2";
import axios from "../services/axios";
import { MdOutlineAbc } from "react-icons/md";

function AssignFormationModal({ show, handleClose, partenaireId }) {
  const [partenaire, setPartenaire] = useState({
    companyName: "",
    contactName: "",
    email: "",
    webSite: "",
    adresse: "",
    fax: "",
    phoneNumber: "",
  });
  const [formations, setFormations] = useState([]);
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [formationRef, setFormationRef] = useState(null);

  useEffect(() => {
    const fetchPartenaire = async () => {
      const partenaireData = await fetchPartenaireById(partenaireId);
      setPartenaire(partenaireData);
    };

    const fetchFormations = async () => {
      const f = await fetchAllFormations();
      setFormations(f);
    };

    if (partenaireId) {
      fetchPartenaire();
    }

    fetchFormations();
  }, [partenaireId]);

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleAssignFormation = async (e) => {
    e.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false || formationRef === null) {
        e.preventDefault();
        e.stopPropagation();
      }

      setValidated(true);

      fetchFormationByRef(formationRef).then(async (formationSelected) => {
        const res = await assignFormation(partenaireId, formationSelected.id);

        if (res) {
          Swal.fire({
            icon: "success",
            title: res.data.message,
            showConfirmButton: false,
            timer: 2000,
          });

          setFormationRef(null);

          handleClose();
        }
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      show={show}
      fullscreen="lg-down"
      onHide={handleClose}
      aria-labelledby="contained-modal-title-vcenter"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Assigner une formation à ce partenaire :{" "}
          {partenaire && partenaire.companyName}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={`d-flex flex-column justify-content-between`}>
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleAssignFormation}
        >
          <Form.Group className="mb-3">
            <Form.Label>Formation</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <MdOutlineAbc
                      className="text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Select
                name="formation"
                value={formationRef}
                onChange={(e) => setFormationRef(e.target.value)}
                required
              >
                <option value="">
                  Selectionner la réference de la formation
                </option>
                {formations.length > 0 &&
                  formations.map((f) => (
                    <option key={f.id} value={f.reference}>
                      {f.reference} - {f.entitled}
                    </option>
                  ))}
              </Form.Select>
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez séléctionner la réference de la formation !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Assigner
            </Button>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button className="btn-inverse-primary" onClick={handleClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default AssignFormationModal;
