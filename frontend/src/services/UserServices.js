import { apiFetch } from "./api";
import axios from "./axios";

export const fetchUserData = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/user");
      return response.data;
    } else {
      const response = await apiFetch("user");
      return response;
    }
  } catch (error) {
    console.log("Error fetching user data:", error);
  }
};

export const fetchAllUsers = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/users");
      return response.data;
    } else {
      const response = await apiFetch("users");
      return response;
    }
  } catch (error) {
    console.log("Error fetching user data:", error);
  }
};

export const fetchUserById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/user-id/${id}`);
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

export const deleteUser = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/send-email-delete-user/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`send-email-delete-user/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting user with this id :", error);
  }
};

export const assignRole = async (data) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/send-email-assign-role/${data.email}`,
        data,
        {
          headers: {
            ContentType: "multipart/form-data",
          },
        }
      );
      return response.data;
    } else {
      const response = await apiFetch(`send-email-assign-role/${data.email}`, {
        method: "PATCH",
        body: JSON.stringify(data),
        withCredentials: true,
      });
      return response;
    }
  } catch (error) {
    console.log("Error assigning role to user with this email :", error);
  }
};

export const editIsActive = async (id, causes) => {
  try {
    const data = JSON.stringify({ causes: causes });
    if (!localStorage.getItem("token")) {
      const response = await axios.post(`/api/change-is-active/${id}`, data, {
        headers: {
          ContentType: "multipart/form-data",
        },
      });
      return response.data;
    } else {
      const response = await apiFetch(`change-is-active/${id}`, {
        method: "POST",
        body: data,
        withCredentials: true,
      });
      return response;
    }
  } catch (error) {
    console.log("Error change isActive of this user with this id :", error);
  }
};
