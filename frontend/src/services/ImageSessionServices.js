import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllImageSessions = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/images-sessions");
      return response.data;
    } else {
      const response = await apiFetch("images-sessions");
      return response;
    }
  } catch (error) {
    console.log("Error fetching ImageSessions :", error);
  }
};

export const fetchImageSessionById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/image-sessions-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`image-sessions-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching ImageSession with this id :", error);
  }
};

export const editImageSession = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-image-sessions/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } else {
      const headers = {
        "Content-Type": "multipart/form-data",
        Accept: "application/json",
        withCredentials: true,
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.post(
        `/api/update-image-sessions/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing ImageSession with this id :", error);
  }
};

export const deleteImageSession = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-image-sessions/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-image-sessions/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting ImageSession with this id :", error);
  }
};

const API_URL = "http://localhost:8000/api/linkedin/";

export const registerMedia = async (accessToken, personURN) => {
  if (!accessToken || !personURN) {
    console.error("Missing accessToken or personURN");
    return;
  }
  return axios.post(`${API_URL}register-media`, { accessToken, personURN });
};

export const uploadMedia = async (uploadUrl, imageFile, accessToken) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return axios.post(`${API_URL}upload-media`, formData, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

export const createShare = async (
  accessToken,
  personURN,
  assetURN,
  message
) => {
  return axios.post(`${API_URL}create-share`, {
    accessToken,
    personURN,
    assetURN,
    message,
  });
};
