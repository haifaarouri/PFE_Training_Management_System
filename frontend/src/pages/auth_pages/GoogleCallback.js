import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { setUser } from "../../store/slices/authenticatedUserSlice";
import Swal from "sweetalert2";
import { fetchUserData } from "../../services/UserServices";
import { setNotifications } from "../../store/slices/notificationsSlice";

function GoogleCallback() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [userAuth, setUserAuth] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  console.log(data);
  console.log(userAuth);
  // On page load, we take "search" parameters
  // and proxy them to /api/auth/callback on Laravel API
  useEffect(() => {
    fetch(`http://localhost:8000/auth/google/callback${location.search}`, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        if (data.error) {
          setLoading(false);
          Swal.fire({
            icon: "error",
            title: data.error,
            text: "Erreur lors de la connexion avec Google !",
            showCancelButton: false,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Retour à la page de connexion",
          }).then(async (result) => {
            if (result.isConfirmed) {
              navigate("/login")
            }
          });
        } else {
          setLoading(false);
          setData(data);
          localStorage.setItem("token", data.access_token); // Store the token

          fetchUserData().then((user) => {
            //stock user in redux
            dispatch(setUser(user));
            setUserAuth(user);
            dispatch(setNotifications(user.notifications));

            if (user) {
              if (user.role === "SuperAdmin") {
                navigate("/super-admin/users");
              } else {
                navigate("/dashboard");
              }
            }
          });
        }
      });
  }, []);

  // Helper method to fetch User data for authenticated user
  // Watch out for "Authorization" header that is added to this call
  // function fetchUserDataa() {
  //   fetch(`http://localhost:8000/api/user`, {
  //     headers: {
  //       "Content-Type": "application/json",
  //       Accept: "application/json",
  //       Authorization: "Bearer " + data.access_token,
  //     },
  //   })
  //     .then((response) => {
  //       return response.json();
  //     })
  //     .then((data) => {
  //       setUserAuth(data);
  //     });
  // }

  if (loading) {
    return <DisplayLoading />;
  }
  // else {
  //   return !userAuth && <Navigate to="/login" replace />;
  // }
  // else {
  //   if (userAuth != null) {
  //     return <DisplayData data={userAuth} />;
  //   } else {
  //     return (
  //       <div>
  //         <DisplayData data={data} />
  //         <div style={{ marginTop: 10 }}>
  //           <button onClick={fetchUserDataa}>Fetch User</button>
  //         </div>
  //       </div>
  //     );
  //   }
  // }
}

function DisplayLoading() {
  return (
    <div className="d-flex justify-content-center">
      <div
        className="spinner-grow text-primary"
        style={{
          width: "3rem",
          height: "3rem",
          position: "absolute",
          margin: "auto",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
        role="status"
      ></div>
    </div>
  );
}

// function DisplayData(data) {
//   return (
//     <div>
//       <samp>{JSON.stringify(data, null, 2)}</samp>
//     </div>
//   );
// }

export default GoogleCallback;
