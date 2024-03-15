import { useEffect, useRef, useState } from "react";
import { editUser, fetchUserById } from "../../services/UserServices";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../services/axios";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setMsg } from "../../store/slices/successMessageSlice";
import Swal from "sweetalert2";

function EditUser() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [user, setUser] = useState({
    email: "",
    firstName: "",
    id: "",
    lastName: "",
    phoneNumber: "",
    role: "",
    profileImage: "",
  });
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserById(id);
      setUser(userData);
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleEditUser = async (e) => {
    e.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      setValidated(true);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("firstName", user.firstName);
      formData.append("lastName", user.lastName);
      formData.append("email", user.email);
      formData.append("phoneNumber", user.phoneNumber);
      formData.append("role", user.role);
      formData.append("profileImage", user.profileImage);

      const res = await editUser(id, formData);

      if (res.data.message) {
        dispatch(setMsg(res.data.message));

        Swal.fire({
          icon: "success",
          title: res.message,
          showConfirmButton: false,
          timer: 1500,
        });

        setUser({
          email: "",
          firstName: "",
          id: "",
          lastName: "",
          phoneNumber: "",
          role: "",
          profileImage: "",
        });
        navigate("/super-admin/users");
      }
    } catch (error) {
      if (error.response.status === 422) {
        console.log(error.response.data.message);
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
                Mettre à jour les informations de l'administrateur{" "}
                {user.firstName} {user.lastName}
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleEditUser}
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
                      value={user.firstName}
                      onChange={(e) =>
                        setUser((prevUser) => ({
                          ...prevUser,
                          firstName: e.target.value,
                        }))
                      }
                      type="text"
                      placeholder="Saisir le prénom de l'admin"
                      required
                      minLength={3}
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le prénom de l'admin qui doit avoir
                      minimum 3 caractères !
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
                      placeholder="Saisir le nom de famille de l'admin"
                      value={user.lastName}
                      onChange={(e) =>
                        setUser((prevUser) => ({
                          ...prevUser,
                          lastName: e.target.value,
                        }))
                      }
                      required
                      minLength={3}
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le nom de l'admin qui doit avoir minimum 3
                      caractères !
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
                      placeholder="Saisir l'adresse e-mail de l'admin"
                      value={user.email}
                      onChange={(e) =>
                        setUser((prevUser) => ({
                          ...prevUser,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir l'adresse e-mail de l'admin dans un format
                      adéquat !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
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
                      placeholder="Saisir le numéro de téléphone de l'admin"
                      value={user.phoneNumber}
                      onChange={(e) =>
                        setUser((prevUser) => ({
                          ...prevUser,
                          phoneNumber: e.target.value,
                        }))
                      }
                      required
                      minLength={8}
                    />
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez saisir le Numéro de Téléphone de l'admin qui doit
                      comporter au moins 8 caractères !
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Role</Form.Label>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="inputGroup-sizing-default">
                      <div className="input-group-prepend bg-transparent">
                        <span className="input-group-text bg-transparent border-right-0">
                          <i
                            className="mdi mdi-account-key text-primary"
                            style={{ fontSize: "1.5em" }}
                          />
                        </span>
                      </div>
                    </InputGroup.Text>
                    <Form.Select
                      name="role"
                      value={user.role}
                      onChange={(e) =>
                        setUser((prevUser) => ({
                          ...prevUser,
                          role: e.target.value,
                        }))
                      }
                      required
                    >
                      <option disabled>Selectionner le role de l'admin</option>
                      <option value="PiloteDuProcessus">
                        Pilote du Processus
                      </option>
                      <option value="Sales">Sales</option>
                      <option value="ChargéFormation">
                        Chargé de la Formation
                      </option>
                      <option value="AssistanceAcceuil">
                        Assistance d'Acceuil
                      </option>
                      <option value="CommunityManager">
                        Community Manager
                      </option>
                      <option value="ServiceFinancier">
                        Service Financier
                      </option>
                    </Form.Select>
                    <Form.Control.Feedback>
                      Cela semble bon !
                    </Form.Control.Feedback>
                    <Form.Control.Feedback type="invalid">
                      Veuillez selectionner le role de l'admin !
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
                      placeholder="Selectionner l'image de l'admin"
                      onChange={(e) =>
                        setUser((prevUser) => ({
                          ...prevUser,
                          profileImage: e.target.files[0],
                        }))
                      }
                    />
                  </InputGroup>
                </Form.Group>
                {user.profileImage && (
                  <img
                    src={
                      user.provider === "google"
                        ? `${user.profileImage}`
                        : `http://localhost:8000/profilePictures/${user.profileImage}`
                    }
                    alt={user.profileImage}
                    style={{
                      width: "20%",
                      height: "20%",
                      borderRadius: "10%",
                    }}
                  />
                )}
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Metter à jour
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditUser;
