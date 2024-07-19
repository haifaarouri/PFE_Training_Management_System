import Swal from "sweetalert2";
import { apiFetch } from "./api";
import axios from "./axios";
import { toast } from "react-toastify";

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

export const fetchAllDocumentLogs = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/documentLogs");
      return response.data;
    } else {
      const response = await apiFetch("documentLogs");
      return response;
    }
  } catch (error) {
    console.log("Error fetching documentLogs :", error);
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
    handleError(Object.values(error.response.data.error)[0][0]);
    Swal.fire({
      title: Object.values(error.response.data.error)[0][0],
      text: "Il doit avoir au moins une inscription confirmée !",
      icon: "error",
    });
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
