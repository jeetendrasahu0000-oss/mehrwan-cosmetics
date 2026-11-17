import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { authAPI } from "../services/authService";
import { logout } from "../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });
  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");

  const save = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateProfile(form);
      setMsg("Profile updated");
    } catch (err) {
      setMsg(err.response?.data?.message || "Update failed");
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(pwd);
      setPwd({ oldPassword: "", newPassword: "" });
      setMsg("Password changed");
    } catch (err) {
      setMsg(err.response?.data?.message || "Change failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="section-title font-semibold mb-8">My Profile</h1>
      {msg && <p className="text-sm bg-blush-50 rounded-lg px-3 py-2 mb-4">{msg}</p>}

      <form onSubmit={save} className="bg-white rounded-2xl p-6 mb-6 space-y-3">
        <h2 className="font-semibold">Personal Details</h2>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="input-field" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="input-field" />
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="input-field" />
        <button className="btn-primary">Save Changes</button>
      </form>

      <form onSubmit={changePwd} className="bg-white rounded-2xl p-6 mb-6 space-y-3">
        <h2 className="font-semibold">Change Password</h2>
        <input type="password" required value={pwd.oldPassword} onChange={(e) => setPwd({ ...pwd, oldPassword: e.target.value })} placeholder="Old password" className="input-field" />
        <input type="password" required minLength={6} value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} placeholder="New password" className="input-field" />
        <button className="btn-primary">Update Password</button>
      </form>

      <button
        onClick={() => { dispatch(logout()); navigate("/"); }}
        className="text-sm text-red-600 font-medium hover:underline"
      >
        Logout
      </button>
    </div>
  );
};

export default Profile;