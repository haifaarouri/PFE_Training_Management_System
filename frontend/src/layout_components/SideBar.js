import { useEffect, useState } from "react";
import { GiTeacher } from "react-icons/gi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaBookBookmark } from "react-icons/fa6";
import { PiStudentFill } from "react-icons/pi";

function SideBar() {
  const [userAuth, setUserAuth] = useState(null);

  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux

  useEffect(() => {
    setUserAuth(result.user);
  }, [result.user]);

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item sidebar-category">
          <div className="d-flex justify-content-center">
            <img
              src="../../images/TrainSchedulerLogo.png"
              alt="logo"
              width="100%"
            />
            {/* <p
              className="text-center align-self-center"
              style={{ color: "white" }}
            >
              Gestion des Formations
            </p> */}
          </div>
          <span />
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/dashboard">
            <i className="mdi mdi-view-quilt menu-icon" />
            <span className="menu-title">Dashboard</span>
            {/* <div className="badge badge-info badge-pill">2</div> */}
          </Link>
        </li>
        <li className="nav-item sidebar-category">
          <p>Pages</p>
          <span />
        </li>
        {userAuth && userAuth.role === "SuperAdmin" && (
          <li className="nav-item">
            <Link
              className="nav-link"
              data-bs-toggle="collapse"
              to="#ui-basic"
              aria-expanded="false"
              aria-controls="ui-basic"
            >
              <i className="mdi mdi-settings menu-icon" />
              <span className="menu-title">Gestions</span>
              <i className="menu-arrow" />
            </Link>
            <div className="collapse" id="ui-basic">
              <ul className="nav flex-column sub-menu">
                <li className="nav-item">
                  <Link className="nav-link" to="/super-admin/users">
                    <i
                      className="mdi mdi-account-multiple"
                      style={{ marginRight: "10%" }}
                    />
                    Administareurs
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/super-admin/manage-roles">
                    <i
                      className="mdi mdi-account-multiple-outline"
                      style={{ marginRight: "10%" }}
                    />
                    Roles
                  </Link>
                </li>
              </ul>
            </div>
          </li>
        )}
        <li className="nav-item">
          <Link className="nav-link" to="/salles">
            <i className="mdi mdi-home-variant menu-icon" />
            <span className="menu-title">Gestion des Salles</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/materiaux">
            <i className="mdi mdi-laptop menu-icon" />
            <span className="menu-title">Gestions des Materiaux</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/formateurs">
            <i className="mdi menu-icon">
              {" "}
              <GiTeacher />
            </i>
            <span className="menu-title">Gestion des Formateurs</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link"
            to={
              userAuth && userAuth.role === "ServiceFinancier"
                ? "/confirmed-commandes"
                : "/commandes"
            }
          >
            <i className="mdi mdi-cart menu-icon" />
            <span className="menu-title">Gestions des Commandes</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/formations">
            <i className="menu-icon">
              <FaBookBookmark />
            </i>
            <span className="menu-title">Gestions des Formations</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/candidats">
            <i className="menu-icon">
              <PiStudentFill size={22} />
            </i>
            <span className="menu-title">Gestions des Candidats</span>
          </Link>
        </li>
        {/* <li className="nav-item sidebar-category">
          <p>Pages</p>
          <span />
        </li> */}
        {/* <li className="nav-item">
          <Link
            className="nav-link"
            data-bs-toggle="collapse"
            to="#auth"
            aria-expanded="false"
            aria-controls="auth"
          >
            <i className="mdi mdi-account menu-icon" />
            <span className="menu-title">User Pages</span>
            <i className="menu-arrow" />
          </Link>
          <div className="collapse" id="auth">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                {" "}
                <Link className="nav-link" to="pages/samples/login.html">
                  {" "}
                  Login{" "}
                </Link>
              </li>
              <li className="nav-item">
                {" "}
                <Link className="nav-link" to="pages/samples/login-2.html">
                  {" "}
                  Login 2{" "}
                </Link>
              </li>
              <li className="nav-item">
                {" "}
                <Link className="nav-link" to="pages/samples/register.html">
                  {" "}
                  Register{" "}
                </Link>
              </li>
              <li className="nav-item">
                {" "}
                <Link className="nav-link" to="pages/samples/register-2.html">
                  {" "}
                  Register 2{" "}
                </Link>
              </li>
              <li className="nav-item">
                {" "}
                <Link className="nav-link" to="pages/samples/lock-screen.html">
                  {" "}
                  Lockscreen{" "}
                </Link>
              </li>
            </ul>
          </div>
        </li> */}
        {/* <li className="nav-item sidebar-category">
          <p>Apps</p>
          <span />
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="docs/documentation.html">
            <i className="mdi mdi-file-document-box-outline menu-icon" />
            <span className="menu-title">Documentation</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link
            className="nav-link"
            to="https://www.bootstrapdash.com/product/spica-admin/"
          >
            <button className="btn bg-danger btn-sm menu-title">
              Upgrade to pro
            </button>
          </Link>
        </li> */}
      </ul>
    </nav>
  );
}

export default SideBar;
