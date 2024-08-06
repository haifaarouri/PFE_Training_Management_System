import { toast } from "react-toastify";
import { apiFetch } from "./api";
import axios from "./axios";
import Swal from "sweetalert2";

export const fetchAllCandidats = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/candidats");
      return response.data;
    } else {
      const response = await apiFetch("candidats");
      return response;
    }
  } catch (error) {
    console.log("Error fetching candidats :", error);
  }
};

export const fetchCandidatById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/candidat-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`candidat-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching candidat with this id :", error);
  }
};

export const editCandidat = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-candidat/${id}`,
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
        `/api/update-candidat/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing candidat with this id :", error);
  }
};

export const deleteCandidat = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-candidat/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-candidat/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting candidat with this id :", error);
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

export const convertToParticipant = async (candidatId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(
        `/api/convert-participant/${candidatId}`
      );
      return response.data;
    } else {
      const response = await apiFetch(`convert-participant/${candidatId}`);
      return response;
    }
  } catch (error) {
    if (!localStorage.getItem("token")) {
      handleError(error.response.data.error);
      Swal.fire({
        title: error.response.data.error,
        text: "Il doit avoir au moins une inscription confirmée !",
        icon: "error",
      });
    } else {
      Swal.fire({
        title: error,
        text: "Il doit avoir au moins une inscription confirmée !",
        icon: "error",
      });
    }
  }
};
