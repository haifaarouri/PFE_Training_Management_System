import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllFormateurs = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/formateurs");
      return response.data;
    } else {
      const response = await apiFetch("formateurs");
      return response;
    }
  } catch (error) {
    console.log("Error fetching formateurs :", error);
  }
};

export const fetchFormateurById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/formateur-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`formateur-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching formateur with this id :", error);
  }
};

export const editFormateur = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-formateur/${id}`,
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
        `/api/update-formateur/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing formateur with this id :", error);
  }
};

export const deleteFormateur = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-formateur/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-formateur/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting formateur with this id :", error);
  }
};

export const fetchFormateursBySpeciality = async (speciality) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/formateurs-speciality/${speciality}`
      );
      return response.data;
    } else {
      const response = await apiFetch(`formateurs-speciality/${speciality}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching formateurs with this speciality :", error);
  }
};
