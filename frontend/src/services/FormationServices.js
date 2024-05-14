import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllFormations = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/formations");
      return response.data;
    } else {
      const response = await apiFetch("formations");
      return response;
    }
  } catch (error) {
    console.log("Error fetching formations :", error);
  }
};

export const fetchFormationById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/formation-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`formation-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching formation with this id :", error);
  }
};

export const fetchFormationByRef = async (ref) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/formation-ref/${ref}`);
      return response.data;
    } else {
      const response = await apiFetch(`formation-ref/${ref}`);
      return response;
    }
  } catch (error) {
    console.log(error);
  }
};

export const fetchAllCategories = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/categories");
      return response.data;
    } else {
      const response = await apiFetch("categories");
      return response;
    }
  } catch (error) {
    console.log("Error fetching categories :", error);
  }
};

export const editFormation = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-formation/${id}`,
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
        `/api/update-formation/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing formation with this id :", error);
  }
};

export const deleteFormation = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-formation/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-formation/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting formation with this id :", error);
  }
};
