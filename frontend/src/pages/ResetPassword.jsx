import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { authAPI } from "../services/authService";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [msg, setMsg] = useState(null); // { ok, text }
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  // Page chhodne par redirect timer saaf
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg(null);
    try {
      await authAPI.resetPassword(token, { password });
      setMsg({ ok: true, text: "Password reset successfully. Redirecting to sign in…" });
      timer.current = setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setMsg({
        ok: false,
        text: err.response?.data?.message || "Reset failed. The link may have expired.",
      });
      setLoading(false);
    }
  };

  const done = msg?.ok;

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-1 text-center font-serif text-2xl font-semibold text-ink md:text-3xl">
        Reset password
      </h1>
      <p className="mb-6 text-center text-sm text-ink/60">Choose a new password for your account</p>

      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            msg.ok ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
          }`}
        >
          {msg.text}
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium text-ink/70">
            New password
          </label>
          <div className="relative">
            {/* text-base mobile par: iPhone zoom nahi karta */}
            <input
              id="password"
              type={show ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              aria-describedby="password-hint"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field !py-2.5 !pr-10 text-base sm:text-sm"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              aria-pressed={show}
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/50 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              {show ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <p id="password-hint" className="mt-1 text-xs text-ink/50">
            At least 6 characters.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || done}
          className="btn-primary w-full !py-2.5 text-sm disabled:opacity-60"
        >
          {done ? "Password updated" : loading ? "Resetting…" : "Reset password"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        <Link to="/login" className="font-medium text-blush-700 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
};

export default ResetPassword;