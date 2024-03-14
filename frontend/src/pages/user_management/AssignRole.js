import { useEffect, useRef, useState } from "react";
import { assignRole, fetchAllUsers } from "../../services/UserServices";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../services/axios";
import { Button, Form, InputGroup } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { setMsg } from "../../store/slices/successMessageSlice";
import Swal from "sweetalert2";

function AssignRole() {
  const navigate = useNavigate();
  const params = useParams();
  const { id } = params;
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [validated, setValidated] = useState(false);
  const formRef = useRef();
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetchAllUsers();
      return response;
    } catch (error) {
      console.log("Error fetching users :", error);
    }
  };

  useEffect(() => {
    const u = async () => {
      const d = await fetchData();
      setUsers(d);
    };

    u();
  }, [id]);

  const csrf = () => axios.get("/sanctum/csrf-cookie");

  const handleAssignRole = async (e) => {
    e.preventDefault();
    await csrf();

    try {
      const form = formRef.current;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }

      setValidated(true);

      // const formData = new FormData();
      // formData.append("_method", "PATCH");
      // formData.append("email", email);
      // formData.append("role", role);

      const res = await assignRole({email, role});
      console.log(res);
      if (res.message) {
        dispatch(setMsg(res.message));

        Swal.fire({
          icon: "success",
          title: res.message,
          showConfirmButton: false,
          timer: 1500,
        });

        setEmail("");
        setRole("");

        navigate("/super-admin/users");
      }
    } catch (error) {
      console.log(error);
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
                Assigner un role pour chaque administrateur
              </h4>
              <Form
                ref={formRef}
                noValidate
                validated={validated}
                className="p-4"
                onSubmit={handleAssignRole}
              >
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
                    <Form.Select
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    >
                      <option disabled>Selectionner l'e-mail de l'admin</option>
                      {users.length > 0 &&
                        users.map((user) => (
                          <option key={user.id} value={user.email}>
                            {user.email}
                          </option>
                        ))}
                    </Form.Select>
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
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
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
                <div className="mt-5 d-flex justify-content-center">
                  <Button
                    type="submit"
                    className="btn btn-block btn-primary btn-lg font-weight-medium auth-form-btn"
                  >
                    Assigner le role
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

export default AssignRole;
