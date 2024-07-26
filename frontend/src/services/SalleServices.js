import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllSalles = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/salles");
      return response.data;
    } else {
      const response = await apiFetch("salles");
      return response;
    }
  } catch (error) {
    console.log("Error fetching salle data:", error);
  }
};

export const fetchSalleById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/salle-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`salle-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching salle with this id :", error);
  }
};

export const editSalle = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(`/api/update-salle/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } else {
      const headers = {
        "Content-Type": "multipart/form-data",
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(`/api/update-salle/${id}`, formData, {
        headers: headers,
      });
      return response;
    }
  } catch (error) {
    console.log("Error editing salle with this id :", error);
  }
};

export const deleteSalle = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-salle/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-salle/${id}`, {
        method: "DELETE",
      });
      console.log(response);
      return response;
    }
  } catch (error) {
    console.log("Error deleting salle with this id :", error);
  }
};

export const getDaysSessionBySalleId = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/jours-session-salle/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`jours-session-salle/${id}`);
      return response;
    }
  } catch (error) {
    console.log(
      "Error fetching jours sessions for salle with this id :",
      error
    );
  }
};
