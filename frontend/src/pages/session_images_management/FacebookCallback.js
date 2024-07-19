import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

function FacebookCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (!code) {
      navigate("/login");
      return;
    }

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    axios
      .post("/facebook/callback", { code })
      .then((response) => {
        sessionStorage.setItem("accessToken", response.data.accessToken);
        handleSuccess("Successfully logged in with Facebook.");
        navigate("/dashboard");
      })
      .catch((error) => {
        handleError("Failed to login with Facebook ! ", error);
        navigate("/login");
      });
  }, []);

  const handleShareOnFacebook = () => {
    const accessToken = sessionStorage.getItem("accessToken");
    if (!accessToken) {
      alert("No access token found. Please login again.");
      return;
    }

    axios
      .post("http://localhost:8000/share/facebook", {
        accessToken: accessToken,
        // message: messageToSend,
        // imagePath: imageToShare.path, // Ensure you have the correct path
      })
      .then((response) => {
        console.log("Shared successfully:", response.data);
      })
      .catch((error) => {
        console.error("Error sharing on Facebook:", error);
      });
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

export default FacebookCallback;
