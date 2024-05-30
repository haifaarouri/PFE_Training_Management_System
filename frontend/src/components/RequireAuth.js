import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

function RequireAuth({ children, allowedRoles }) {
  const result = useSelector((state) => state.user); //pour récuperer la value de user inside redux
  const location = useLocation();
  const [userAuth, setUserAuth] = useState(null);

  useEffect(() => {
    if (result) {
      setUserAuth(result.user);
    }
  }, [result.user, result]);

  if (!result.user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userAuth) {
    if (allowedRoles && !allowedRoles.includes(userAuth?.role)) {
      // If user role is not allowed, redirect to home or a "not authorized" page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}

export default RequireAuth;
