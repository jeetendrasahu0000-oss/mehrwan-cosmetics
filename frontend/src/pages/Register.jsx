import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registerUser, clearError } from "../redux/slices/authSlice";

// Component ke bahar define: typing ke waqt input remount nahi hota
const Field = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink/70">
      {label}
    </label>
    {/* text-base mobile par: iPhone zoom nahi karta */}
    <input id={id} required className="input-field !py-2.5 text-base sm:text-sm" {...props} />
  </div>
);

const PasswordField = ({ label, id, hint, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-ink/70">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          className="input-field !py-2.5 !pr-10 text-base sm:text-sm"
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
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
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink/50">
          {hint}
        </p>
      )}
    </div>
  );
};

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);

  useEffect(() => {
    if (user) navigate("/");
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const submit = (e) => {
    e.preventDefault();
    if (loading) return;
    dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="mb-1 text-center font-serif text-2xl font-semibold text-ink md:text-3xl">
        Create account
      </h1>
      <p className="mb-6 text-center text-sm text-ink/60">Join the Mehrwan beauty community</p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="space-y-4">
        <Field
          label="Full name"
          id="name"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Field
          label="Email"
          id="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <PasswordField
          label="Password"
          id="password"
          autoComplete="new-password"
          minLength={6}
          hint="At least 6 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full !py-2.5 text-sm disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-blush-700 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;