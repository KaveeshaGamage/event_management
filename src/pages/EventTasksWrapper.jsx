import React from "react";

import {
    useParams
} from "react-router-dom";

import EventTasks
    from "./EventTasks";


function EventTasksWrapper() {

    const { eventId } =
        useParams();

    return (
        <EventTasks
            eventId={eventId}
        />
    );
}


export default EventTasksWrapper;