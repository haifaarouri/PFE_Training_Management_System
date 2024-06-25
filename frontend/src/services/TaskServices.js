import Swal from "sweetalert2";
import { apiFetch } from "./api";
import axios from "./axios";
import { toast } from "react-toastify";

export const fetchAllTasks = async (filter, sort, order) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/tasks?filter=${filter}&sort=${sort}&order=${order}`);
      return response.data;
    } else {
      const response = await apiFetch(`tasks?filter=${filter}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Tasks :", error);
  }
};

export const fetchTaskById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/tasks/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`tasks/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Task with this id :", error);
  }
};

export const editTask = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(`/api/tasks/${id}`, formData, {
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
      const response = await axios.post(`/api/tasks/${id}`, formData, {
        headers: headers,
      });
      return response;
    }
  } catch (error) {
    if (error.response.data.error) {
      let e = [];
      Object.values(error.response.data.error).forEach((element) => {
        e.push(element[0]);
      });

      e.length > 0 &&
        e.forEach((element) => {
          toast.error(element);
        });
    }
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Quelque chose s'est mal passé !",
    });
  }
};

export const deleteTask = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/tasks/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`tasks/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting Task with this id :", error);
  }
};
