import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios";

function LinkedInCallback() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const imageId = urlParams.get("imageId");
    const message = decodeURIComponent(urlParams.get("message") || "");

    if (!code) {
      navigate("/login");
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
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
          console.error("Error:", data.error);
          navigate("/login");
        } else {
          sessionStorage.setItem("accessToken", data.accessToken);
          sessionStorage.setItem("personURN", data.personURN);
          setLoading(false);
          shareImageOnLinkedIn(
            data.accessToken,
            data.personURN,
            imageId,
            message
          );
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        navigate("/login");
      });
  }, [navigate]);

  const shareImageOnLinkedIn = (accessToken, personURN, imageId, message) => {
    axios
      .post("http://localhost:8000/api/share-image", {
        accessToken,
        personURN,
        imageId,
        message,
      })
      .then((response) => {
        console.log("Shared successfully:", response.data);
        navigate("/success");
      })
      .catch((error) => {
        console.error("Error sharing on LinkedIn:", error);
        navigate("/error");
      });
  };

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
