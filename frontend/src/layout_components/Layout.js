import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import SideBar from "./SideBar";

function Layout() {
  return (
    <div className="container-scroller d-flex">
      <SideBar />
      <div className="container-fluid page-body-wrapper">
        <Header />
        <div className="main-panel">
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default Layout;
