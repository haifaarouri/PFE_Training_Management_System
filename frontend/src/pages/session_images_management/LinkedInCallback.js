import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function LinkedInCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const result = useSelector((state) => state.linkedin);

  const handleSuccess = (msg) =>
    toast.success(msg, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  const handleError = (err) =>
    toast.error(err, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });

  useEffect(
    () => {
      console.log(result.image);
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (!code) {
        navigate("/login");
        return;
      }

      const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        // Accept: "application/json",
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      axios
        .post("/api/linkedin/exchange-code", { code, state }, { headers })
        .then((response) => {
          const { data } = response;
          if (data.error) {
            handleError("Error:", data.error);
            navigate("/login");
          } else {
            sessionStorage.setItem("accessToken", data.accessToken);
            sessionStorage.setItem("personURN", data.personURN);
            setLoading(false);
            shareImageOnLinkedIn(
              data.accessToken,
              data.personURN,
              result.image,
              result.message
            );
          }
        })
        .catch((error) => {
          handleError("Erreur ! ", error);
          navigate("/login");
        });
    },
    [
      // navigate,
      // imageId,
      // messageToShare,
      // result.image,
      // result.message,
    ]
  );

  const shareImageOnLinkedIn = (accessToken, personURN, imageId, message) => {
    if (!localStorage.getItem("token")) {
      axios
        .post(
          "/api/share-image",
          {
            accessToken,
            personURN,
            imageId,
            message,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log(response);
          handleSuccess("Partagé avec succès ! ", response);
          navigate("/sessions-images");
        })
        .catch((error) => {
          handleError("Erreur de partage sur LinkedIn ! ", error);
          navigate("/error");
        });
    } else {
      const headers = {
        "Content-Type": "application/json",
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      axios
        .post(
          "/api/share-image",
          {
            accessToken,
            personURN,
            imageId,
            message,
          },
          {
            headers: headers,
          }
        )
        .then((response) => {
          console.log(response);
          handleSuccess("Partagé avec succès ! ", response);
          navigate("/sessions-images");
        })
        .catch((error) => {
          handleError("Erreur de partage sur LinkedIn ! ", error);
          navigate("/error");
        });
    }
  };

  if (loading) {
    return <DisplayLoading />;
  }

  return null;
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
