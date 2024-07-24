import { toast } from "react-toastify";
import Swal from "sweetalert2";

const baseUrl = "http://localhost:8000/api";

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

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    withCredentials: true,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}/${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    handleError("Erreur !");
    Swal.fire({
      title: "Erreur !",
      icon: "error",
    });
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}
