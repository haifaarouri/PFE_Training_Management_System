import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllSessions = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/sessions");
      return response.data;
    } else {
      const response = await apiFetch("sessions");
      return response;
    }
  } catch (error) {
    console.log("Error fetching Sessions :", error);
  }
};

export const fetchSessionById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/session-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`session-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Session with this id :", error);
  }
};

export const fetchSessionDays = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/session-days/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`session-days/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching days of seesion with this id :", error);
  }
};

export const getSessionByCriteria = async (startDate, endDate, reference) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/session/${startDate}/${endDate}/${reference}`
      );
      return response.data;
    } else {
      const response = await apiFetch(
        `session/${startDate}/${endDate}/${reference}`
      );
      return response;
    }
  } catch (error) {
    console.error("Error fetching session by criteria:", error);
    return null;
  }
};

export const editSession = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(`/api/update-session/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
      const response = await axios.post(`/api/update-session/${id}`, formData, {
        headers: headers,
      });
      return response;
    }
  } catch (error) {
    console.log("Error editing Session with this id :", error);
  }
};

export const deleteSession = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-session/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-session/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting Session with this id :", error);
  }
};
