import { Outlet } from "react-router-dom";

// Auth shell — full-viewport, no sidebar, no nav, no dock. In the web track,
// auth still centers: the official .container.container--auth gives a narrow
// (--auth-max) centered column with symmetric gutters. One shape serves login,
// change password, reset password, and first-run setup.
export function AuthShell() {
  return (
    <div className="auth-shell">
      <div className="container container--auth">
        <div className="auth-shell__brand">
          <span className="brand-mark">A</span>
          <span>AhamVoice · 录音转写</span>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
