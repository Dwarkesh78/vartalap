import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, "0");
        const mins = date.getMinutes().toString().padStart(2, "0");
        return { date: `${day}/${month}/${year}`, time: `${hours}:${mins}` };
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .history-root {
                    min-height: 100vh;
                    background: #0a0a0f;
                    font-family: 'DM Sans', sans-serif;
                    color: #fff;
                    position: relative;
                    overflow-x: hidden;
                }

                .history-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
                    background-size: 32px 32px;
                    pointer-events: none;
                }

                .hist-blob {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(90px);
                }

                .hist-blob-1 {
                    width: 500px; height: 500px;
                    background: rgba(99,102,241,0.12);
                    top: -120px; left: -80px;
                }

                /* NAV */
                .hist-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 48px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    position: relative;
                    z-index: 10;
                }

                .hist-logo {
                    font-family: 'Syne', sans-serif;
                    font-size: 1.4rem;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }

                .hist-logo span { color: #6366f1; }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    color: rgba(255,255,255,0.5);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.85rem;
                    padding: 8px 18px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: background 0.2s, color 0.2s, border-color 0.2s;
                }

                .back-btn:hover {
                    background: rgba(255,255,255,0.08);
                    color: #fff;
                    border-color: rgba(255,255,255,0.14);
                }

                /* CONTENT */
                .hist-content {
                    max-width: 720px;
                    margin: 0 auto;
                    padding: 56px 24px 80px;
                    position: relative;
                    z-index: 5;
                }

                .hist-header {
                    margin-bottom: 40px;
                    animation: fadeUp 0.6s ease both;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .hist-eyebrow {
                    font-size: 0.72rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #6366f1;
                    font-weight: 600;
                    margin-bottom: 10px;
                    font-family: 'Syne', sans-serif;
                    display: block;
                }

                .hist-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 2.2rem;
                    font-weight: 800;
                    letter-spacing: -0.8px;
                    color: #fff;
                    margin-bottom: 8px;
                }

                .hist-count {
                    color: rgba(255,255,255,0.3);
                    font-size: 0.875rem;
                    font-weight: 300;
                }

                /* CARDS */
                .hist-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .hist-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px;
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 16px;
                    transition: background 0.2s, border-color 0.2s, transform 0.15s;
                    animation: fadeUp 0.5s ease both;
                    cursor: default;
                }

                .hist-card:hover {
                    background: rgba(99,102,241,0.06);
                    border-color: rgba(99,102,241,0.25);
                    transform: translateX(4px);
                }

                .hist-card-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .hist-icon {
                    width: 44px;
                    height: 44px;
                    background: rgba(99,102,241,0.12);
                    border: 1px solid rgba(99,102,241,0.2);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }

                .hist-info {}

                .hist-code {
                    font-family: 'Syne', sans-serif;
                    font-size: 1rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: 0.5px;
                    margin-bottom: 3px;
                }

                .hist-date {
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.3);
                    font-weight: 300;
                }

                .rejoin-btn {
                    background: rgba(99,102,241,0.1);
                    border: 1px solid rgba(99,102,241,0.25);
                    color: #a5b4fc;
                    font-family: 'Syne', sans-serif;
                    font-size: 0.78rem;
                    font-weight: 700;
                    padding: 7px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s, border-color 0.2s, color 0.2s;
                    white-space: nowrap;
                    letter-spacing: 0.3px;
                    flex-shrink: 0;
                }

                .rejoin-btn:hover {
                    background: rgba(99,102,241,0.22);
                    border-color: rgba(99,102,241,0.5);
                    color: #fff;
                }

                /* Empty / Loading */
                .hist-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 0;
                    gap: 16px;
                    color: rgba(255,255,255,0.2);
                    text-align: center;
                }

                .hist-empty-icon {
                    font-size: 3rem;
                    opacity: 0.5;
                }

                .hist-empty-title {
                    font-family: 'Syne', sans-serif;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: rgba(255,255,255,0.25);
                }

                .hist-empty-sub {
                    font-size: 0.85rem;
                    color: rgba(255,255,255,0.15);
                    max-width: 280px;
                }

                .hist-loading {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .skeleton {
                    height: 80px;
                    background: rgba(255,255,255,0.04);
                    border-radius: 16px;
                    animation: shimmer 1.5s infinite;
                }

                @keyframes shimmer {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }

                @media (max-width: 600px) {
                    .hist-nav { padding: 16px 20px; }
                    .hist-content { padding: 40px 16px 60px; }
                    .hist-title { font-size: 1.7rem; }
                    .rejoin-btn { display: none; }
                }
            `}</style>

            <div className="history-root">
                <div className="hist-blob hist-blob-1" />

                {/* Nav */}
                <nav className="hist-nav">
                    <div className="hist-logo">Vartal<span>ap</span></div>
                    <button className="back-btn" onClick={() => routeTo("/home")}>
                        ← Back to Home
                    </button>
                </nav>

                {/* Content */}
                <div className="hist-content">
                    <div className="hist-header">
                        <span className="hist-eyebrow">Your activity</span>
                        <h1 className="hist-title">Meeting History</h1>
                        {!loading && (
                            <p className="hist-count">
                                {meetings.length} meeting{meetings.length !== 1 ? "s" : ""} found
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="hist-loading">
                            {[1, 2, 3].map(i => <div key={i} className="skeleton" />)}
                        </div>
                    ) : meetings.length === 0 ? (
                        <div className="hist-empty">
                            <div className="hist-empty-icon">📭</div>
                            <div className="hist-empty-title">No meetings yet</div>
                            <div className="hist-empty-sub">Your past video calls will appear here once you join one.</div>
                        </div>
                    ) : (
                        <div className="hist-list">
                            {meetings.map((e, i) => {
                                const { date, time } = formatDate(e.date);
                                return (
                                    <div
                                        className="hist-card"
                                        key={i}
                                        style={{ animationDelay: `${i * 0.06}s` }}
                                    >
                                        <div className="hist-card-left">
                                            <div className="hist-icon">📹</div>
                                            <div className="hist-info">
                                                <div className="hist-code">{e.meetingCode}</div>
                                                <div className="hist-date">{date} at {time}</div>
                                            </div>
                                        </div>
                                        <button
                                            className="rejoin-btn"
                                            onClick={() => routeTo(`/${e.meetingCode}`)}
                                        >
                                            Rejoin →
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}