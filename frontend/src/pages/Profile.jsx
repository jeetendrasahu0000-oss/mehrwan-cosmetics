import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiLogOut,
  FiSave,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

import { authAPI } from "../services/authService";
import { logout } from "../redux/slices/authSlice";

const Profile = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [pwd, setPwd] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileMsg, setProfileMsg] = useState({
    text: "",
    type: "",
  });

  const [passwordMsg, setPasswordMsg] = useState({
    text: "",
    type: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const save = async (e) => {
    e.preventDefault();

    setProfileLoading(true);
    setProfileMsg({ text: "", type: "" });

    try {
      await authAPI.updateProfile(form);

      setProfileMsg({
        text: "Your profile has been updated successfully.",
        type: "success",
      });
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || "Profile update failed.",
        type: "error",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();

    setPasswordLoading(true);
    setPasswordMsg({ text: "", type: "" });

    try {
      await authAPI.changePassword(pwd);

      setPwd({
        oldPassword: "",
        newPassword: "",
      });

      setPasswordMsg({
        text: "Your password has been changed successfully.",
        type: "success",
      });
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || "Password change failed.",
        type: "error",
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  const Message = ({ message }) => {
    if (!message.text) return null;

    const success = message.type === "success";

    return (
      <div
        className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${
          success
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-600"
        }`}
      >
        {success ? (
          <FiCheckCircle className="mt-0.5 shrink-0" />
        ) : (
          <FiAlertCircle className="mt-0.5 shrink-0" />
        )}

        {message.text}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-4xl">


        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-sm"
        >
          <div className="h-24 bg-[#e9dfd2] sm:h-28" />

          <div className="flex flex-col gap-4 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:px-8">
            <div className="-mt-11 flex items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-[#33251D] font-serif text-3xl font-semibold text-white shadow-sm">
                {initial}
              </div>

              <div className="min-w-0 pb-1 pt-10 sm:pt-9">
                <h2 className="truncate text-lg font-semibold text-[#33251D]">
                  {user?.name || "Customer"}
                </h2>

                <p className="truncate text-xs text-ink/50">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-[#f5efe6] px-4 py-2 text-xs font-medium text-[#33251D] sm:mb-1">
              <FiShield size={15} />
              Account Settings
            </div>
          </div>
        </motion.div>

        {/* PERSONAL DETAILS */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={save}
          className="mb-6 rounded-2xl border border-ink/5 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-ink/5 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5efe6] text-[#33251D]">
              <FiUser size={20} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#33251D]">
                Personal Details
              </h2>

              <p className="mt-0.5 text-xs text-ink/45">
                Update your personal information.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">

            {/* NAME */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-ink/70">
                Full Name
              </label>

              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-ink/10 bg-[#faf9f6] py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-[#33251D]/40 focus:bg-white"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-ink/70">
                Email Address
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />

                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-ink/10 bg-[#faf9f6] py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-[#33251D]/40 focus:bg-white"
                />
              </div>
            </div>

            {/* PHONE */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold text-ink/70">
                Phone Number
              </label>

              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  placeholder="Enter your phone number"
                  className="w-full rounded-xl border border-ink/10 bg-[#faf9f6] py-3 pl-11 pr-4 text-sm text-ink outline-none transition focus:border-[#33251D]/40 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <Message message={profileMsg} />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={profileLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#33251D] px-7 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50 sm:w-auto"
            >
              <FiSave size={16} />
              {profileLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </motion.form>

        {/* CHANGE PASSWORD */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={changePwd}
          className="mb-6 rounded-2xl border border-ink/5 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3 border-b border-ink/5 pb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f5efe6] text-[#33251D]">
              <FiLock size={20} />
            </div>

            <div>
              <h2 className="font-serif text-xl font-semibold text-[#33251D]">
                Change Password
              </h2>

              <p className="mt-0.5 text-xs text-ink/45">
                Keep your account safe with a strong password.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-ink/70">
                Current Password
              </label>

              <input
                type="password"
                required
                autoComplete="current-password"
                value={pwd.oldPassword}
                onChange={(e) =>
                  setPwd({ ...pwd, oldPassword: e.target.value })
                }
                placeholder="Enter current password"
                className="w-full rounded-xl border border-ink/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-[#33251D]/40 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-ink/70">
                New Password
              </label>

              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={pwd.newPassword}
                onChange={(e) =>
                  setPwd({ ...pwd, newPassword: e.target.value })
                }
                placeholder="Enter new password (minimum 6 characters)"
                className="w-full rounded-xl border border-ink/10 bg-[#faf9f6] px-4 py-3 text-sm outline-none transition focus:border-[#33251D]/40 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-5">
            <Message message={passwordMsg} />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#33251D] px-7 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:opacity-50 sm:w-auto"
            >
              <FiLock size={15} />
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </motion.form>

        {/* LOGOUT */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-100 bg-white p-5 sm:flex-row sm:items-center sm:px-8"
        >
          <div>
            <h3 className="text-sm font-semibold text-ink">
              Logout from your account
            </h3>

            <p className="mt-1 text-xs text-ink/45">
              You can sign in again anytime.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-6 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 sm:w-auto"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </motion.div>

      </div>
    </div>
  );
};

export default Profile;