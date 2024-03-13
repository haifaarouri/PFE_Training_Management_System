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
    const response = await axios.post(`/api/send-email-edit-user/${id}`, formData, {
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
    const response = await axios.delete(`/api/send-email-delete-user/${id}`);
    return response.data;
  } catch (error) {
    console.log("Error deleting user with this id :", error);
  }
};

export const assignRole = async (formData) => {
  // Display FormData content
  const formDataObject = {};
  for (const [key, value] of formData.entries()) {
    formDataObject[key] = value;
  }
  console.log(formDataObject);
  const email = formDataObject.email;
  console.log(email);
  try {
    const response = await axios.post(`/api/send-email-assign-role/${email}`, formData, {
      headers: {
        ContentType: "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.log("Error assigning role to user with this email :", error);
  }
};