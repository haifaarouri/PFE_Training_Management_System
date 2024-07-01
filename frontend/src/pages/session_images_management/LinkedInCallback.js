// LinkedInCallback.js
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "../../store/slices/authenticatedUserSlice";
import Swal from "sweetalert2";
import { fetchUserData } from "../../services/UserServices";
import { setNotifications } from "../../store/slices/notificationsSlice";

function LinkedInCallback() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // window.location.href = "http://localhost:8000/linkedin/share";
    window.location.href =
      "https://www.linkedin.com/sharing/share-offsite/?url=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Flinkedin%2Fcallback";
  }, []);

  // useEffect(() => {
  //   fetch(`http://localhost:8000/auth/linkedin/callback`, {
  //     method: "POST", // Specify the method as POST
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //     },
  //     body: JSON.stringify({
  //       code: new URLSearchParams(location.search).get("code"), // Send code as part of the request body
  //       state: new URLSearchParams(location.search).get("state"), // Send state as part of the request body
  //     }),
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.error) {
  //         Swal.fire({
  //           icon: "error",
  //           title: data.error,
  //           showConfirmButton: false,
  //         });
  //         navigate("/login"); // Redirect to login on error
  //       } else {
  //         setLoading(false);
  //         localStorage.setItem("token", data.access_token); // Store the token
  //         fetchUserData().then((user) => {
  //           dispatch(setUser(user));
  //           dispatch(setNotifications(user.notifications));
  //           navigate("/dashboard"); // Navigate based on user role or preference
  //         });
  //       }
  //     });
  // }, [dispatch, location.search, navigate]);

  if (loading) {
    return <DisplayLoading />;
  }

  return null; // Or any other component you wish to render
}

function DisplayLoading() {
  return (
    <div className="d-flex justify-content-center">
      <div
        className="spinner-grow text-primary"
        style={{ width: "3rem", height: "3rem" }}
        role="status"
      ></div>
    </div>
  );
}

export default LinkedInCallback;
