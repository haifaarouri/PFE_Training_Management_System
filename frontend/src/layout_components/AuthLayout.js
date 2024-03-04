import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="container-scroller d-flex">
      <div className="container-fluid page-body-wrapper full-page-wrapper d-flex">
        <div className="content-wrapper d-flex align-items-stretch auth auth-img-bg">
          <div className="row flex-grow">
            <div className="col-sm-12 col-xl-6 col-lg-6 col-md-12 d-flex align-items-center justify-content-center">
              <div className="auth-form-transparent text-left p-3">
                <div className="brand-logo">
                  Gestion des Formations
                  {/* <img src="../../images/logo-dark.svg" alt="logo" /> */}
                </div>
                <Outlet />
              </div>
            </div>
            <div className="col-lg-6 register-half-bg d-none d-lg-flex flex-row">
              <p className="text-white font-weight-medium text-center flex-grow align-self-end">
                Copyright © 2024 All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
