import React, { useState, useRef, useEffect } from "react";
import { Badge, Button, Experimental_CssVarsProvider, IconButton, TextField } from '@mui/material';
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import CallEndIcon from "@mui/icons-material/CallEnd";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import { io } from "socket.io-client";
import styles from "../styles/videoComponent.module.css";

const server_url = "http://localhost:8000";

let connections = {}

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

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
    let [message, setMessage] = useState();

    let [newMessages, setNewMessages] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([]);
    const videoElemRefs = useRef({});         // FIX: map of socketId -> video DOM element
    let [videos, setVideos] = useState([]);

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
            }
            else {
                setVideoAvailable(false);
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
            }
            else {
                setAudioAvailable(false);
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            }
            else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });

                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop());
        }
        catch (e) {
            console.log(e);
        }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections) {
            if (id === socketIdRef.current) {
                continue;
            }

            window.localStream.getTracks().forEach(track => {
                connections[id].addTrack(track, window.localStream);
            });
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                    })
                    .catch(e => console.log(e));
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            }
            catch (e) {
                console.log(e);
            };

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                window.localStream.getTracks().forEach(track => {
                    connections[id].addTrack(track, window.localStream);
                });
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
                        })
                        .catch(e => console.log(e));
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();

        let dst = oscillator.connect(ctx.createMediaStreamDestination());

        oscillator.start();
        ctx.resume();

        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });

        canvas.getContext("2d").fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        }
        else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach((track) => track.stop());
            }
            catch (err) {

            }
        }
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video]);

    let gotMessageFromServer = (fromId, message) => {
        let signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp))
                    .then(() => {
                        if (signal.sdp.type === "offer") {
                            connections[fromId].createAnswer()
                                .then((description) => {
                                    connections[fromId].setLocalDescription(description)
                                        .then(() => {
                                            socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                                        })
                                        .catch(e => console.log(e))
                                })
                                .catch(e => console.log(e))
                        }
                    })
                    .catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    let addMessage = () => { }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("user-left", (id) => {
                // FIX: Null out srcObject on the actual DOM element first
                // This prevents the frozen/paused frame from staying visible
                if (videoElemRefs.current[id]) {
                    videoElemRefs.current[id].srcObject = null;
                    delete videoElemRefs.current[id];
                }

                // Stop all tracks on that user's stream
                setVideos((prevVideos) => {
                    const leavingVideo = prevVideos.find((v) => v.socketId === id);
                    if (leavingVideo && leavingVideo.stream) {
                        leavingVideo.stream.getTracks().forEach(track => track.stop());
                    }
                    return prevVideos.filter((v) => v.socketId !== id);
                });

                // Close and remove the peer connection
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
                        }

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

                        connections[id2].createOffer()
                            .then((description) => {
                                connections[id2].setLocalDescription(description)
                                    .then(() => {
                                        socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections[id2].localDescription }));
                                    })
                                    .catch(e => console.log(e))
                            })
                    }
                }
            });
        });
    }

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    const connect = () => {
        getMedia();
        setAskForUsername(false);
    };

    let handleVideo=()=>{
        setVideo(!video);
    }

    let handleAudio=()=>{
        setAudio(!audio);
    }

    let getDisplayMediaSuccess=(stream)=>{
        try{
            window.localStream.getTracks().forEach(track=>track.stop())
        }
        catch(e){
            console.log(e);
        }

        window.localStream=stream;
        localVideoRef.current.srcObject=stream;

        for(let id in connections){
            if(id===socketIdRef.current){
                continue;
            }

            connections[id].addStream(window.localStream);
            connections[id].createOffer()
            .then((description)=>{
                connections[id].setLocalDescription(description)
                .then(()=>{
                    socketRef.current.emit("signal",id,JSON.stringify({"sdp": connections[id].localDescription}));
                })
                .catch((e)=>{console.log(e)});
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            }
            catch (e) {
                console.log(e);
            };

            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            localVideoRef.current.srcObject = window.localStream;

            getUserMedia();
        })
    }

    let getDisplayMedia=()=>{
        if(screen){
            if(navigator.mediaDevices.getDisplayMedia){
                navigator.mediaDevices.getDisplayMedia({video: true,audio: true})
                .then(getDisplayMediaSuccess)
                .then((stream)=>{})
                .catch((e)=>console.log(e));
            }
        }
    }

    useEffect(()=>{
        if(screen!==undefined){
            getDisplayMedia();
        }
    },[screen])

    let handleScreen=()=>{
        setScreen(!screen)
    }

    let sendMessage=()=>{
        
    }

    return (
        <div>
            {(askForUsername === true) ?
                <div>
                    <h2>Enter into Lobby</h2>
                    <TextField id="outlined-basic" label="username" value={username} onChange={(e) => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" onClick={connect}>Connect</Button>
                    <div>
                        <video ref={localVideoRef} autoPlay muted></video>
                    </div>
                </div>
                : <div className={styles.meetVideoContainer}>
                    {showModal?
                    <div className={styles.chatRoom}>
                        <div className={styles.chatContainer}>
                            <h1>Chat</h1>
                            <div className={styles.chattingArea}>
                                <TextField id="outlined-basic" label="Enter your message" variant="outlined" />
                                <Button variant="contained" onClick={sendMessage}>Send</Button>
                            </div>
                        </div>
                    </div>:<></>}

                    <div className={styles.buttonContainer}>
                        <IconButton onClick={handleVideo} style={{color: "white"}}>
                            {(video===true)?<VideocamIcon/>:<VideocamOffIcon/>}
                        </IconButton>

                        <IconButton style={{color: "red"}}>
                            <CallEndIcon/>
                        </IconButton>

                        <IconButton onClick={handleAudio} style={{color: "white"}}>
                            {(audio===true)?<MicIcon/>:<MicOffIcon/>}
                        </IconButton>

                        {screenAvailable?
                            <IconButton onClick={handleScreen}  style={{color: "white"}}>
                                {screen===true?<ScreenShareIcon/>:<StopScreenShareIcon/>}
                            </IconButton>
                        :<></>}

                        <Badge badgeContent={newMessages} max={999} color="secondary">
                            <IconButton onClick={()=>setShowModal(!showModal)} style={{color: "white"}}>
                                <ChatIcon/>
                            </IconButton>
                        </Badge>
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted style={{ width: "300px" }}></video>
                    <div className={styles.conferenceView}>
                        {videos.map((v) => (
                            <div key={v.socketId}>
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
                            </div>
                        ))}
                    </div>
                </div>}
        </div>
    )
}