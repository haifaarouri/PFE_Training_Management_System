import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import SideBar from "./SideBar";
// import { useSelector } from "react-redux";
// import { useEffect, useState } from "react";

function Layout() {
  //   const result = useSelector((state) => state.user);
  //   const [userAuth, setUserAuth] = useState(null);
  // console.log(result);
  //   useEffect(() => {
  //     setUserAuth(result);
  //   }, []);
  // console.log(userAuth);
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
