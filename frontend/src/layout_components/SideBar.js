import { useEffect, useState } from "react";
import { GiTeacher } from "react-icons/gi";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FaBookBookmark } from "react-icons/fa6";
import { PiStudent, PiStudentFill } from "react-icons/pi";
import { BsCalendarRange } from "react-icons/bs";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { VscOrganization } from "react-icons/vsc";
import { MdEmail } from "react-icons/md";
import { RiSurveyFill } from "react-icons/ri";

function SideBar({ isSidebarVisible }) {
  const [userAuth, setUserAuth] = useState(null);

  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux

  useEffect(() => {
    setUserAuth(result.user);
  }, [result.user]);

  const [hoveredItem, setHoveredItem] = useState(null);

  const handleMouseEnter = (itemName) => {
    setHoveredItem(itemName);
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
  };

  const menuItems = [
    { path: "/dashboard", icon: "mdi-view-quilt", title: "Dashboard" },
    {
      path: "/salles",
      icon: "mdi-home-variant",
      title: "Gestion des Salles",
    },
    {
      path: "/materiaux",
      icon: "mdi-laptop",
      title: "Gestions des Materiaux",
    },
    {
      path: "/formateurs",
      icon: <GiTeacher />,
      title: "Gestion des Formateurs",
    },
    {
      path: "/formations",
      icon: <FaBookBookmark />,
      title: "Gestion des Formations",
    },
    {
      path: "/candidats",
      icon: <PiStudentFill size={22} />,
      title: "Gestion des Candidats",
    },
    {
      path:
        userAuth && userAuth.role === "ServiceFinancier"
          ? "/confirmed-commandes"
          : "/commandes",
      icon: "mdi-cart",
      title: "Gestion des Commandes",
    },
    {
      path: "/sessions",
      icon: <BsCalendarRange size={20} />,
      title: "Gestion des Sessions",
    },
    {
      path: "/documents",
      icon: <IoDocumentAttachOutline size={22} />,
      title: "Gestion des Documents",
    },
    {
      path: "/partenaires",
      icon: <VscOrganization size={22} />,
      title: "Gestion des Partenaires",
    },
    {
      path: "/participants",
      icon: <PiStudent size={22} />,
      title: "Gestion des Participants",
    },
    {
      path: "/email-templates",
      icon: <MdEmail size={22} />,
      title: "Gestion des Emails",
    },
    {
      path: "/participants-feedbacks",
      icon: <RiSurveyFill size={22} />,
      title: "Gestion des Formulaires",
    },
  ];

  return (
    <nav
      className={`sidebar sidebar-offcanvas ${isSidebarVisible && "active"}`}
      id="sidebar"
    >
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
        <li className="nav-item sidebar-category">
          <p>Pages</p>
          <span />
        </li>
        {userAuth && userAuth.role === "SuperAdmin" && (
          <li
            className={`nav-item ${
              hoveredItem === "superAdmin" ? "hover-open" : ""
            }`}
            onMouseEnter={() => handleMouseEnter("superAdmin")}
            onMouseLeave={handleMouseLeave}
          >
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
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={`nav-item ${
              hoveredItem === item.title ? "hover-open" : ""
            }`}
            onMouseEnter={() => handleMouseEnter(item.title)}
            onMouseLeave={handleMouseLeave}
          >
            <Link className="nav-link" to={item.path}>
              {typeof item.icon === "string" ? (
                <i className={`mdi ${item.icon} menu-icon`} />
              ) : (
                <i className="menu-icon">{item.icon}</i>
              )}
              <span className="menu-title">{item.title}</span>
            </Link>
          </li>
        ))}
        {/* <li
          className={`nav-item ${
            hoveredItem === "Gestions des Commandes" ? "hover-open" : ""
          }`}
          onMouseEnter={() => handleMouseEnter("Gestions des Commandes")}
          onMouseLeave={handleMouseLeave}
        >
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
