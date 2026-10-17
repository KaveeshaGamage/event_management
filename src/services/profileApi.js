import axios from "axios";


const API_URL =
    "http://localhost:5000/api";


// ==================================================
// GET TOKEN
// ==================================================

const getToken = () => {

    return localStorage.getItem(
        "token"
    );

};


// ==================================================
// AUTH CONFIG
// ==================================================

const authConfig = () => {

    const token =
        getToken();

    return {
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    };

};


// ==================================================
// GET PROFILE
// ==================================================

export const getProfile = async () => {

    const response =
        await axios.get(
            `${API_URL}/profile`,
            authConfig()
        );

    return response.data;

};


// ==================================================
// UPDATE PROFILE
// ==================================================

export const updateProfile =
    async (profileData) => {

        const response =
            await axios.put(
                `${API_URL}/profile`,
                profileData,
                authConfig()
            );

        return response.data;

    };


// ==================================================
// CHANGE PASSWORD
// ==================================================

export const changePassword =
    async (passwordData) => {

        const response =
            await axios.put(
                `${API_URL}/profile/password`,
                passwordData,
                authConfig()
            );

        return response.data;

    };