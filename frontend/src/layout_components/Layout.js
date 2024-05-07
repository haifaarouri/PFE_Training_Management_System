import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import SideBar from "./SideBar";
import { useState } from "react";

function Layout() {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  //   const result = useSelector((state) => state.user);
  //   const [userAuth, setUserAuth] = useState(null);
  // console.log(result);
  //   useEffect(() => {
  //     setUserAuth(result);
  //   }, []);

  return (
    <div
      className={`container-scroller d-flex ${
        isSidebarVisible && "sidebar-icon-only"
      }`}
    >
      <SideBar isSidebarVisible={isSidebarVisible} />
      <div className="container-fluid page-body-wrapper">
        <Header onToggleSidebar={toggleSidebar} />
        <div className="main-panel">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
  // userAuth ? (
  //   <div className="container-scroller d-flex">
  //     <SideBar />
  //     <div className="container-fluid page-body-wrapper">
  //       <Header />
  //       <div className="main-panel">
  //         <Outlet />
  //       </div>
  //       <Footer />
  //     </div>
  //   </div>
  // ) : (
  //   <Navigate to="/login" />
  // );
}

export default Layout;
