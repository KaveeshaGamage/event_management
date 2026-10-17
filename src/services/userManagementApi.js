import axios from "axios";

const API_URL =
    "http://localhost:5000/api";

const getToken = () => {
    return localStorage.getItem("token");
};

const authConfig = () => {
    const token = getToken();

    return {
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    };
};


// ==========================================
// GET USERS
// ==========================================
export const getUsers = async (
    search = "",
    role = ""
) => {

    const response = await axios.get(
        `${API_URL}/user-management`,
        {
            ...authConfig(),
            params: {
                search,
                role
            }
        }
    );

    return response.data;
};


// ==========================================
// GET USER
// ==========================================
export const getUserById = async (id) => {

    const response = await axios.get(
        `${API_URL}/user-management/${id}`,
        authConfig()
    );

    return response.data;
};


// ==========================================
// UPDATE USER
// ==========================================
export const updateUser = async (
    id,
    userData
) => {

    const response = await axios.put(
        `${API_URL}/user-management/${id}`,
        userData,
        authConfig()
    );

    return response.data;
};


// ==========================================
// DELETE USER
// ==========================================
export const deleteUser = async (id) => {

    const response = await axios.delete(
        `${API_URL}/user-management/${id}`,
        authConfig()
    );

    return response.data;
};
export const createUser = async (userData) => {

    const response = await axios.post(
        `${API_URL}/user-management`,
        userData,
        authConfig()
    );

    return response.data;
};