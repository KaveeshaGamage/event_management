import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getToken = () => {
    return localStorage.getItem("token");
};

const authConfig = () => {
    const token = getToken();

    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};


// ========================================
// CALENDAR
// ========================================

export const getCalendar = async (start, end) => {

    console.log("GET /calendar");
    console.log("Start:", start);
    console.log("End:", end);
    console.log("Token exists:", !!getToken());

    try {

        const response = await axios.get(
            `${API_URL}/calendar`,
            {
                params: {
                    start,
                    end,
                },
                ...authConfig(),
                timeout: 10000,
            }
        );

        console.log(
            "Calendar response:",
            response.data
        );

        // Calendar debug
        const task = response.data.find(
            item => item.item_type === "task"
        );

        console.log(
            "========== CALENDAR DEBUG =========="
        );

        console.log("Task:", task);
        console.log(
            "Task Event ID:",
            task?.event_id
        );
        console.log(
            "Task Event Title:",
            task?.event_title
        );

        console.log(
            "===================================="
        );

        return response.data;

    } catch (error) {

        console.error(
            "getCalendar API error:",
            error
        );

        if (error.response) {

            console.error(
                "Status:",
                error.response.status
            );

            console.error(
                "Data:",
                error.response.data
            );
        }

        if (error.request) {

            console.error(
                "No response received from server"
            );
        }

        throw error;
    }
};


// ========================================
// TASKS
// ========================================

export const getEventTasks = async (eventId) => {

    const response = await axios.get(
        `${API_URL}/tasks/event/${eventId}`,
        authConfig()
    );

    return response.data;
};


export const createTask = async (
    eventId,
    task
) => {

    const response = await axios.post(
        `${API_URL}/tasks/event/${eventId}`,
        task,
        authConfig()
    );

    return response.data;
};


export const updateTask = async (
    taskId,
    task
) => {

    const response = await axios.put(
        `${API_URL}/tasks/${taskId}`,
        task,
        authConfig()
    );

    return response.data;
};


export const deleteTask = async (
    taskId
) => {

    const response = await axios.delete(
        `${API_URL}/tasks/${taskId}`,
        authConfig()
    );

    return response.data;
};


// ========================================
// RESOURCES
// ========================================

export const getResources = async () => {

    const response = await axios.get(
        `${API_URL}/resources`,
        authConfig()
    );

    return response.data;
};


export const createResource = async (
    resource
) => {

    const response = await axios.post(
        `${API_URL}/resources`,
        resource,
        authConfig()
    );

    return response.data;
};


export const checkResourceAvailability = async (
    resourceId,
    start,
    end
) => {

    const response = await axios.get(
        `${API_URL}/resources/availability`,
        {
            params: {
                resource_id: resourceId,
                start_datetime: start,
                end_datetime: end,
            },
            ...authConfig(),
        }
    );

    return response.data;
};


// ========================================
// CREATE RESOURCE BOOKING
// ========================================

export const createResourceBooking = async (
    booking
) => {

    console.log(
        "CREATE RESOURCE BOOKING PAYLOAD:",
        booking
    );

    const response = await axios.post(
        `${API_URL}/resources/book`,
        booking,
        authConfig()
    );

    console.log(
        "RESOURCE BOOKING RESPONSE:",
        response.data
    );

    return response.data;
};


// ========================================
// DELETE RESOURCE
// ========================================

export const deleteResource = async (
    resourceId
) => {

    const response = await axios.delete(
        `${API_URL}/resources/${resourceId}`,
        authConfig()
    );

    return response.data;
};


// ========================================
// GET RESOURCE BOOKINGS
// ========================================

export const getResourceBookings = async (
    eventId
) => {

    const response = await axios.get(
        `${API_URL}/resources/bookings/event/${eventId}`,
        authConfig()
    );

    return response.data;
};


// ========================================
// DELETE RESOURCE BOOKING
// ========================================

export const deleteResourceBooking = async (
    bookingId
) => {

    const response = await axios.delete(
        `${API_URL}/resources/bookings/${bookingId}`,
        authConfig()
    );

    return response.data;
};


// ========================================
// COMMITTEE MEMBERS
// ========================================

export const getCommitteeMembers = async (
    eventId
) => {

    try {

        const response = await axios.get(
            `${API_URL}/committee/events/${eventId}/members`,
            authConfig()
        );

        console.log(
            "Committee members for event:",
            eventId,
            response.data
        );

        return response.data;

    } catch (error) {

        console.error(
            "getCommitteeMembers error:",
            error
        );

        if (error.response) {

            console.error(
                "Status:",
                error.response.status
            );

            console.error(
                "Data:",
                error.response.data
            );
        }

        throw error;
    }
};

