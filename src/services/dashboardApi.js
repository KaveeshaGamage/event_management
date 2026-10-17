import axios from "axios";


const API_URL =
    "http://localhost:5000/api";


const getToken = () => {

    return localStorage.getItem("token");

};


const authConfig = () => {

    const token =
        getToken();

    return {

        headers: {

            Authorization:
                `Bearer ${token}`

        },

        timeout: 10000

    };

};


// ======================================================
// GET DASHBOARD
// ======================================================

export const getDashboard =
    async () => {

        console.log(
            "Loading organizer dashboard..."
        );


        const response =
            await axios.get(
                `${API_URL}/dashboard`,
                authConfig()
            );


        console.log(
            "Dashboard data:",
            response.data
        );


        return response.data;

    };