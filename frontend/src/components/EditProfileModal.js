import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import axios from "../services/axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/slices/authenticatedUserSlice";
import Swal from "sweetalert2";

const EditProfileModal = ({ show, handleClose }) => {
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const [userToEdit, setUserToEdit] = useState({
    email: "",
    firstName: "",
    id: "",
    lastName: "",
    phoneNumber: "",
    profileImage: "",
    password: "",
  });
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password_confirmation, setPasswordConfirm] = useState("");

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux

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

  useEffect(() => {
    setUserToEdit(result.user);
  }, [result.user]);

  useEffect(() => {
    setPasswordConfirm(userToEdit.password);
  }, [userToEdit.password]);

  const isWhitespace = (str) => {
    return str.trim() === "";
  };

  const passwordMatchValidator = () => {
    return userToEdit.password === password_confirmation;
  };

  const handleEditProfil = async (event) => {
    event.preventDefault();
    await csrf();

    const form = formRef.current;
    if (
      form.checkValidity() === false ||
      isWhitespace(userToEdit.firstName) ||
      isWhitespace(userToEdit.lastName) ||
      !passwordMatchValidator() ||
      isWhitespace(userToEdit.phoneNumber)
    ) {
      event.preventDefault();
      event.stopPropagation();
    }

    setValidated(true);

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("firstName", userToEdit.firstName);
    formData.append("lastName", userToEdit.lastName);
    formData.append("email", userToEdit.email);
    formData.append("password", userToEdit.password);
    formData.append("password_confirmation", password_confirmation);
    formData.append("phoneNumber", userToEdit.phoneNumber);
    formData.append("profileImage", userToEdit.profileImage);

    try {
      if (!localStorage.getItem("token")) {
        const res = await axios.post(
          `/api/edit-profile/${userToEdit.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (res.data.message) {
          //stock user in redux
          console.log(res.data.user);
          dispatch(setUser(res.data.user));

          Swal.fire({
            icon: "success",
            title: res.data.message,
            showConfirmButton: false,
            timer: 2000,
          });

          setUserToEdit({
            email: "",
            firstName: "",
            id: "",
            lastName: "",
            phoneNumber: "",
            profileImage: "",
            password: "",
          });
          setPasswordConfirm("");
          handleClose();
        }
      } else {
        const headers = {
          "Content-Type": "multipart/form-data",
        };

        const token = localStorage.getItem("token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await axios.post(
          `/api/edit-profile/${userToEdit.id}`,
          formData,
          {
            headers: headers,
          }
        );

        if (response.data.message) {
          //stock user in redux
          dispatch(setUser(userToEdit));

          Swal.fire({
            icon: "success",
            title: response.data.message,
            showConfirmButton: false,
            timer: 1500,
          });

          setUserToEdit({
            email: "",
            firstName: "",
            id: "",
            lastName: "",
            phoneNumber: "",
            profileImage: "",
            password: "",
          });
          setPasswordConfirm("");
          handleClose();
        }
      }
    } catch (error) {
      console.log("Error adding a new user :", error);
      if (error && error.response.status === 422) {
        handleError(error.response.data.message);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <h5 className="modal-title">Modifier mon profil</h5>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="row">
        <Form
          ref={formRef}
          noValidate
          validated={validated}
          className="p-4"
          onSubmit={handleEditProfil}
        >
          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-account-outline text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                value={userToEdit.firstName}
                onChange={(e) =>
                  setUserToEdit((prevUser) => ({
                    ...prevUser,
                    firstName: e.target.value,
                  }))
                }
                type="text"
                placeholder="Saisir votre prénom "
                required
                minLength={3}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir votre prénom qui doit avoir minimum 3 caractères
                !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-account-outline text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Saisir votre nom de famille "
                value={userToEdit.lastName}
                onChange={(e) =>
                  setUserToEdit((prevUser) => ({
                    ...prevUser,
                    lastName: e.target.value,
                  }))
                }
                required
                minLength={3}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir votre nom qui doit avoir minimum 3 caractères !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-email-outline text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Saisir votre adresse e-mail "
                value={userToEdit.email}
                onChange={(e) =>
                  setUserToEdit((prevUser) => ({
                    ...prevUser,
                    email: e.target.value,
                  }))
                }
                required
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir votre adresse e-mail dans un format adéquat !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          {userToEdit.provider !== "google" && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Mot de passe</Form.Label>
                <InputGroup className="mb-3">
                  <InputGroup.Text
                    id="inputGroup-sizing-default"
                    style={{ width: "100%" }}
                  >
                    <div className="input-group-prepend bg-transparent">
                      <span className="input-group-text bg-transparent border-right-0">
                        <i
                          className="mdi mdi-lock-outline text-primary"
                          style={{ fontSize: "1.5em" }}
                        />
                      </span>
                    </div>
                    <div style={{ position: "relative", width: "100%" }}>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Saisir votre mot de passe"
                        value={userToEdit.password}
                        onChange={(e) =>
                          setUserToEdit((prevUser) => ({
                            ...prevUser,
                            password: e.target.value,
                          }))
                        }
                        required
                        minLength={8}
                      />
                      <button
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "5px",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                        }}
                        type="button"
                        onClick={handleTogglePassword}
                        className="text-primary"
                      >
                        {showPassword ? (
                          <i className="mdi mdi-eye-off" />
                        ) : (
                          <i className="mdi mdi-eye" />
                        )}
                      </button>
                    </div>
                  </InputGroup.Text>
                  <Form.Control.Feedback>
                    Cela semble bon !
                  </Form.Control.Feedback>
                  <Form.Control.Feedback type="invalid">
                    Veuillez saisir votre mot de passe qui doit comporter
                    minimum 8 caractères !
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirmation de mot de passe</Form.Label>
                <InputGroup className="mb-3">
                  <InputGroup.Text
                    id="inputGroup-sizing-default"
                    style={{ width: "100%" }}
                  >
                    <div className="input-group-prepend bg-transparent">
                      <span className="input-group-text bg-transparent border-right-0">
                        <i
                          className="mdi mdi-lock-outline text-primary"
                          style={{ fontSize: "1.5em" }}
                        />
                      </span>
                    </div>
                    <div style={{ position: "relative", width: "100%" }}>
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirmez votre mot de passe"
                        value={password_confirmation}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        required
                        minLength={8}
                      />
                      <button
                        style={{
                          position: "absolute",
                          top: "50%",
                          right: "5px",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                        }}
                        type="button"
                        onClick={handleToggleConfirmPassword}
                        className="text-primary"
                      >
                        {showConfirmPassword ? (
                          <i className="mdi mdi-eye-off" />
                        ) : (
                          <i className="mdi mdi-eye" />
                        )}
                      </button>
                    </div>
                  </InputGroup.Text>
                  <Form.Control.Feedback>
                    Cela semble bon !
                  </Form.Control.Feedback>
                  <Form.Control.Feedback type="invalid">
                    Veuillez saisir votre mot de passe qui doit comporter
                    minimum 8 caractères ! <br />
                    {!passwordMatchValidator() &&
                      "Les deux mots de passe que vous avez saisis ne correspondent pas !"}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </>
          )}
          <Form.Group className="mb-3">
            <Form.Label>Numéro de Téléphone</Form.Label>
            <InputGroup className="mb-3">
              <InputGroup.Text id="inputGroup-sizing-default">
                <div className="input-group-prepend bg-transparent">
                  <span className="input-group-text bg-transparent border-right-0">
                    <i
                      className="mdi mdi-phone text-primary"
                      style={{ fontSize: "1.5em" }}
                    />
                  </span>
                </div>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Saisir votre numéro de téléphone "
                value={userToEdit.phoneNumber}
                onChange={(e) =>
                  setUserToEdit((prevUser) => ({
                    ...prevUser,
                    phoneNumber: e.target.value,
                  }))
                }
                required
                minLength={8}
              />
              <Form.Control.Feedback>Cela semble bon !</Form.Control.Feedback>
              <Form.Control.Feedback type="invalid">
                Veuillez saisir votre Numéro de Téléphone qui doit comporter au
                moins 8 caractères !
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                name="profileImage"
                style={{ height: "150%" }}
                type="file"
                accept="image/*"
                placeholder="Selectionner votre image "
                onChange={(e) =>
                  setUserToEdit((prevUser) => ({
                    ...prevUser,
                    profileImage: e.target.files[0],
                  }))
                }
              />
            </InputGroup>
          </Form.Group>
          <img
            src={
              userToEdit.provider === "google"
                ? `${userToEdit.profileImage}`
                : `http://localhost:8000/profilePictures/${userToEdit.profileImage}`
            }
            alt={userToEdit.profileImage}
            style={{
              width: "30%",
              height: "22%",
              borderRadius: "10%",
            }}
          />
          <div className="mt-5 d-flex justify-content-center">
            <Button
              type="submit"
              className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
            >
              Metter à jour
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

export default EditProfileModal;
