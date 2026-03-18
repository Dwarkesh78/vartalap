import * as React from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Authentication() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const navigate = useNavigate();
  const { handleLogin, handleRegister } = React.useContext(AuthContext);

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => setOpen(false), 4000);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formState === 0) {
        let result = await handleLogin(username, password);
        setMessage(result || "Welcome back!");
        setOpen(true);
        navigate("/home");
      }
      if (formState === 1) {
        let result = await handleRegister(name, username, password);
        setMessage(result || "Account created!");
        setOpen(true);
        setError("");
        setFormState(0);
        setPassword("");
        setUsername("");
        setName("");
      }
      setError("");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #0a0a0f;
          color: #fff;
          overflow: hidden;
          position: relative;
        }

        /* LEFT PANEL — decorative */
        .auth-left {
          flex: 1.2;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 56px;
          overflow: hidden;
        }

        .auth-left-bg {
          position: absolute;
          inset: 0;
          background-image: url(/background.png);
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .auth-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(10,10,15,0.55) 0%,
            rgba(99,102,241,0.25) 50%,
            rgba(10,10,15,0.8) 100%
          );
          z-index: 1;
        }

        .auth-left-content {
          position: relative;
          z-index: 2;
        }

        .auth-left-logo {
          font-family: 'Syne', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #fff;
          margin-bottom: 32px;
        }

        .auth-left-logo span { color: #818cf8; }

        .auth-left-quote {
          font-size: 2rem;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.8px;
          color: #fff;
          margin-bottom: 16px;
          max-width: 400px;
        }

        .auth-left-quote .accent {
          background: linear-gradient(135deg, #818cf8, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-left-sub {
          color: rgba(255,255,255,0.45);
          font-size: 0.9rem;
          font-weight: 300;
          line-height: 1.7;
          max-width: 340px;
        }

        /* Blob decorations on left */
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
        }

        .auth-blob-1 {
          width: 400px; height: 400px;
          background: rgba(99,102,241,0.2);
          top: -80px; right: -80px;
        }

        .auth-blob-2 {
          width: 300px; height: 300px;
          background: rgba(236,72,153,0.12);
          bottom: 80px; left: -60px;
        }

        /* RIGHT PANEL — form */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          background: #0d0d15;
          border-left: 1px solid rgba(255,255,255,0.05);
          position: relative;
        }

        .auth-right::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
        }

        .auth-form-wrap {
          width: 100%;
          max-width: 380px;
          position: relative;
          z-index: 2;
          animation: fadeUp 0.6s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .auth-form-title {
          font-family: 'Syne', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          color: #fff;
          margin-bottom: 6px;
        }

        .auth-form-sub {
          color: rgba(255,255,255,0.3);
          font-size: 0.875rem;
          font-weight: 300;
          margin-bottom: 32px;
        }

        /* Tab switcher */
        .auth-tabs {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 28px;
          gap: 4px;
        }

        .auth-tab {
          flex: 1;
          background: none;
          border: none;
          color: rgba(255,255,255,0.4);
          font-family: 'Syne', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 10px;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          letter-spacing: 0.2px;
        }

        .auth-tab.active {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.35);
        }

        .auth-tab:not(.active):hover {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.06);
        }

        /* Fields */
        .auth-field {
          margin-bottom: 14px;
        }

        .auth-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .auth-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 11px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          padding: 13px 16px;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }

        .auth-input::placeholder { color: rgba(255,255,255,0.18); }

        .auth-input:focus {
          border-color: rgba(99,102,241,0.55);
          background: rgba(99,102,241,0.05);
        }

        /* Error */
        .auth-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 9px;
          color: #f87171;
          font-size: 0.82rem;
          padding: 10px 14px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        /* Submit */
        .auth-submit {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          border: none;
          border-radius: 11px;
          padding: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 6px;
          transition: transform 0.15s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 0 30px rgba(99,102,241,0.3);
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
        }

        .auth-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 0 50px rgba(99,102,241,0.45);
        }

        .auth-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-submit .spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin-right: 8px;
          vertical-align: middle;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Toast */
        .auth-toast {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: rgba(30,30,45,0.95);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 12px;
          padding: 12px 24px;
          color: #a5b4fc;
          font-size: 0.875rem;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          z-index: 100;
          backdrop-filter: blur(12px);
          animation: toastIn 0.3s ease;
          white-space: nowrap;
        }

        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 768px) {
          .auth-left { display: none; }
          .auth-right { flex: 1; }
        }
      `}</style>

      <div className="auth-root">

        {/* Left decorative panel */}
        <div className="auth-left">
          <div className="auth-left-bg" />
          <div className="auth-left-overlay" />
          <div className="auth-blob auth-blob-1" />
          <div className="auth-blob auth-blob-2" />

          <div className="auth-left-content">
            <div className="auth-left-logo">Vartal<span>ap</span></div>
            <div className="auth-left-quote">
              <span className="accent">Connect</span> with<br />your loved ones
            </div>
            <p className="auth-left-sub">
              Bridge the distance with crystal-clear video calls. Start for free — no setup needed.
            </p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-right">
          <div className="auth-form-wrap">

            <div className="auth-form-title">
              {formState === 0 ? "Welcome back" : "Create account"}
            </div>
            <div className="auth-form-sub">
              {formState === 0
                ? "Sign in to continue to Vartalap"
                : "Join Vartalap and start connecting"}
            </div>

            {/* Tab switcher */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${formState === 0 ? "active" : ""}`}
                onClick={() => { setFormState(0); setError(""); }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${formState === 1 ? "active" : ""}`}
                onClick={() => { setFormState(1); setError(""); }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuth}>
              {formState === 1 && (
                <div className="auth-field">
                  <label className="auth-label">Full Name</label>
                  <input
                    className="auth-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="auth-field">
                <label className="auth-label">Username</label>
                <input
                  className="auth-input"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="auth-field">
                <label className="auth-label">Password</label>
                <input
                  className="auth-input"
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="auth-error">
                  <span>⚠</span> {error}
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading
                  ? "Please wait..."
                  : formState === 0 ? "Sign In →" : "Create Account →"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {open && (
        <div className="auth-toast">
          ✓ {message}
        </div>
      )}
    </>
  );
}