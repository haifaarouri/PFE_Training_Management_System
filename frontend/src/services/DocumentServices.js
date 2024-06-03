import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllDocuments = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/documentTemplates");
      return response.data;
    } else {
      const response = await apiFetch("documentTemplates");
      return response;
    }
  } catch (error) {
    console.log("Error fetching documentTemplates :", error);
  }
};

export const fetchDocumentById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/documentTemplate-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`documentTemplate-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching documentTemplate with this id :", error);
  }
};

export const editDocument = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-documentTemplate/${id}`,
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
        `/api/update-documentTemplate/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing Document with this id :", error);
  }
};

export const deleteDocument = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-documentTemplate/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-documentTemplate/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting Document with this id :", error);
  }
};
