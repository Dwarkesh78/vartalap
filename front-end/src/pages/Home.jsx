import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

function Home() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .home-root {
                    min-height: 100vh;
                    background: #0a0a0f;
                    font-family: 'DM Sans', sans-serif;
                    color: #fff;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    overflow: hidden;
                }

                .home-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 32px 32px;
                    pointer-events: none;
                }

                .home-blob-1 {
                    position: absolute;
                    width: 600px; height: 600px;
                    background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
                    top: -150px; right: -100px;
                    pointer-events: none;
                }

                .home-blob-2 {
                    position: absolute;
                    width: 400px; height: 400px;
                    background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%);
                    bottom: 0; left: -80px;
                    pointer-events: none;
                }

                /* NAV */
                .home-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 48px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    position: relative;
                    z-index: 10;
                    flex-shrink: 0;
                }

                .home-logo {
                    font-family: 'Syne', sans-serif;
                    font-size: 1.4rem;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .home-logo span { color: #6366f1; }

                .home-nav-right {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .history-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.55);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.85rem;
                    padding: 8px 16px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s, border-color 0.2s;
                }

                .history-btn:hover {
                    background: rgba(255,255,255,0.08);
                    color: #fff;
                    border-color: rgba(255,255,255,0.14);
                }

                .history-icon {
                    font-size: 1rem;
                    line-height: 1;
                }

                .logout-btn {
                    background: rgba(239,68,68,0.1);
                    border: 1px solid rgba(239,68,68,0.25);
                    color: rgba(239,68,68,0.8);
                    font-family: 'Syne', sans-serif;
                    font-size: 0.82rem;
                    font-weight: 700;
                    padding: 8px 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s, border-color 0.2s;
                    letter-spacing: 0.2px;
                }

                .logout-btn:hover {
                    background: rgba(239,68,68,0.2);
                    border-color: rgba(239,68,68,0.5);
                    color: #f87171;
                }

                /* MAIN */
                .home-main {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 60px 48px;
                    gap: 48px;
                    position: relative;
                    z-index: 5;
                }

                .home-left {
                    flex: 1;
                    max-width: 520px;
                    animation: fadeUp 0.7s ease both;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .home-label {
                    display: inline-block;
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #6366f1;
                    font-weight: 600;
                    margin-bottom: 16px;
                    font-family: 'Syne', sans-serif;
                }

                .home-title {
                    font-family: 'Syne', sans-serif;
                    font-size: clamp(2rem, 4vw, 3rem);
                    font-weight: 800;
                    line-height: 1.15;
                    letter-spacing: -1px;
                    color: #fff;
                    margin-bottom: 12px;
                }

                .home-title .dim { color: rgba(255,255,255,0.35); }

                .home-desc {
                    color: rgba(255,255,255,0.35);
                    font-size: 0.95rem;
                    font-weight: 300;
                    line-height: 1.7;
                    margin-bottom: 40px;
                }

                .join-box {
                    display: flex;
                    gap: 10px;
                    align-items: stretch;
                }

                .code-input {
                    flex: 1;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-family: 'DM Sans', sans-serif;
                    font-size: 1rem;
                    padding: 14px 18px;
                    outline: none;
                    transition: border-color 0.2s, background 0.2s;
                    letter-spacing: 1px;
                }

                .code-input::placeholder {
                    color: rgba(255,255,255,0.2);
                    letter-spacing: 0;
                }

                .code-input:focus {
                    border-color: rgba(99,102,241,0.5);
                    background: rgba(99,102,241,0.06);
                }

                .join-btn {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 14px 28px;
                    font-family: 'Syne', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.15s, box-shadow 0.2s;
                    box-shadow: 0 0 30px rgba(99,102,241,0.3);
                    white-space: nowrap;
                    letter-spacing: 0.2px;
                }

                .join-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 50px rgba(99,102,241,0.45);
                }

                .join-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Feature chips */
                .feature-chips {
                    display: flex;
                    gap: 10px;
                    margin-top: 28px;
                    flex-wrap: wrap;
                }

                .chip {
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 20px;
                    padding: 5px 12px;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.35);
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                /* Right image */
                .home-right {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeUp 0.7s 0.15s ease both;
                }

                .home-img-wrap {
                    position: relative;
                }

                .home-img-wrap::before {
                    content: '';
                    position: absolute;
                    inset: -60px;
                    background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 65%);
                    pointer-events: none;
                }

                .home-img {
                    max-height: 440px;
                    max-width: 100%;
                    object-fit: contain;
                    position: relative;
                    z-index: 2;
                    filter: drop-shadow(0 24px 48px rgba(99,102,241,0.2));
                }

                @media (max-width: 768px) {
                    .home-nav { padding: 16px 20px; }
                    .home-main { flex-direction: column; padding: 40px 20px; }
                    .home-right { display: none; }
                    .home-left { max-width: 100%; }
                }
            `}</style>

            <div className="home-root">
                <div className="home-blob-1" />
                <div className="home-blob-2" />

                {/* Nav */}
                <nav className="home-nav">
                    <div className="home-logo">Vartal<span>ap</span></div>
                    <div className="home-nav-right">
                        <button className="history-btn" onClick={() => navigate("/history")}>
                            <span className="history-icon">🕓</span> History
                        </button>
                        <button
                            className="logout-btn"
                            onClick={() => {
                                localStorage.removeItem("token");
                                navigate("/auth");
                            }}
                        >
                            Log out
                        </button>
                    </div>
                </nav>

                {/* Main */}
                <div className="home-main">
                    <div className="home-left">
                        <span className="home-label">Ready to connect</span>
                        <h1 className="home-title">
                            Start or join a<br /><span className="dim">video call</span>
                        </h1>
                        <p className="home-desc">
                            Enter a meeting code to join an existing call, or share your code with others to invite them in.
                        </p>

                        <div className="join-box">
                            <input
                                className="code-input"
                                placeholder="Enter meeting code"
                                value={meetingCode}
                                onChange={e => setMeetingCode(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleJoinVideoCall()}
                            />
                            <button
                                className="join-btn"
                                onClick={handleJoinVideoCall}
                                disabled={!meetingCode.trim()}
                            >
                                Join →
                            </button>
                        </div>

                        <div className="feature-chips">
                            <div className="chip">📹 HD Video</div>
                            <div className="chip">🔒 Secure</div>
                            <div className="chip">💬 Live Chat</div>
                            <div className="chip">🖥 Screen Share</div>
                        </div>
                    </div>

                    <div className="home-right">
                        <div className="home-img-wrap">
                            <img className="home-img" src="/logo.png" alt="Vartalap" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default withAuth(Home);