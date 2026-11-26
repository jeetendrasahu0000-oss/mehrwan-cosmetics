import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch, FiRefreshCw, FiX, FiUser, FiChevronDown,
  FiCheck, FiAlertCircle, FiUsers, FiMoreVertical,
  FiSlash, FiUnlock, FiShield,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const roleColor = (role = "") => {
  const k = role.toLowerCase();
  if (k === "admin") return "bg-violet-50 text-violet-700 ring-violet-200";
  return "bg-ink/5 text-ink/60 ring-ink/10";
};

const dotColor = (role = "") =>
  role?.toLowerCase() === "admin" ? "bg-violet-500" : "bg-ink/40";

/* ---------- inline role changer ---------- */
const RoleSelect = ({ value, onChange, saving, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const ROLES = ["User", "Admin"];

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => !saving && !disabled && setOpen((v) => !v)}
        disabled={saving || disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ring-1 transition disabled:cursor-not-allowed disabled:opacity-50 ${roleColor(
          value
        )} hover:brightness-95 active:scale-95`}
      >
        {saving ? (
          <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
        {value}
        <FiChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg shadow-ink/10"
        >
          {ROLES.map((r) => {
            const active = r === value;
            return (
              <button
                key={r}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setOpen(false);
                  if (r !== value) onChange(r);
                }}
                className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-[11px] transition ${
                  active ? "bg-ink/5 font-medium text-ink" : "text-ink/70 hover:bg-ink/5"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${dotColor(r)}`} />
                  {r}
                </span>
                {active && <FiCheck className="h-3 w-3 text-ink" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ---------- status pill ---------- */
const StatusPill = ({ isBlocked }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ring-1 ${
      isBlocked
        ? "bg-rose-50 text-rose-600 ring-rose-200"
        : "bg-emerald-50 text-emerald-700 ring-emerald-200"
    }`}
  >
    <span className={`h-1.5 w-1.5 rounded-full ${isBlocked ? "bg-rose-500" : "bg-emerald-500"}`} />
    {isBlocked ? "Blocked" : "Active"}
  </span>
);

/* ---------- row action menu ---------- */
const RowMenu = ({ user, onToggleBlock, busy }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => !busy && setOpen((v) => !v)}
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition active:scale-95 disabled:opacity-50 ${
          open ? "bg-ink/10 text-ink" : "text-ink/50 hover:bg-ink/5 hover:text-ink"
        }`}
      >
        {busy ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-ink/40 border-r-transparent" />
        ) : (
          <FiMoreVertical className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg shadow-ink/10"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onToggleBlock(user._id);
            }}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition ${
              user.isBlocked
                ? "text-emerald-700 hover:bg-emerald-50"
                : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            {user.isBlocked ? (
              <>
                <FiUnlock className="h-3.5 w-3.5" /> Unblock user
              </>
            ) : (
              <>
                <FiSlash className="h-3.5 w-3.5" /> Block user
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- avatar fallback ---------- */
const Avatar = ({ name, size = "md" }) => {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const dims = size === "sm" ? "h-9 w-9 text-[11px]" : "h-11 w-11 text-xs";
  return (
    <div
      className={`${dims} flex shrink-0 items-center justify-center rounded-full bg-ink/8 font-semibold text-ink/60`}
    >
      {initials}
    </div>
  );
};

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | active | blocked | admin
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await adminAPI.getAllUsers();
      setUsers(Array.isArray(r.data) ? r.data : []);
    } catch {
      setError("Could not load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const toggleBlock = async (id) => {
    setSavingId(id);
    try {
      await adminAPI.toggleBlockUser(id);
      setUsers((list) =>
        list.map((u) => (u._id === id ? { ...u, isBlocked: !u.isBlocked } : u))
      );
    } catch {
      setError("Failed to update customer status.");
      await load(true);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      const mq =
        !q ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q);
      const mf =
        filter === "all" ||
        (filter === "active" && !u.isBlocked) ||
        (filter === "blocked" && u.isBlocked) ||
        (filter === "admin" && u.role === "admin");
      return mq && mf;
    });
  }, [users, query, filter]);

  const countFor = (key) =>
    key === "all"
      ? users.length
      : key === "active"
      ? users.filter((u) => !u.isBlocked).length
      : key === "blocked"
      ? users.filter((u) => u.isBlocked).length
      : users.filter((u) => u.role === "admin").length;

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "blocked", label: "Blocked" },
    { key: "admin", label: "Admins" },
  ];

  return (
    <div className="space-y-3 pb-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-lg font-semibold text-ink sm:text-xl md:text-2xl">
            Customers
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50">
            {users.length} total · {filtered.length} showing
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Refresh customers"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/12 text-ink/60 transition hover:bg-ink/5 hover:text-ink active:scale-95"
        >
          <FiRefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ---------- Sticky search + filter ---------- */}
      <div className="sticky top-0 z-20 -mx-1 space-y-2 bg-white/90 px-1 py-2 backdrop-blur-md">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name or email…"
            className="w-full rounded-lg border border-ink/12 bg-white py-1.5 pl-8 pr-8 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
            >
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition active:scale-95 ${
                  active
                    ? "bg-ink text-white"
                    : "bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink"
                }`}
              >
                {f.label}
                <span className={`text-[10px] ${active ? "text-white/70" : "text-ink/40"}`}>
                  {countFor(f.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Error ---------- */}
      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-600 ring-1 ring-rose-100"
        >
          <FiAlertCircle className="h-3 w-3 shrink-0" /> {error}
        </p>
      )}

      {/* ---------- Loading ---------- */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[84px] animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center ring-1 ring-ink/8">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink/40">
            <FiUsers className="h-4 w-4" />
          </div>
          <p className="text-[13px] font-medium text-ink">No customers found</p>
          <p className="mt-1 text-[11px] text-ink/50">
            {query || filter !== "all"
              ? "Try a different search or filter."
              : "Customers will appear here after they sign up."}
          </p>
          {(query || filter !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="mt-3 text-[11px] font-medium text-ink underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ---------- Mobile cards ---------- */}
          <ul className="space-y-2 md:hidden">
            {filtered.map((u) => (
              <li
                key={u._id}
                className="rounded-xl bg-white p-2.5 ring-1 ring-ink/8 transition active:bg-ink/[0.015]"
              >
                {/* top: avatar + name/email + menu */}
                <div className="flex items-start gap-2.5">
                  <Avatar name={u.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-ink">
                          {u.name || "Unnamed"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-ink/50">
                          {u.email || "—"}
                        </p>
                      </div>
                      <RowMenu
                        user={u}
                        onToggleBlock={toggleBlock}
                        busy={savingId === u._id}
                      />
                    </div>

                    {/* meta: joined + role */}
                    <div className="mt-1.5 flex items-center gap-3 text-[11px]">
                      <span className="text-ink/55">
                        Joined {new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* bottom: status + role */}
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink/5 pt-2">
                  <StatusPill isBlocked={u.isBlocked} />
                  <RoleSelect
                    value={u.role === "admin" ? "Admin" : "User"}
                    onChange={() => {}}
                    saving={false}
                    disabled
                  />
                </div>
              </li>
            ))}
          </ul>

          {/* ---------- Desktop table ---------- */}
          <div className="hidden overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 md:block">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-left text-[11px] uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Email</th>
                  <th className="px-4 py-2.5 font-medium">Joined</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium">Role</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((u) => (
                  <tr key={u._id} className="transition hover:bg-ink/[0.015]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={u.name} size="sm" />
                        <span className="line-clamp-1 max-w-[160px] font-medium text-ink">
                          {u.name || "Unnamed"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="line-clamp-1 max-w-[220px] text-ink/60">
                        {u.email || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-ink/50">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill isBlocked={u.isBlocked} />
                    </td>
                    <td className="px-4 py-2.5">
                      <RoleSelect
                        value={u.role === "admin" ? "Admin" : "User"}
                        onChange={() => {}}
                        saving={false}
                        disabled
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end">
                        <RowMenu
                          user={u}
                          onToggleBlock={toggleBlock}
                          busy={savingId === u._id}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminCustomers;