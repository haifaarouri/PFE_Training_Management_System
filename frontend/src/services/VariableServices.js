import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllVariables = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/variables-template");
      return response.data;
    } else {
      const response = await apiFetch("variables-template");
      return response;
    }
  } catch (error) {
    console.log("Error fetching Variables :", error);
  }
};

export const fetchTablesSource = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/source-tables");
      return response.data;
    } else {
      const response = await apiFetch("source-tables");
      return response;
    }
  } catch (error) {
    console.log("Error fetching Variables :", error);
  }
};

export const fetchColonnesSource = async (tableName) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/source-columns/${tableName}`);
      return response.data;
    } else {
      const response = await apiFetch(`source-columns/${tableName}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Variables :", error);
  }
};

export const fetchVariableById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/variable-template-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`variable-template-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Variable with this id :", error);
  }
};

export const editVariable = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-variable-template/${id}`,
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
        `/api/update-variable-template/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing Variable with this id :", error);
  }
};

export const deleteVariable = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(
        `/api/delete-variable-template/${id}`
      );
      return response.data;
    } else {
      const response = await apiFetch(`delete-variable-template/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting Variable with this id :", error);
  }
};
