import React, { useState, useRef, useEffect } from "react";
import { Badge, Button, IconButton, TextField } from '@mui/material';
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

const server_url = "http://localhost:8000";

let connections = {};

const peerConfigConnections = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default function VideoMeet() {
    let socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoRef = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState();
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setShowModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState(true);
    let [messages, setMessages] = useState([]);
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");

    const videoElemRefs = useRef({});
    let [videos, setVideos] = useState([]);

    // Map of socketId -> username for remote peers
    let [peerUsernames, setPeerUsernames] = useState({});

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoAvailable(!!videoPermission);

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioAvailable(!!audioPermission);

            setScreenAvailable(!!navigator.mediaDevices.getDisplayMedia);

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({
                    video: videoAvailable,
                    audio: audioAvailable
                });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => { getPermissions(); }, []);

    let getUserMediaSuccess = (stream) => {
        try { window.localStream.getTracks().forEach(track => track.stop()); }
        catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            window.localStream.getTracks().forEach(track => connections[id].addTrack(track, window.localStream));
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                }).catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                window.localStream.getTracks().forEach(track => connections[id].addTrack(track, window.localStream));
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                    }).catch(e => console.log(e));
                });
            }
        });
    };

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext("2d").fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then((stream) => { getDisplayMediaSuccess(stream); })
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            } catch (err) { }
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) getUserMedia();
    }, [audio, video]);

    let gotMessageFromServer = (fromId, message) => {
        let signal = JSON.parse(message);
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === "offer") {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    };

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [...prevMessages, { sender, data }]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prev) => prev + 1);
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;

            // Broadcast our username so peers can display it
            socketRef.current.emit("set-username", username);

            socketRef.current.on("chat-message", addMessage);

            // Listen for peer usernames
            socketRef.current.on("peer-username", (socketId, peerName) => {
                setPeerUsernames(prev => ({ ...prev, [socketId]: peerName }));
            });

            socketRef.current.on("user-left", (id) => {
                if (videoElemRefs.current[id]) {
                    videoElemRefs.current[id].srcObject = null;
                    delete videoElemRefs.current[id];
                }
                setVideos((prevVideos) => {
                    const leavingVideo = prevVideos.find((v) => v.socketId === id);
                    if (leavingVideo && leavingVideo.stream) {
                        leavingVideo.stream.getTracks().forEach(track => track.stop());
                    }
                    return prevVideos.filter((v) => v.socketId !== id);
                });
                setPeerUsernames(prev => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                });
                if (connections[id]) {
                    connections[id].close();
                    delete connections[id];
                }
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return;
                    if (!connections[socketListId]) {
                        connections[socketListId] = new RTCPeerConnection(peerConfigConnections);
                        connections[socketListId].onicecandidate = (event) => {
                            if (event.candidate !== null) {
                                socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                            }
                        };
                        connections[socketListId].ontrack = (event) => {
                            setVideos(prevVideos => {
                                const filteredVideos = prevVideos.filter(v => v.socketId !== socketListId);
                                return [...filteredVideos, { socketId: socketListId, stream: event.streams[0] }];
                            });
                        };
                        if (window.localStream) {
                            window.localStream.getTracks().forEach(track => {
                                connections[socketListId].addTrack(track, window.localStream);
                            });
                        }
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue;
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                            }).catch(e => console.log(e));
                        });
                    }
                }
            });
        });
    };

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    let routeTo = useNavigate();

    const connect = () => {
        if (!username.trim()) return;
        getMedia();
        setAskForUsername(false);
    };

    let handleVideo = () => setVideo(!video);
    let handleAudio = () => setAudio(!audio);

    let getDisplayMediaSuccess = (stream) => {
        try { window.localStream.getTracks().forEach(track => track.stop()); }
        catch (e) { console.log(e); }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            window.localStream.getTracks().forEach(track => connections[id].addTrack(track, window.localStream));
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                }).catch((e) => { console.log(e); });
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (e) { console.log(e); }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;
            getUserMedia();
        });
    };

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then((stream) => { getDisplayMediaSuccess(stream); })
                    .catch((e) => console.log(e));
            }
        }
    };

    useEffect(() => {
        if (screen !== undefined) getDisplayMedia();
    }, [screen]);

    let handleScreen = () => setScreen(!screen);

    let sendMessage = () => {
        if (!message.trim()) return;
        socketRef.current.emit("chat-message", message, username, socketIdRef.current);
        setMessage("");
    };

    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) { console.log(e); }
        routeTo("/home");
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                * { box-sizing: border-box; margin: 0; padding: 0; }

                body { background: #0a0a0f; }

                .lobby-wrapper {
                    min-height: 100vh;
                    background: #0a0a0f;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: 'DM Sans', sans-serif;
                    position: relative;
                    overflow: hidden;
                }

                .lobby-wrapper::before {
                    content: '';
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
                    top: -100px;
                    left: -100px;
                    pointer-events: none;
                }

                .lobby-wrapper::after {
                    content: '';
                    position: absolute;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%);
                    bottom: -50px;
                    right: -50px;
                    pointer-events: none;
                }

                .lobby-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    padding: 48px;
                    width: 480px;
                    backdrop-filter: blur(20px);
                    position: relative;
                    z-index: 1;
                    box-shadow: 0 32px 64px rgba(0,0,0,0.4);
                }

                .lobby-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 2rem;
                    font-weight: 800;
                    color: #fff;
                    margin-bottom: 6px;
                    letter-spacing: -0.5px;
                }

                .lobby-subtitle {
                    color: rgba(255,255,255,0.4);
                    font-size: 0.9rem;
                    margin-bottom: 32px;
                    font-weight: 300;
                }

                .lobby-preview {
                    width: 100%;
                    aspect-ratio: 16/9;
                    background: #111118;
                    border-radius: 16px;
                    overflow: hidden;
                    margin-bottom: 28px;
                    border: 1px solid rgba(255,255,255,0.06);
                    position: relative;
                }

                .lobby-preview video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scaleX(-1);
                }

                .lobby-input-row {
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .lobby-input {
                    flex: 1;
                    background: rgba(255,255,255,0.05) !important;
                    border: 1px solid rgba(255,255,255,0.1) !important;
                    border-radius: 12px !important;
                    color: #fff !important;
                    font-family: 'DM Sans', sans-serif !important;
                    padding: 14px 18px !important;
                    font-size: 0.95rem !important;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .lobby-input::placeholder { color: rgba(255,255,255,0.3); }
                .lobby-input:focus { border-color: rgba(99,102,241,0.6) !important; }

                .join-btn {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
                    color: #fff !important;
                    border: none !important;
                    border-radius: 12px !important;
                    padding: 14px 28px !important;
                    font-family: 'Syne', sans-serif !important;
                    font-weight: 700 !important;
                    font-size: 0.9rem !important;
                    cursor: pointer;
                    transition: opacity 0.2s, transform 0.15s !important;
                    white-space: nowrap;
                    letter-spacing: 0.3px;
                }

                .join-btn:hover { opacity: 0.9; transform: translateY(-1px); }

                /* ---- MEET ROOM ---- */
                .meet-room {
                    height: 100vh;
                    width: 100vw;
                    background: #0a0a0f;
                    display: flex;
                    flex-direction: column;
                    font-family: 'DM Sans', sans-serif;
                    overflow: hidden;
                    position: relative;
                }

                /* Top bar */
                .meet-topbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 24px;
                    background: rgba(255,255,255,0.02);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    flex-shrink: 0;
                    z-index: 10;
                }

                .meet-logo {
                    font-family: 'Syne', sans-serif;
                    font-size: 1.3rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.3px;
                }

                .meet-logo span {
                    color: #6366f1;
                }

                .meet-meta {
                    color: rgba(255,255,255,0.3);
                    font-size: 0.8rem;
                }

                /* Main content area */
                .meet-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                    position: relative;
                }

                /* Conference grid */
                .conference-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    gap: 16px;
                    overflow: hidden;
                }

                .video-grid {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 14px;
                    overflow-y: auto;
                    align-content: start;
                }

                .video-tile {
                    background: #111118;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.06);
                    position: relative;
                    aspect-ratio: 16/9;
                    transition: border-color 0.2s;
                }

                .video-tile:hover {
                    border-color: rgba(99,102,241,0.3);
                }

                .video-tile video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .video-username-tag {
                    position: absolute;
                    bottom: 12px;
                    left: 12px;
                    background: rgba(0,0,0,0.65);
                    backdrop-filter: blur(8px);
                    color: #fff;
                    font-size: 0.78rem;
                    font-weight: 500;
                    padding: 4px 10px;
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.1);
                    pointer-events: none;
                    font-family: 'DM Sans', sans-serif;
                }

                /* Local video (self) */
                .local-video-wrapper {
                    position: absolute;
                    bottom: 90px;
                    right: 24px;
                    width: 200px;
                    border-radius: 14px;
                    overflow: hidden;
                    border: 2px solid rgba(99,102,241,0.5);
                    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
                    z-index: 20;
                    background: #111118;
                }

                .local-video-wrapper video {
                    width: 100%;
                    display: block;
                    transform: scaleX(-1);
                }

                .local-username-tag {
                    background: rgba(99,102,241,0.8);
                    color: #fff;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 4px 10px;
                    text-align: center;
                    font-family: 'DM Sans', sans-serif;
                    letter-spacing: 0.2px;
                }

                /* Controls */
                .controls-bar {
                    position: absolute;
                    bottom: 24px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(20,20,30,0.85);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 50px;
                    padding: 10px 20px;
                    z-index: 30;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
                }

                .ctrl-btn {
                    width: 46px !important;
                    height: 46px !important;
                    border-radius: 50% !important;
                    background: rgba(255,255,255,0.07) !important;
                    color: #fff !important;
                    transition: background 0.2s, transform 0.15s !important;
                }

                .ctrl-btn:hover {
                    background: rgba(255,255,255,0.14) !important;
                    transform: scale(1.08);
                }

                .ctrl-btn.active {
                    background: rgba(99,102,241,0.3) !important;
                }

                .end-btn {
                    width: 52px !important;
                    height: 52px !important;
                    border-radius: 50% !important;
                    background: #ef4444 !important;
                    color: #fff !important;
                    transition: background 0.2s, transform 0.15s !important;
                    box-shadow: 0 0 20px rgba(239,68,68,0.4) !important;
                }

                .end-btn:hover {
                    background: #dc2626 !important;
                    transform: scale(1.08);
                }

                .divider {
                    width: 1px;
                    height: 28px;
                    background: rgba(255,255,255,0.1);
                    margin: 0 4px;
                }

                /* Chat panel */
                .chat-panel {
                    width: 320px;
                    background: rgba(255,255,255,0.02);
                    border-left: 1px solid rgba(255,255,255,0.06);
                    display: flex;
                    flex-direction: column;
                    flex-shrink: 0;
                    overflow: hidden;
                }

                .chat-header {
                    padding: 20px 20px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                    font-family: 'Syne', sans-serif;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.2px;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(255,255,255,0.1) transparent;
                }

                .chat-empty {
                    color: rgba(255,255,255,0.2);
                    font-size: 0.85rem;
                    text-align: center;
                    margin-top: 32px;
                }

                .chat-bubble {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    padding: 10px 14px;
                }

                .chat-sender {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6366f1;
                    margin-bottom: 4px;
                    font-family: 'Syne', sans-serif;
                }

                .chat-text {
                    font-size: 0.875rem;
                    color: rgba(255,255,255,0.8);
                    line-height: 1.5;
                }

                .chat-input-area {
                    padding: 16px;
                    border-top: 1px solid rgba(255,255,255,0.06);
                    display: flex;
                    gap: 8px;
                }

                .chat-input {
                    flex: 1;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    padding: 10px 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    resize: none;
                }

                .chat-input:focus { border-color: rgba(99,102,241,0.5); }
                .chat-input::placeholder { color: rgba(255,255,255,0.2); }

                .send-btn {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
                    color: #fff !important;
                    border: none !important;
                    border-radius: 10px !important;
                    padding: 0 16px !important;
                    font-family: 'Syne', sans-serif !important;
                    font-weight: 700 !important;
                    font-size: 0.8rem !important;
                    cursor: pointer;
                    white-space: nowrap;
                    min-width: 60px;
                }

                .no-participants {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 12px;
                    color: rgba(255,255,255,0.15);
                    font-size: 0.9rem;
                }

                .no-participants-icon {
                    font-size: 3rem;
                    opacity: 0.4;
                }
            `}</style>

            {askForUsername ? (
                <div className="lobby-wrapper">
                    <div className="lobby-card">
                        <h1 className="lobby-title">Join Meeting</h1>
                        <p className="lobby-subtitle">Set up your camera and enter your name</p>

                        <div className="lobby-preview">
                            <video ref={localVideoRef} autoPlay muted />
                        </div>

                        <div className="lobby-input-row">
                            <input
                                className="lobby-input"
                                placeholder="Your name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && connect()}
                            />
                            <button className="join-btn" onClick={connect}>Join Now</button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="meet-room">
                    {/* Top bar */}
                    <div className="meet-topbar">
                        <div className="meet-logo">Vartal<span>ap</span></div>
                        <div className="meet-meta">{videos.length + 1} participant{videos.length !== 0 ? "s" : ""}</div>
                    </div>

                    {/* Main content */}
                    <div className="meet-content">
                        {/* Video area */}
                        <div className="conference-area">
                            <div className="video-grid">
                                {videos.length === 0 ? (
                                    <div className="no-participants">
                                        <div className="no-participants-icon">👥</div>
                                        <span>Waiting for others to join...</span>
                                    </div>
                                ) : (
                                    videos.map((v) => (
                                        <div className="video-tile" key={v.socketId}>
                                            <video
                                                autoPlay
                                                playsInline
                                                ref={(element) => {
                                                    if (element && v.stream) {
                                                        videoElemRefs.current[v.socketId] = element;
                                                        element.srcObject = v.stream;
                                                    }
                                                }}
                                            />
                                            <div className="video-username-tag">
                                                {peerUsernames[v.socketId] || "Guest"}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat panel */}
                        {showModal && (
                            <div className="chat-panel">
                                <div className="chat-header">💬 Chat</div>
                                <div className="chat-messages">
                                    {messages.length === 0 ? (
                                        <p className="chat-empty">No messages yet. Say hi! 👋</p>
                                    ) : (
                                        messages.map((item, index) => (
                                            <div className="chat-bubble" key={index}>
                                                <div className="chat-sender">{item.sender}</div>
                                                <div className="chat-text">{item.data}</div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="chat-input-area">
                                    <input
                                        className="chat-input"
                                        placeholder="Type a message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                                    />
                                    <button className="send-btn" onClick={sendMessage}>Send</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Local video (self) */}
                    <div className="local-video-wrapper">
                        <video ref={localVideoRef} autoPlay muted />
                        <div className="local-username-tag">You · {username}</div>
                    </div>

                    {/* Controls */}
                    <div className="controls-bar">
                        <IconButton className={`ctrl-btn ${video ? "active" : ""}`} onClick={handleVideo}>
                            {video ? <VideocamIcon fontSize="small" /> : <VideocamOffIcon fontSize="small" />}
                        </IconButton>

                        <IconButton className={`ctrl-btn ${audio ? "active" : ""}`} onClick={handleAudio}>
                            {audio ? <MicIcon fontSize="small" /> : <MicOffIcon fontSize="small" />}
                        </IconButton>

                        <div className="divider" />

                        <IconButton className="end-btn" onClick={handleEndCall}>
                            <CallEndIcon fontSize="small" />
                        </IconButton>

                        <div className="divider" />

                        {screenAvailable && (
                            <IconButton className={`ctrl-btn ${screen ? "active" : ""}`} onClick={handleScreen}>
                                {screen ? <ScreenShareIcon fontSize="small" /> : <StopScreenShareIcon fontSize="small" />}
                            </IconButton>
                        )}

                        <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton className={`ctrl-btn ${showModal ? "active" : ""}`} onClick={() => { setShowModal(!showModal); setNewMessages(0); }}>
                                <ChatIcon fontSize="small" />
                            </IconButton>
                        </Badge>
                    </div>
                </div>
            )}
        </>
    );
}