import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllPartenaires = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/partenaires");
      return response.data;
    } else {
      const response = await apiFetch("partenaires");
      return response;
    }
  } catch (error) {
    console.log("Error fetching Partenaires :", error);
  }
};

export const fetchPartenaireById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/partenaire-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`partenaire-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Partenaire with this id :", error);
  }
};

export const editPartenaire = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-partenaire/${id}`,
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
        `/api/update-partenaire/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing Partenaire with this id :", error);
  }
};

export const deletePartenaire = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.delete(`/api/delete-partenaire/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`delete-partenaire/${id}`, {
        method: "DELETE",
      });
      return response;
    }
  } catch (error) {
    console.log("Error deleting Partenaire with this id :", error);
  }
};

export const assignFormation = async (partenaireId, formationId) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/assign-formation/${partenaireId}`,
        { formation_id: formationId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response.data);
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
        `/api/assign-formation/${partenaireId}`,
        { formation_id: formationId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error assign Formation to Partenaire :", error);
  }
};
