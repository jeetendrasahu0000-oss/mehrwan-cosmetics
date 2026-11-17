import { useState } from "react";
import { Link } from "react-router-dom";
import { authAPI } from "../services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await authAPI.forgotPassword({ email });
      setMsg("If an account exists, a reset link has been sent to your email.");
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="font-serif text-3xl font-semibold text-center mb-2">Forgot Password</h1>
      <p className="text-sm text-ink/50 text-center mb-8">We'll email you a reset link</p>
      {msg && <p className="text-sm bg-blush-50 rounded-lg px-3 py-2 mb-4 text-ink/70">{msg}</p>}
      <form onSubmit={submit} className="space-y-4">
        <input type="email" required placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
        <button className="btn-primary w-full">Send Reset Link</button>
      </form>
      <p className="text-sm text-center mt-6"><Link to="/login" className="text-blush-700 hover:underline">← Back to login</Link></p>
    </div>
  );
};

export default ForgotPassword;