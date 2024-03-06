import axios from "./axios";

export const fetchUserData = async () => {
  try {
    const response = await axios.get("/api/user");
    return response.data;
  } catch (error) {
    console.log("Error fetching user data:", error);
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await axios.get(`/api/user-id/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching user with this id :", error);
  }
};

export const editUser = async (id, formData) => {
  try {
    const response = await axios.post(`/api/update-user/${id}`, formData, {
      headers: {
        ContentType: "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error editing user with this id :", error);
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`/api/delete-user/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error deleting user with this id :", error);
  }
};
