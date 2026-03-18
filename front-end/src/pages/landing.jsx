import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
    const router = useNavigate();

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .landing-root {
                    min-height: 100vh;
                    background: #0a0a0f;
                    font-family: 'DM Sans', sans-serif;
                    color: #fff;
                    overflow: hidden;
                    position: relative;
                }

                /* Ambient blobs */
                .blob {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(80px);
                    opacity: 0.18;
                }
                .blob-1 {
                    width: 700px; height: 700px;
                    background: #6366f1;
                    top: -200px; left: -150px;
                }
                .blob-2 {
                    width: 500px; height: 500px;
                    background: #8b5cf6;
                    bottom: -100px; right: -100px;
                }
                .blob-3 {
                    width: 300px; height: 300px;
                    background: #ec4899;
                    top: 40%; left: 55%;
                    opacity: 0.09;
                }

                /* Dot grid overlay */
                .landing-root::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background-image: radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px);
                    background-size: 32px 32px;
                    pointer-events: none;
                    z-index: 0;
                }

                /* NAV */
                .land-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px 60px;
                    position: relative;
                    z-index: 10;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .land-logo {
                    font-family: 'Syne', sans-serif;
                    font-size: 1.5rem;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    color: #fff;
                }

                .land-logo span { color: #6366f1; }

                .land-nav-links {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .nav-link {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.55);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    font-weight: 400;
                    cursor: pointer;
                    padding: 8px 16px;
                    border-radius: 8px;
                    transition: color 0.2s, background 0.2s;
                    text-decoration: none;
                }

                .nav-link:hover {
                    color: #fff;
                    background: rgba(255,255,255,0.06);
                }

                .nav-btn {
                    background: rgba(99,102,241,0.15);
                    border: 1px solid rgba(99,102,241,0.4);
                    color: #a5b4fc;
                    font-family: 'Syne', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    padding: 9px 20px;
                    border-radius: 10px;
                    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.15s;
                    letter-spacing: 0.2px;
                }

                .nav-btn:hover {
                    background: rgba(99,102,241,0.28);
                    border-color: rgba(99,102,241,0.7);
                    color: #fff;
                    transform: translateY(-1px);
                }

                /* HERO */
                .land-hero {
                    position: relative;
                    z-index: 5;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 80px 60px 60px;
                    min-height: calc(100vh - 81px);
                    gap: 40px;
                }

                .hero-left {
                    flex: 1;
                    max-width: 560px;
                    animation: fadeUp 0.8s ease both;
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                .hero-eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(99,102,241,0.12);
                    border: 1px solid rgba(99,102,241,0.25);
                    border-radius: 20px;
                    padding: 5px 14px;
                    font-size: 0.78rem;
                    color: #a5b4fc;
                    font-weight: 500;
                    letter-spacing: 0.5px;
                    margin-bottom: 28px;
                    text-transform: uppercase;
                }

                .hero-eyebrow::before {
                    content: '';
                    width: 6px; height: 6px;
                    background: #6366f1;
                    border-radius: 50%;
                    box-shadow: 0 0 8px #6366f1;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.85); }
                }

                .hero-title {
                    font-family: 'Syne', sans-serif;
                    font-size: clamp(2.8rem, 5vw, 4.2rem);
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -1.5px;
                    color: #fff;
                    margin-bottom: 20px;
                }

                .hero-title .accent {
                    background: linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #ec4899 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .hero-sub {
                    font-size: 1.1rem;
                    color: rgba(255,255,255,0.4);
                    font-weight: 300;
                    line-height: 1.7;
                    margin-bottom: 44px;
                    max-width: 420px;
                }

                .hero-actions {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                }

                .cta-primary {
                    display: inline-block;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                    font-family: 'Syne', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 700;
                    padding: 15px 32px;
                    border-radius: 12px;
                    text-decoration: none;
                    letter-spacing: 0.2px;
                    box-shadow: 0 0 40px rgba(99,102,241,0.35);
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .cta-primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 60px rgba(99,102,241,0.5);
                }

                .cta-secondary {
                    background: none;
                    border: 1px solid rgba(255,255,255,0.12);
                    color: rgba(255,255,255,0.6);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.9rem;
                    padding: 14px 28px;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: border-color 0.2s, color 0.2s, transform 0.15s;
                }

                .cta-secondary:hover {
                    border-color: rgba(255,255,255,0.28);
                    color: #fff;
                    transform: translateY(-1px);
                }

                /* Right image */
                .hero-right {
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    animation: fadeUp 0.8s 0.2s ease both;
                    position: relative;
                }

                .hero-image-wrap {
                    position: relative;
                    display: flex;
                    justify-content: center;
                }

                .hero-image-wrap::before {
                    content: '';
                    position: absolute;
                    width: 380px; height: 380px;
                    background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%);
                    top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                .hero-img {
                    max-height: 500px;
                    max-width: 100%;
                    object-fit: contain;
                    position: relative;
                    z-index: 2;
                    filter: drop-shadow(0 32px 64px rgba(99,102,241,0.25));
                }

                /* Stats bar */
                .stats-bar {
                    position: absolute;
                    bottom: 40px;
                    left: 60px;
                    display: flex;
                    gap: 40px;
                    z-index: 10;
                    animation: fadeUp 0.8s 0.4s ease both;
                }

                .stat-item {}

                .stat-number {
                    font-family: 'Syne', sans-serif;
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.5px;
                }

                .stat-label {
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.3);
                    font-weight: 300;
                    margin-top: 2px;
                    letter-spacing: 0.3px;
                }

                @media (max-width: 768px) {
                    .land-nav { padding: 20px 24px; }
                    .land-hero { flex-direction: column; padding: 48px 24px 120px; text-align: center; }
                    .hero-left { max-width: 100%; }
                    .hero-actions { justify-content: center; }
                    .hero-sub { margin-left: auto; margin-right: auto; }
                    .stats-bar { left: 50%; transform: translateX(-50%); gap: 24px; }
                    .hero-right { display: none; }
                }
            `}</style>

            <div className="landing-root">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />

                {/* Nav */}
                <nav className="land-nav">
                    <div className="land-logo">Vartal<span>ap</span></div>
                    <div className="land-nav-links">
                        <button className="nav-link" onClick={() => router("/fahfe93")}>Join as Guest</button>
                        <button className="nav-link" onClick={() => router("/auth")}>Register</button>
                        <button className="nav-btn" onClick={() => router("/auth")}>Login</button>
                    </div>
                </nav>

                {/* Hero */}
                <div className="land-hero">
                    <div className="hero-left">
                        <div className="hero-eyebrow">Live Video Calling</div>
                        <h1 className="hero-title">
                            <span className="accent">Connect</span> with<br />your loved ones
                        </h1>
                        <p className="hero-sub">
                            Bridge the distance with crystal-clear video calls. Vartalap brings people together — wherever they are.
                        </p>
                        <div className="hero-actions">
                            <Link className="cta-primary" to="/auth">Get Started →</Link>
                            <button className="cta-secondary" onClick={() => router("/fahfe93")}>
                                Join as Guest
                            </button>
                        </div>
                    </div>

                    <div className="hero-right">
                        <div className="hero-image-wrap">
                            <img className="hero-img" src="/mobile.png" alt="Vartalap app preview" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}