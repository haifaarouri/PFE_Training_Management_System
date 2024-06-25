import { toast } from "react-toastify";
import { apiFetch } from "./api";
import axios from "./axios";
import Swal from "sweetalert2";

export const fetchAllParticipants = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/participants");
      return response.data;
    } else {
      const response = await apiFetch("participants");
      return response;
    }
  } catch (error) {
    console.log("Error fetching Participants :", error);
  }
};

export const fetchParticipantById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/participant-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`participant-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Participant with this id :", error);
  }
};

export const editParticipant = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-participant/${id}`,
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
        `/api/update-participant/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing Participant with this id :", error);
  }
};

export const deleteParticipant = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-participant/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-participant/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting Participant with this id :", error);
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

export const convertToParticipant = async (ParticipantId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/convert-participant/${ParticipantId}`,
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
        `/api/convert-participant/${ParticipantId}`,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    handleError(error.response.data.error);
    Swal.fire({
      title: error.response.data.error,
      text: "Il doit avoir au moins une inscription confirmée !",
      icon: "error",
    });
  }
};

export const fetchWaitingList = async (sessionId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        "/api/participants-in-waiting-list/" + sessionId
      );
      return response.data;
    } else {
      const response = await apiFetch(
        "participants-in-waiting-list/" + sessionId
      );
      return response;
    }
  } catch (error) {
    handleError(error.response.data.error);
    Swal.fire({
      title: "Opss...",
      text: "Quelque chose s'est mal passée !",
      icon: "error",
    });
  }
};

export const cancelParticipation = async (participantId, sessionId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/participants/${participantId}/sessions/${sessionId}/cancel`
        // formData,
        // {
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //   },
        // }
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
        `/api/participants/${participantId}/sessions/${sessionId}/cancel`,
        // formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error cancelling Participation :", error);
  }
};

export const fetchParticipantsSessionId = async (sessionId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/participants/session/${sessionId}`
      );
      return response.data;
    } else {
      const response = await apiFetch(`participants/session/${sessionId}`);
      return response;
    }
  } catch (error) {
    console.log(
      "Error fetching Participants for session with this id :",
      error
    );
  }
};

export const fetchPresenceSessionId = async (sessionId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/presence/${sessionId}`);
      return response.data;
    } else {
      const response = await apiFetch(`presence/${sessionId}`);
      return response;
    }
  } catch (error) {
    console.log(
      "Error fetching Participants for session with this id :",
      error
    );
  }
};
