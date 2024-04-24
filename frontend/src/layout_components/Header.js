import moment from "moment";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import axios from "../services/axios";
import { setUser } from "../store/slices/authenticatedUserSlice";
import { Button } from "react-bootstrap";
import { apiFetch } from "../services/api";
import { IoIosNotifications } from "react-icons/io";
import { toast } from "sonner";
import {
  fetchAllUnreadNotifs,
  fetchCommandeById,
} from "../services/CommandeServices";

function Header() {
  const [today, setToday] = useState(null);
  const [userAuth, setUserAuth] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [listNotif, setListNotif] = useState([]);
  const [listCmd, setListCmd] = useState([]);

  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux
  const notifsRedux = useSelector((state) => state.notifications); //pour récuperer la liste des notifications inside redux

  useEffect(() => {
    let d = moment()
      .format("dddd, MMMM Do YYYY, h:mm:ss a")
      .replace(/am/g, "matin")
      .replace(/pm/g, "après-midi");
    setToday(d);

    setUserAuth(result);
  }, [result]);

  const handleSuccess = (msg) => toast.success(msg);

  const handleError = (err) => toast.error(err);

  const logout = async () => {
    if (localStorage.getItem("token")) {
      await apiFetch("google-logout", {
        method: "POST",
      });
      dispatch(setUser(null));
      localStorage.removeItem("token");
      handleSuccess("Déconnecté avec succès !");
      navigate("/login");
    } else {
      axios
        .post("/logout")
        .then(() => {
          dispatch(setUser(null));
          handleSuccess("Déconnecté avec succès !");
          navigate("/login");
        })
        .catch((e) => {
          if (e && e.response.status === 422) {
            handleError(e.response.data.message);
          }
        });
    }
  };

  useEffect(() => {
    setListNotif(notifsRedux.notifications);

    let cmds = [];
    notifsRedux.notifications.length > 0 &&
      notifsRedux.notifications.map(async (n) => {
        // console.log(n);
        if (!listCmd.some((cmd) => cmd.id === n.content_id)) {
          const c = await fetchCommandeById(n.content_id);
          cmds.push(c);
        }
      });
    setListCmd([...listCmd, ...cmds]);
  }, [notifsRedux.notifications]);

  return (
    <nav className="navbar col-lg-12 col-12 px-0 py-0 py-lg-4 d-flex flex-row">
      <div className="navbar-menu-wrapper d-flex align-items-center justify-content-end">
        <button
          className="navbar-toggler navbar-toggler align-self-center"
          type="button"
          data-toggle="minimize"
        >
          <span className="mdi mdi-menu" />
        </button>
        <div className="navbar-brand-wrapper">
          <Link className="navbar-brand brand-logo" to="/dashboard">
            <img src="../../images/logoHeader.png" alt="logo" width="50%" />
          </Link>
          <Link className="navbar-brand brand-logo-mini" to="/dashboard">
            <img src="../../images/logoHeader.png" alt="logo" />
          </Link>
        </div>
        <h4 className="font-weight-bold mb-0 d-none d-md-block mt-1">
          Bienvenue de nouveau, {userAuth && userAuth.firstName}{" "}
          {userAuth && userAuth.lastName}
        </h4>
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item">
            <h4 className="mb-0 font-weight-bold d-none d-xl-block">{today}</h4>
          </li>
          <li className="nav-item dropdown me-1">
            <Link
              className="nav-link count-indicator dropdown-toggle d-flex justify-content-center align-items-center"
              id="messageDropdown"
              to="#"
              data-bs-toggle="dropdown"
            >
              <i className="mdi mdi-calendar mx-0" />
              <span className="count bg-info">2</span>
            </Link>
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
              aria-labelledby="messageDropdown"
            >
              <p className="mb-0 font-weight-normal float-left dropdown-header">
                Messages
              </p>
              <Link className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <img
                    src="images/faces/face4.jpg"
                    alt="ProfileImage"
                    className="profile-pic"
                  />
                </div>
                <div className="preview-item-content flex-grow">
                  <h6 className="preview-subject ellipsis font-weight-normal">
                    David Grey
                  </h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    The meeting is cancelled
                  </p>
                </div>
              </Link>
              <Link className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <img
                    src="images/faces/face2.jpg"
                    alt="userImage"
                    className="profile-pic"
                  />
                </div>
                <div className="preview-item-content flex-grow">
                  <h6 className="preview-subject ellipsis font-weight-normal">
                    Tim Cook
                  </h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    New product launch
                  </p>
                </div>
              </Link>
              <Link className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <img
                    src="images/faces/face3.jpg"
                    alt="anotherImage"
                    className="profile-pic"
                  />
                </div>
                <div className="preview-item-content flex-grow">
                  <h6 className="preview-subject ellipsis font-weight-normal">
                    {" "}
                    Johnson
                  </h6>
                  <p className="font-weight-light small-text text-muted mb-0">
                    Upcoming board meeting
                  </p>
                </div>
              </Link>
            </div>
          </li>
          <li className="nav-item dropdown me-2">
            <Link
              className="nav-link count-indicator dropdown-toggle d-flex align-items-center justify-content-center"
              id="notificationDropdown"
              to="#"
              data-bs-toggle="dropdown"
            >
              <div className="icon-container">
                <IoIosNotifications
                  size={30}
                  className={listNotif.length > 0 ? "mx-0 moving-icon" : "mx-0"}
                />
              </div>
              {listNotif.length > 0 && (
                <span className="count bg-danger">{listNotif.length}</span>
              )}
            </Link>
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list"
              aria-labelledby="notificationDropdown"
            >
              <p className="mb-0 font-weight-normal float-left dropdown-header">
                Notifications
              </p>
              {listNotif.length > 0 && listCmd.length > 0 ? (
                listCmd.map((c, i) => (
                  <Link
                    key={i}
                    className="dropdown-item preview-item"
                    to="/commandes"
                  >
                    <div className="preview-thumbnail">
                      <div
                        className="preview-icon bg-info"
                        style={{ color: "white" }}
                      >
                        <i className="mdi mdi-information mx-0" />
                      </div>
                    </div>
                    <div className="preview-item-content">
                      <h6 className="preview-subject font-weight-normal">
                        Nouvelle commande est {c.status} !
                      </h6>
                      <p className="font-weight-light small-text mb-0">
                        Vérifier la liste des commandes.
                      </p>
                      <p className="font-weight-light small-text mb-0 text-muted">
                        {moment(listNotif[i].created_at)
                          .format("dddd, MMMM Do YYYY, h:mm:ss a")
                          .replace(/am/g, "matin")
                          .replace(/pm/g, "après-midi")}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="dropdown-item preview-item preview-item-content">
                  <h6 className="preview-subject font-weight-normal">
                    Pas de notifications pour le moment !
                  </h6>
                </div>
              )}
              {/* <Link className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <div className="preview-icon bg-warning">
                    <i className="mdi mdi-settings mx-0" />
                  </div>
                </div>
                <div className="preview-item-content">
                  <h6 className="preview-subject font-weight-normal">
                    Settings
                  </h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    Private message
                  </p>
                </div>
              </Link>
              <Link className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <div className="preview-icon bg-info">
                    <i className="mdi mdi-account-box mx-0" />
                  </div>
                </div>
                <div className="preview-item-content">
                  <h6 className="preview-subject font-weight-normal">
                    New user registration
                  </h6>
                  <p className="font-weight-light small-text mb-0 text-muted">
                    2 days ago
                  </p>
                </div>
              </Link> */}
            </div>
          </li>
        </ul>
        <button
          className="navbar-toggler navbar-toggler-right d-lg-none align-self-center"
          type="button"
          data-toggle="offcanvas"
        >
          <span className="mdi mdi-menu" />
        </button>
      </div>
      <div className="navbar-menu-wrapper navbar-search-wrapper d-none d-lg-flex align-items-center">
        <ul className="navbar-nav mr-lg-2">
          <li className="nav-item nav-search d-none d-lg-block">
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search Here..."
                aria-label="search"
                aria-describedby="search"
              />
            </div>
          </li>
        </ul>
        <ul className="navbar-nav navbar-nav-right">
          <li className="nav-item nav-profile dropdown">
            {userAuth && (
              <Link
                className="nav-link dropdown-toggle"
                to="#"
                data-bs-toggle="dropdown"
                id="profileDropdown"
              >
                <img
                  src={
                    userAuth.provider === "google"
                      ? `${userAuth.profileImage}`
                      : `http://localhost:8000/profilePictures/${userAuth.profileImage}`
                  }
                  alt={userAuth.profileImage}
                />
                <span className="nav-profile-name">
                  {userAuth.firstName} {userAuth.lastName}
                </span>
              </Link>
            )}
            <div
              className="dropdown-menu dropdown-menu-right navbar-dropdown"
              aria-labelledby="profileDropdown"
            >
              <Link className="dropdown-item" to="/profile">
                <i className="mdi mdi-account-box text-primary" />
                Profil
              </Link>
              <Button className="dropdown-item btn btn-light" onClick={logout}>
                <i className="mdi mdi-logout text-primary" />
                Se déconnecter
              </Button>
            </div>
          </li>
          {/* <li className="nav-item">
            <Link to="#" className="nav-link icon-link">
              <i className="mdi mdi-plus-circle-outline" />
            </Link>
          </li>
          <li className="nav-item">
            <Link to="#" className="nav-link icon-link">
              <i className="mdi mdi-web" />
            </Link>
          </li>
          <li className="nav-item">
            <Link to="#" className="nav-link icon-link">
              <i className="mdi mdi-clock-outline" />
            </Link>
          </li> */}
        </ul>
      </div>
    </nav>
  );
}

export default Header;
