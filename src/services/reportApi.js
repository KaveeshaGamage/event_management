import axios from "axios";


const API_URL =
    "http://localhost:5000/api";


// ======================================================
// GET TOKEN
// ======================================================

const getToken = () => {

    return localStorage.getItem("token");

};


// ======================================================
// AUTH CONFIG
// ======================================================

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
// GET ALL ORGANIZER EVENTS
// ======================================================

export const getReportEvents = async () => {

    console.log(
        "Loading report events..."
    );


    const response =
        await axios.get(
            `${API_URL}/reports/events`,
            authConfig()
        );


    console.log(
        "Report events:",
        response.data
    );


    return response.data;

};


// ======================================================
// GET SINGLE EVENT REPORT
// ======================================================

export const getEventReport =
    async (eventId) => {

        console.log(
            "Loading report for event:",
            eventId
        );


        const response =
            await axios.get(
                `${API_URL}/reports/event/${eventId}`,
                authConfig()
            );


        console.log(
            "Event report:",
            response.data
        );


        return response.data;

    };