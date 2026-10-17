import axios from "axios";


const API_URL =
    "http://localhost:5000/api";


const getToken = () => {

    return localStorage.getItem(
        "token"
    );

};


const authConfig = () => {

    return {

        headers: {

            Authorization:
                `Bearer ${getToken()}`

        }

    };

};


// ======================================================
// GET MESSAGES
// ======================================================

export const getEventMessages = async (
    eventId
) => {

    const response =
        await axios.get(
            `${API_URL}/chat/events/${eventId}/messages`,
            authConfig()
        );


    return response.data;

};


// ======================================================
// SEND MESSAGE
// ======================================================

export const sendEventMessage = async (
    eventId,
    message
) => {

    const response =
        await axios.post(
            `${API_URL}/chat/events/${eventId}/messages`,
            {
                message
            },
            authConfig()
        );


    return response.data;

};