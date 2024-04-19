import { apiFetch } from "./api";
import axios from "./axios";

export const fetchAllCommandes = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/commandes");
      return response.data;
    } else {
      const response = await apiFetch("commandes");
      return response;
    }
  } catch (error) {
    console.log("Error fetching Commandes :", error);
  }
};

export const fetchAllProducts = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/products");
      return response.data;
    } else {
      const response = await apiFetch("products");
      return response;
    }
  } catch (error) {
    console.log("Error fetching Products :", error);
  }
};

export const fetchAllSuppliers = async () => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get("/api/suppliers");
      return response.data;
    } else {
      const response = await apiFetch("suppliers");
      return response;
    }
  } catch (error) {
    console.log("Error fetching suppliers :", error);
  }
};

export const fetchCommandeById = async (id) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.get(`/api/commande-id/${id}`);
      return response.data;
    } else {
      const response = await apiFetch(`commande-id/${id}`);
      return response;
    }
  } catch (error) {
    console.log("Error fetching Commande with this id :", error);
  }
};

export const editCommande = async (id, formData) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(
        `/api/update-commande/${id}`,
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
        `/api/update-commande/${id}`,
        formData,
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing Commande with this id :", error);
  }
};

export const editStatusCommande = async (id, status) => {
  try {
    if (!localStorage.getItem("token")) {
      const response = await axios.post(`/api/update-commande-status/${id}`, {
        status,
      });
      return response.data;
    } else {
      const headers = {
        Accept: "application/json",
        withCredentials: true,
      };

      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.post(
        `/api/update-commande-status/${id}`,
        { status },
        {
          headers: headers,
        }
      );
      return response;
    }
  } catch (error) {
    console.log("Error editing Commande Status with this id :", error);
  }
};

// export const deleteCommande = async (id) => {
//   try {
//     if (!localStorage.getItem("token")) {
//       const response = await axios.delete(`/api/delete-Commande/${id}`);
//       return response.data;
//     } else {
//       const response = await apiFetch(`delete-Commande/${id}`, {
//         method: "DELETE",
//       });
//       return response;
//     }
//   } catch (error) {
//     console.log("Error deleting Commande with this id :", error);
//   }
// };
