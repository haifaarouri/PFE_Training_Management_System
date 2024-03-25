import { useEffect, useState } from "react";
import { fetchUserById } from "../../services/UserServices";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, Button } from "react-bootstrap";
import moment from "moment";
import EditProfileModal from "../../components/EditProfileModal";
import { ToastContainer, toast } from "react-toastify";

function ProfileUser() {
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
  const location = useLocation();
  const [userAuth, setUserAuth] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await fetchUserById(id);
      setUser(userData);
    };

    if (id) {
      fetchUser();
    }

    setUserAuth(result.user);
  }, [id, result.user]);

  const handleShowEditProfileModal = () => setShowModal(true);
  const handleCloseEditProfileModal = () => setShowModal(false);

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

  const handleDataRecivedfromChild = (childData) => {
    handleSuccess(childData);
  };

  return (
    <div className="content-wrapper">
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-lg p-3 mb-5 bg-white rounded">
            <div className="card-body">
              {location.pathname === "/profile" && userAuth ? (
                <>
                  <div className="d-flex justify-content-end mb-4">
                    <Button
                      className="btn btn-primary-outline btn-rounded btn-inverse-primary"
                      style={{ fontSize: "1em" }}
                      onClick={handleShowEditProfileModal}
                    >
                      Modifier mon profil <i className="mdi mdi-auto-fix" />
                    </Button>
                    <ToastContainer />
                    <EditProfileModal
                      show={showModal}
                      handleClose={handleCloseEditProfileModal}
                      handleMsg={handleDataRecivedfromChild}
                    />
                  </div>
                  <section className="h-100 gradient-custom-2">
                    <div
                      className="rounded-top text-white d-flex flex-row"
                      style={{ backgroundColor: "#E8DAEF", height: 200 }}
                    >
                      <div
                        className="ms-4 mt-5 d-flex flex-column"
                        style={{ width: 150 }}
                      >
                        <img
                          src={
                            userAuth.provider === "google"
                              ? `${userAuth.profileImage}`
                              : `http://localhost:8000/profilePictures/${userAuth.profileImage}`
                          }
                          alt={userAuth.profileImage}
                          className="img-fluid img-thumbnail mt-4 mb-2"
                          style={{ width: 150, zIndex: 1 }}
                        />
                      </div>
                      <div
                        className="ms-3 text-black"
                        style={{ marginTop: 130 }}
                      >
                        <h5>
                          {userAuth.firstName} {userAuth.lastName}
                        </h5>
                      </div>
                    </div>
                    <div
                      className="card-body p-4 text-black"
                      style={{ fontSize: "1em" }}
                    >
                      <div className="mb-5 mt-5">
                        <p className="lead fw-normal mb-3">Mon Profil</p>
                        <div
                          className="p-4 d-flex justify-content-around"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <div>
                            <p className="font-italic mb-3 text-primary">
                              <i
                                className="mdi mdi-email-outline px-3 py-3"
                                style={{ fontSize: "1.5em" }}
                              />
                              E-mail : {userAuth.email}
                            </p>
                            <p className="font-italic mb-3 text-primary">
                              <i
                                className="mdi mdi-phone px-3 py-3"
                                style={{ fontSize: "1.5em" }}
                              />
                              Numéro de téléphone : {userAuth.phoneNumber}
                            </p>
                            <p className="font-italic mb-3 text-primary">
                              <i
                                className="mdi mdi-account-key px-3 py-3"
                                style={{ fontSize: "1.5em" }}
                              />
                              Mot de passe : {userAuth.password}
                            </p>
                            <p className="font-italic mb-0 text-primary">
                              <i
                                className="mdi mdi-account-outline px-3 py-3"
                                style={{ fontSize: "1.5em" }}
                              />
                              Role : {userAuth.role}
                            </p>
                          </div>
                          <div>
                            <p className="font-italic mb-3 text-primary">
                              <i
                                className="mdi mdi-email-lock px-3 py-3"
                                style={{ fontSize: "1.5em" }}
                              />
                              Email verifié (date) :{" "}
                              {userAuth.email_verified_at ? (
                                moment(userAuth.updated_at)
                                  .locale("fr")
                                  .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                  .replace(/am/g, "matin")
                                  .replace(/pm/g, "après-midi")
                              ) : (
                                <Badge pill bg="danger">
                                  Email non vérifié
                                </Badge>
                              )}
                            </p>
                            <p className="font-italic mb-3 text-primary">
                              <i
                                className="mdi mdi-account-plus px-3 py-3"
                                style={{ fontSize: "1.5em" }}
                              />
                              Date de création du compte :{" "}
                              {moment(userAuth.created_at)
                                .locale("fr")
                                .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                .replace(/am/g, "matin")
                                .replace(/pm/g, "après-midi")}
                            </p>
                            <p className="font-italic mb-3 text-primary">
                              <i
                                className="mdi mdi-tooltip-edit px-3 py-3"
                                style={{ fontSize: "1.5em" }}
                              />
                              Date de modification :{" "}
                              {moment(userAuth.updted_at)
                                .locale("fr")
                                .format("dddd, MMMM Do YYYY, h:mm:ss a")
                                .replace(/am/g, "matin")
                                .replace(/pm/g, "après-midi")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              ) : (
                <>
                  <div className="d-flex justify-content-end mb-4">
                    <Link
                      to={`/super-admin/edit-user/${user.id}`}
                      className="btn btn-primary-outline btn-rounded btn-inverse-primary"
                      style={{ fontSize: "1em" }}
                    >
                      Modifier profil <i className="mdi mdi-auto-fix" />
                    </Link>
                  </div>
                  <section className="h-100 gradient-custom-2">
                    <div
                      className="rounded-top text-white d-flex flex-row"
                      style={{ backgroundColor: "#E8DAEF", height: 200 }}
                    >
                      <div
                        className="ms-4 mt-5 d-flex flex-column"
                        style={{ width: 150 }}
                      >
                        <img
                          src={
                            user.provider === "google"
                              ? `${user.profileImage}`
                              : `http://localhost:8000/profilePictures/${user.profileImage}`
                          }
                          alt={user.profileImage}
                          className="img-fluid img-thumbnail mt-4 mb-2"
                          style={{ width: 150, zIndex: 1 }}
                        />
                      </div>
                      <div
                        className="ms-3 text-black"
                        style={{ marginTop: 130 }}
                      >
                        <h5>
                          {user.firstName} {user.lastName}
                        </h5>
                      </div>
                    </div>
                    <div
                      className="card-body p-4 text-black"
                      style={{ fontSize: "1em" }}
                    >
                      <div className="mb-5 mt-5">
                        <p className="lead fw-normal mb-3">
                          À propos cet Administrateur
                        </p>
                        <div
                          className="p-4"
                          style={{ backgroundColor: "#f8f9fa" }}
                        >
                          <p className="font-italic mb-3 text-primary">
                            <i
                              className="mdi mdi-email-outline px-3 py-3"
                              style={{ fontSize: "1.5em" }}
                            />
                            E-mail : {user.email}
                          </p>
                          <p className="font-italic mb-3 text-primary">
                            <i
                              className="mdi mdi-phone px-3 py-3"
                              style={{ fontSize: "1.5em" }}
                            />
                            Numéro de téléphone : {user.phoneNumber}
                          </p>
                          <p className="font-italic mb-3 text-primary">
                            <i
                              className="mdi mdi-account-outline px-3 py-3"
                              style={{ fontSize: "1.5em" }}
                            />
                            Role : {user.role}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileUser;
