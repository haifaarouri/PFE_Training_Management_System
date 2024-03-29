import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllMateriaux = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/materiaux");
      return response.data;
    } else {
      const response = await apiFetch("materiaux");
      return response;
    }
  } catch (error) {
    console.log("Error fetching materiel data:", error);
  }
};

export const fetchMaterielById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`materiel-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`materiel-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching materiel with this id :", error);
  }
};

export const editMateriel = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-materiel/${id}`,
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
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `/api/update-materiel/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing materiel with this id :", error);
  }
};

export const deleteMateriel = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-materiel/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-materiel/${id}`, {
        method: "DELETE",
      });
      console.log(response);
      return response;
    }
  } catch (error) {
    console.log("Error deleting materiel with this id :", error);
  }
};
