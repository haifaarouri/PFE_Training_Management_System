import React, { useEffect, useRef, useState } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../../services/axios";
import Swal from "sweetalert2";
import { fetchAllSessions } from "../../services/SessionServices";
import { useNavigate, useParams } from "react-router-dom";
import { editImageSession, fetchImageSessionById } from "../../services/ImageSessionServices";

const SessionImageModal = () => {
    const [sessions, setSessions] = useState([]);
    const [validated, setValidated] = useState(false);
    const formRef = useRef();
    const navigate = useNavigate();
    const params = useParams();
    const { id } = params;
    const [imageSession, setImageSession] = useState({
        id: "",
        type: "",
        path: "",
        session_id: ""
    })

    useEffect(() => {
        fetchAllSessions().then(setSessions);
        fetchImageSessionById(id).then(setImageSession)
    }, [id]);

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

    const handleUpdateImageSession = async (event) => {
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
            formData.append("path", imageSession.path);
            formData.append("type", imageSession.type);
            formData.append("session_id", imageSession.session_id);

            try {
                const res = await editImageSession(id, formData);

                if (res) {
                    Swal.fire({
                        icon: "success",
                        title: "Image de la session modifiée avec succès !",
                        showConfirmButton: false,
                        timer: 2000,
                    });
                    setImageSession({
                        id: "",
                        type: "",
                        path: "",
                        session_id: ""
                    });
                    navigate("/sessions-images");
                }
            } catch (error) {
                console.log("Error editing image session :", error);
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
        <div className="content-wrapper">
            <div className="row">
                <div className="col-lg-12 grid-margin stretch-card">
                    <div className="card shadow-lg p-3 mb-5 bg-white rounded">
                        <div className="card-body">
                            <h4 className="card-title mb-5 mt-2">
                                Mettre à jour les informations de l'image de la session
                            </h4>
                            <Form
                                ref={formRef}
                                noValidate
                                validated={validated}
                                className="p-4"
                                onSubmit={handleUpdateImageSession}
                            >
                                <Form.Group className="mb-3">
                                    <Form.Label>Type d'image</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="inputGroup-sizing-default">
                                            <div className="input-group-prepend bg-transparent">
                                                <span className="input-group-text bg-transparent border-right-0">
                                                    <i
                                                        className="mdi mdi-home-variant text-primary"
                                                        style={{ fontSize: "1.5em" }}
                                                    />
                                                </span>
                                            </div>
                                        </InputGroup.Text>
                                        <Form.Select
                                            name="type"
                                            value={imageSession.type}
                                            onChange={(e) =>
                                                setImageSession((prev) => ({
                                                    ...prev,
                                                    type: e.target.value,
                                                }))
                                            }
                                            required
                                        >
                                            <option value="">Sélectionner le type de l'image</option>
                                            <option value="Picture">Photo</option>
                                            <option value="ScreenShot">Capture d'écran</option>
                                        </Form.Select>
                                        <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">
                                            Veuillez Sélectionner le type de l'image !
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Session</Form.Label>
                                    <InputGroup className="mb-3">
                                        <InputGroup.Text id="inputGroup-sizing-default">
                                            <div className="input-group-prepend bg-transparent">
                                                <span className="input-group-text bg-transparent border-right-0">
                                                    <i
                                                        className="mdi mdi-shape-plus text-primary"
                                                        style={{ fontSize: "1.5em" }}
                                                    />
                                                </span>
                                            </div>
                                        </InputGroup.Text>
                                        <Form.Select
                                            name="session_id"
                                            value={imageSession.session_id}
                                            onChange={(e) =>
                                                setImageSession((prev) => ({
                                                    ...prev,
                                                    session_id: e.target.value,
                                                }))
                                            }
                                            required
                                        >
                                            <option>Selectionner la session</option>
                                            {sessions.length > 0 &&
                                                sessions.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.title} - {s.reference}
                                                    </option>
                                                ))}
                                        </Form.Select>
                                        <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">
                                            Veuillez sélectionner la session !
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Image</Form.Label>
                                    <InputGroup className="mb-3">
                                        <Form.Control
                                            name="image"
                                            type="file"
                                            accept="image/*"
                                            placeholder="Sélectionner l'image"
                                            onChange={(e) =>
                                                setImageSession((prev) => ({
                                                    ...prev,
                                                    path: e.target.files[0],
                                                }))
                                            }
                                        />
                                        <Form.Control.Feedback>
                                            Cela semble bon !
                                        </Form.Control.Feedback>
                                        <Form.Control.Feedback type="invalid">
                                            Veuillez sélectionner l'image de la session !
                                        </Form.Control.Feedback>
                                    </InputGroup>
                                </Form.Group>
                                <img
                                    src={`http://localhost:8000/SessionImages/${imageSession.path}`}
                                    alt="imageSession"
                                    width="50%"
                                />
                                <div className="mt-5 d-flex justify-content-center">
                                    <Button
                                        type="submit"
                                        className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                                    >
                                        Modifier
                                    </Button>
                                </div>
                            </Form>
                            <ToastContainer />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionImageModal;
