import Swal from "sweetalert2";
import { apiFetch } from "./api";
import axios from "./axios";
import { toast } from "react-toastify";
// import { toast } from "sonner";

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

export const fetchWaitingListBySessionId = async (sessionId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/participants-in-waiting-list/${sessionId}`
      );
      return response.data;
    } else {
      const response = await apiFetch(
        `participants-in-waiting-list/${sessionId}`
      );
      return response;
    }
  } catch (error) {
    console.log("Error fetching waiting list with this sessionId :", error);
    handleError(error.response.data.error);
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

export const reserveRoomForDay = async (sessionId, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/book-room/${sessionId}`,
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
        `/api/book-room/${sessionId}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    handleError(error.response.data.error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Quelque chose s'est mal passé !",
    });
  }
};

export const checkBookedRoom = async (sessionId, dayId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/check-booked-room/${sessionId}/${dayId}`
      );
      return response.data;
    } else {
      const response = await apiFetch(
        `check-booked-room/${sessionId}/${dayId}`
      );
      return response;
    }
  } catch (error) {
    console.log("Error checking booked room :", error);
  }
};

export const availableRooms = async (sessionId, dayId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/available-rooms/${sessionId}/${dayId}`
      );
      return response.data;
    } else {
      const response = await apiFetch(`available-rooms/${sessionId}/${dayId}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching available rooms :", error);
  }
};

export const reserveTrainerForDay = async (sessionId, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/book-trainer/${sessionId}`,
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
        `/api/book-trainer/${sessionId}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    handleError(error.response.data.error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Quelque chose s'est mal passé !",
    });
  }
};

export const fetchBookedDaysForTrainer = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/trainer-booked-days/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`trainer-booked-days/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching days for trainer with this id :", error);
  }
};

export const availableTrainers = async (sessionId, dayId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/available-trainers/${sessionId}/${dayId}`
      );
      return response.data;
    } else {
      const response = await apiFetch(
        `available-trainers/${sessionId}/${dayId}`
      );
      return response;
    }
  } catch (error) {
    console.log("Error fetching available rooms :", error);
  }
};

export const reserveMaterielForSession = async (sessionId, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/book-material/${sessionId}`,
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
        `/api/book-material/${sessionId}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    handleError(error.response.data.error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Quelque chose s'est mal passé !",
    });
  }
};
