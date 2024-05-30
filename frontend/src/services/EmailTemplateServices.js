import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllEmailTemplates = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/emailTemplates");
      return response.data;
    } else {
      const response = await apiFetch("emailTemplates");
      return response;
    }
  } catch (error) {
    console.log("Error fetching emailTemplates :", error);
  }
};

export const fetchEmailTemplateById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/emailTemplate-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`emailTemplate-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching EmailTemplate with this id :", error);
  }
};

export const editEmailTemplate = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-emailTemplate/${id}`,
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
        `/api/update-emailTemplate/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing EmailTemplate with this id :", error);
  }
};

export const deleteEmailTemplate = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-emailTemplate/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-emailTemplate/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting emailTemplate with this id :", error);
  }
};
