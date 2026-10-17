import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import { io } from "socket.io-client";

import {
    getEventMessages,
    sendEventMessage
} from "../services/chatApi";


const SOCKET_URL =
    "http://localhost:5000";


function EventChat() {

    const {
        eventId
    } = useParams();


    const navigate =
        useNavigate();


    const [messages, setMessages] =
        useState([]);


    const [message, setMessage] =
        useState("");


    const [loading, setLoading] =
        useState(true);


    const [sending, setSending] =
        useState(false);


    const [error, setError] =
        useState("");


    const messagesEndRef =
        useRef(null);


    const socketRef =
        useRef(null);


    // ==================================================
    // GET CURRENT USER
    // ==================================================

    const getCurrentUser = () => {

        try {

            const user =
                localStorage.getItem(
                    "user"
                );


            if (!user) {

                return null;

            }


            return JSON.parse(user);

        } catch (error) {

            return null;

        }

    };


    const currentUser =
        getCurrentUser();


    // ==================================================
    // LOAD OLD MESSAGES
    // ==================================================

    const loadMessages = async () => {

        try {

            setLoading(true);

            setError("");


            const data =
                await getEventMessages(
                    eventId
                );


            setMessages(
                data.messages || []
            );


        } catch (error) {

            console.error(
                "Chat loading error:",
                error
            );


            if (
                error.response?.status ===
                403
            ) {

                setError(
                    "You do not have permission to access this chat."
                );

            } else {

                setError(
                    error.response?.data?.message ||
                    "Failed to load chat."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // ==================================================
    // SOCKET CONNECTION
    // ==================================================

    useEffect(() => {

        loadMessages();


        const socket =
            io(
                SOCKET_URL,
                {
                    transports: [
                        "websocket"
                    ]
                }
            );


        socketRef.current =
            socket;


        // ----------------------------------------------
        // Connected
        // ----------------------------------------------

        socket.on(
            "connect",
            () => {

                console.log(
                    "Connected to chat server"
                );


                socket.emit(
                    "join_event_chat",
                    eventId
                );

            }
        );


        // ----------------------------------------------
        // New message
        // ----------------------------------------------

        socket.on(
            "new_event_message",
            (newMessage) => {

                setMessages(
                    (previousMessages) => {

                        const alreadyExists =
                            previousMessages.some(
                                (item) =>
                                    item.id ===
                                    newMessage.id
                            );


                        if (
                            alreadyExists
                        ) {

                            return previousMessages;

                        }


                        return [
                            ...previousMessages,
                            newMessage
                        ];

                    }
                );

            }
        );


        // ----------------------------------------------
        // Disconnect
        // ----------------------------------------------

        socket.on(
            "disconnect",
            () => {

                console.log(
                    "Disconnected from chat server"
                );

            }
        );


        return () => {

            socket.emit(
                "leave_event_chat",
                eventId
            );


            socket.disconnect();

        };

    }, [eventId]);


    // ==================================================
    // AUTO SCROLL
    // ==================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages]);


    // ==================================================
    // SEND MESSAGE
    // ==================================================

    const handleSendMessage = async (
        e
    ) => {

        e.preventDefault();


        const cleanMessage =
            message.trim();


        if (!cleanMessage) {

            return;

        }


        try {

            setSending(true);


            const data =
                await sendEventMessage(
                    eventId,
                    cleanMessage
                );


            const createdMessage =
                data.message;


            setMessages(
                (previousMessages) => {

                    const exists =
                        previousMessages.some(
                            (item) =>
                                item.id ===
                                createdMessage.id
                        );


                    if (exists) {

                        return previousMessages;

                    }


                    return [
                        ...previousMessages,
                        createdMessage
                    ];

                }
            );


            // ------------------------------------------
            // Broadcast to everyone else
            // ------------------------------------------

            socketRef.current?.emit(
                "broadcast_event_message",
                {
                    eventId,
                    message:
                        createdMessage
                }
            );


            setMessage("");


        } catch (error) {

            console.error(
                "Send message error:",
                error
            );


            setError(
                error.response?.data?.message ||
                "Failed to send message."
            );

        } finally {

            setSending(false);

        }

    };


    // ==================================================
    // FORMAT TIME
    // ==================================================

    const formatTime = (
        date
    ) => {

        if (!date) {

            return "";

        }


        return new Date(
            date
        ).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    };


    // ==================================================
    // UI
    // ==================================================

    return (

        <div className="flex min-h-screen flex-col bg-slate-100">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="border-b bg-white px-4 py-4 shadow-sm">

                <div className="mx-auto flex max-w-5xl items-center gap-3">

                    <button
                        onClick={() =>
                            navigate(-1)
                        }
                        className="rounded-lg px-3 py-2 text-xl text-slate-600 hover:bg-slate-100"
                    >
                        ←
                    </button>


                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-xl">
                        💬
                    </div>


                    <div>

                        <h1 className="font-bold text-slate-800">
                            Event Group Chat
                        </h1>

                        <p className="text-sm text-slate-500">
                            Organizer & Committee Members
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

                <div className="mx-auto mt-4 w-full max-w-5xl px-4">

                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">

                        {error}

                    </div>

                </div>

            )}


            {/* ==================================================
                CHAT
            ================================================== */}

            <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden">


                {/* MESSAGES */}

                <div className="flex-1 overflow-y-auto px-4 py-6">


                    {loading ? (

                        <div className="flex h-full items-center justify-center">

                            <div className="text-center">

                                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>

                                <p className="text-sm text-slate-500">
                                    Loading messages...
                                </p>

                            </div>

                        </div>


                    ) : messages.length === 0 ? (

                        <div className="flex h-full items-center justify-center">

                            <div className="text-center">

                                <div className="mb-3 text-5xl">
                                    💬
                                </div>

                                <h2 className="font-semibold text-slate-700">
                                    No messages yet
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Start the conversation with your event team.
                                </p>

                            </div>

                        </div>


                    ) : (

                        <div className="space-y-4">

                            {messages.map(
                                (item) => {

                                    const isMine =
                                        Number(
                                            item.sender_id
                                        ) ===
                                        Number(
                                            currentUser?.id
                                        );


                                    return (

                                        <div
                                            key={
                                                item.id
                                            }
                                            className={`flex ${
                                                isMine
                                                    ? "justify-end"
                                                    : "justify-start"
                                            }`}
                                        >

                                            <div
                                                className={`max-w-[75%] sm:max-w-[60%] ${
                                                    isMine
                                                        ? "items-end"
                                                        : "items-start"
                                                }`}
                                            >


                                                {/* SENDER */}

                                                {!isMine && (

                                                    <p className="mb-1 ml-2 text-xs font-semibold text-slate-500">

                                                        {
                                                            item.sender_name
                                                        }

                                                    </p>

                                                )}


                                                {/* MESSAGE */}

                                                <div
                                                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                                                        isMine
                                                            ? "rounded-br-sm bg-blue-600 text-white"
                                                            : "rounded-bl-sm bg-white text-slate-800"
                                                    }`}
                                                >

                                                    <p className="whitespace-pre-wrap break-words text-sm">
                                                        {
                                                            item.message
                                                        }
                                                    </p>


                                                    <div
                                                        className={`mt-1 text-right text-[10px] ${
                                                            isMine
                                                                ? "text-blue-100"
                                                                : "text-slate-400"
                                                        }`}
                                                    >

                                                        {
                                                            formatTime(
                                                                item.created_at
                                                            )
                                                        }

                                                    </div>

                                                </div>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                            <div
                                ref={
                                    messagesEndRef
                                }
                            />

                        </div>

                    )}

                </div>


                {/* ==================================================
                    MESSAGE INPUT
                ================================================== */}

                <div className="border-t bg-white p-4">

                    <form
                        onSubmit={
                            handleSendMessage
                        }
                        className="flex gap-3"
                    >

                        <input
                            type="text"
                            value={message}
                            onChange={(e) =>
                                setMessage(
                                    e.target.value
                                )
                            }
                            placeholder="Type a message..."
                            disabled={sending}
                            className="flex-1 rounded-full border border-slate-300 px-5 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        />


                        <button
                            type="submit"
                            disabled={
                                sending ||
                                !message.trim()
                            }
                            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {sending
                                ? "..."
                                : "Send"}

                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

}


export default EventChat;