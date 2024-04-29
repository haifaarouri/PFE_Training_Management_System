import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllCandidats = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/candidats");
      return response.data;
    } else {
      const response = await apiFetch("candidats");
      return response;
    }
  } catch (error) {
    console.log("Error fetching candidats :", error);
  }
};

export const fetchCandidatById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/candidat-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`candidat-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching candidat with this id :", error);
  }
};

export const editCandidat = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-candidat/${id}`,
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
        `/api/update-candidat/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing candidat with this id :", error);
  }
};

export const deleteCandidat = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-candidat/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-candidat/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting candidat with this id :", error);
  }
};
