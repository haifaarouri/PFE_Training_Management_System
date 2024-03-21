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

export const fetchUserById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`user-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`user-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching user with this id :", error);
  }
};

export const editUser = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/send-email-edit-user/${id}`,
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
        `/api/send-email-edit-user/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing user with this id :", error);
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
