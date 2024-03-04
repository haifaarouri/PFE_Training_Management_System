import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import Button from "react-bootstrap/Button";
import moment from "moment";
import { Badge } from "react-bootstrap";
require("moment/locale/fr");

function AllUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const handleButtonEdit = (id) => {
    navigate(`/super-admin/edit-user/${id}`);
  };

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/users");
      return response.data;
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
  }, []);

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title mb-5 mt-2">
                Liste de tous les administareurs
              </h4>
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Numéro de Téléphone</th>
                      <th>Role</th>
                      <th>Date de Création</th>
                      <th>Date de Modification</th>
                      <th>Date de Vérification de l'E-mail</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* <tr>
                      <td className="py-1">
                        <img src="../../images/faces/face1.jpg" alt="image" />
                      </td>
                      <td>Herman Beck</td>
                      <td>
                        <div className="progress">
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: "25%" }}
                            aria-valuenow={25}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </td>
                      <td>$ 77.99</td>
                      <td>May 15, 2015</td>
                    </tr> */}
                    {users.length > 0 &&
                      users.map((u, index) => {
                        const dateCreated = moment(u.created_at);
                        dateCreated.locale("fr");

                        const dateModified = moment(u.updated_at);
                        dateModified.locale("fr");

                        const dateVerified = moment(u.email_verified_at);
                        dateCreated.locale("fr");
                        return (
                          <tr key={index}>
                            <td>
                              <img
                                src={`http://localhost:8000/profilePictures/${u.profileImage}`}
                                alt="image"
                              />
                              <h6>{u.firstName}</h6>
                            </td>
                            <td>{u.lastName}</td>
                            <td>{u.email}</td>
                            <td>{u.phoneNumber}</td>
                            <td>{u.role}</td>
                            <td>
                              {dateCreated
                                .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                .replace(/am/g, "matin")
                                .replace(/pm/g, "après-midi")}
                            </td>
                            <td>
                              {dateModified
                                .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                .replace(/am/g, "matin")
                                .replace(/pm/g, "après-midi")}
                            </td>
                            <td>
                              {u.email_verified_at ? (
                                dateVerified
                                  .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                  .replace(/am/g, "matin")
                                  .replace(/pm/g, "après-midi")
                              ) : (
                                  <Badge pill bg="danger" style={{width:"100%", height: "30px", paddingTop:"5%"}}>
                                    Email non vérifié
                                  </Badge>
                              )}
                            </td>
                            <td className="d-flex flex-column justify-content-center">
                              <Button variant="outline-info" className="mb-2">
                                Détails
                              </Button>
                              <Button
                                variant="outline-primary"
                                onClick={() => handleButtonEdit(u.id)}
                                className="mb-2"
                              >
                                Modifier
                              </Button>
                              <Button variant="outline-danger">
                                Supprimer
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AllUsers;
