import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiSearch, FiRefreshCw, FiX, FiShoppingBag,
  FiUser, FiChevronDown, FiAlertCircle, FiCheck,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const STATUSES = [
  "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled",
];

const statusColor = (s = "") => {
  const k = s.toLowerCase();
  if (k === "delivered") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (k === "shipped") return "bg-sky-50 text-sky-700 ring-sky-200";
  if (k === "processing" || k === "confirmed") return "bg-violet-50 text-violet-700 ring-violet-200";
  if (k === "pending") return "bg-amber-50 text-amber-700 ring-amber-200";
  if (k === "cancelled") return "bg-rose-50 text-rose-600 ring-rose-200";
  return "bg-ink/5 text-ink/60 ring-ink/10";
};

const dotColor = (s) =>
  s === "Delivered" ? "bg-emerald-500"
  : s === "Cancelled" ? "bg-rose-500"
  : s === "Pending" ? "bg-amber-500"
  : s === "Shipped" ? "bg-sky-500"
  : "bg-violet-500";

/* ---------- inline status changer (compact) ---------- */
const StatusSelect = ({ value, onChange, saving }) => {
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
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => !saving && setOpen((v) => !v)}
        disabled={saving}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium ring-1 transition disabled:opacity-60 ${statusColor(
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
          className="absolute right-0 top-full z-30 mt-1 w-36 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg shadow-ink/10"
        >
          {STATUSES.map((s) => {
            const active = s === value;
            return (
              <button
                key={s}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setOpen(false);
                  if (s !== value) onChange(s);
                }}
                className={`flex w-full items-center justify-between gap-2 px-2.5 py-1.5 text-left text-[11px] transition ${
                  active ? "bg-ink/5 font-medium text-ink" : "text-ink/70 hover:bg-ink/5"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${dotColor(s)}`} />
                  {s}
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

/* ---------- payment badge ---------- */
const PaymentBadge = ({ method, paid }) => (
  <span
    className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
      paid ? "bg-emerald-50 text-emerald-700" : "bg-ink/5 text-ink/55"
    }`}
  >
    {method}
  </span>
);

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await adminAPI.getAllOrders();
      setOrders(Array.isArray(r.data) ? r.data : []);
    } catch {
      setError("Could not load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const update = async (id, status) => {
    setSavingId(id);
    try {
      await adminAPI.updateOrderStatus(id, status);
      setOrders((list) =>
        list.map((o) => (o._id === id ? { ...o, orderStatus: status } : o))
      );
    } catch {
      setError("Failed to update order status.");
      await load(true);
    } finally {
      setSavingId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const shortId = o._id.slice(-6).toLowerCase();
      const mq =
        !q ||
        shortId.includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q);
      const mf = filter === "all" || o.orderStatus === filter;
      return mq && mf;
    });
  }, [orders, query, filter]);

  const countFor = (status) =>
    status === "all" ? orders.length : orders.filter((o) => o.orderStatus === status).length;

  const FILTERS = [
    { key: "all", label: "All" },
    ...STATUSES.filter((s) => countFor(s) > 0).map((s) => ({ key: s, label: s })),
  ];

  return (
    <div className="space-y-3 pb-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-lg font-semibold text-ink sm:text-xl md:text-2xl">
            Orders
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50">
            {orders.length} total · {filtered.length} showing
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Refresh orders"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/12 text-ink/60 transition hover:bg-ink/5 hover:text-ink active:scale-95"
        >
          <FiRefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ---------- Sticky search + filter ---------- */}
      <div className="sticky top-0 z-20 -mx-1 space-y-2 bg-canvas/90 px-1 py-2 backdrop-blur-md">
        {/* search */}
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, name or email…"
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

        {/* filter chips — horizontal scroll */}
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count = countFor(f.key);
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
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Error ---------- */}
      {error && (
        <p role="alert" className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-600 ring-1 ring-rose-100">
          <FiAlertCircle className="h-3 w-3 shrink-0" /> {error}
        </p>
      )}

      {/* ---------- Loading ---------- */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[88px] animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center ring-1 ring-ink/8">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink/40">
            <FiShoppingBag className="h-4 w-4" />
          </div>
          <p className="text-[13px] font-medium text-ink">No orders found</p>
          <p className="mt-1 text-[11px] text-ink/50">
            {query || filter !== "all"
              ? "Try a different search or filter."
              : "Orders will appear here as customers shop."}
          </p>
          {(query || filter !== "all") && (
            <button
              onClick={() => { setQuery(""); setFilter("all"); }}
              className="mt-3 text-[11px] font-medium text-ink underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ---------- Mobile cards (compact) ---------- */}
          <ul className="space-y-2 md:hidden">
            {filtered.map((o) => (
              <li
                key={o._id}
                className="rounded-xl bg-white p-2.5 ring-1 ring-ink/8 transition active:bg-ink/[0.015]"
              >
                {/* top row: id + total */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="font-mono text-[12px] font-semibold tracking-tight text-ink">
                      #{o._id.slice(-6).toUpperCase()}
                    </p>
                    <PaymentBadge method={o.paymentMethod} paid={o.isPaid} />
                  </div>
                  <p className="shrink-0 text-[13px] font-semibold text-ink">
                    {inr(o.totalPrice)}
                  </p>
                </div>

                {/* middle: customer + items */}
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px]">
                  <div className="flex min-w-0 items-center gap-1 text-ink/65">
                    <FiUser className="h-3 w-3 shrink-0 text-ink/40" />
                    <span className="truncate">{o.user?.name || "Guest"}</span>
                  </div>
                  <span className="shrink-0 text-ink/45">
                    {o.orderItems?.length || 0} item{(o.orderItems?.length || 0) !== 1 ? "s" : ""}
                  </span>
                </div>
                {o.user?.email && (
                  <p className="mt-0.5 truncate text-[10px] text-ink/40">{o.user.email}</p>
                )}

                {/* bottom: status */}
                <div className="mt-2 flex items-center justify-between gap-2 border-t border-ink/5 pt-2">
                  <span className="text-[9px] font-medium uppercase tracking-wider text-ink/40">
                    Status
                  </span>
                  <StatusSelect
                    value={o.orderStatus}
                    onChange={(s) => update(o._id, s)}
                    saving={savingId === o._id}
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
                  <th className="px-4 py-2.5 font-medium">Order</th>
                  <th className="px-4 py-2.5 font-medium">Customer</th>
                  <th className="px-4 py-2.5 font-medium">Items</th>
                  <th className="px-4 py-2.5 font-medium">Total</th>
                  <th className="px-4 py-2.5 font-medium">Payment</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((o) => (
                  <tr key={o._id} className="transition hover:bg-ink/[0.015]">
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-[12px] font-semibold text-ink">
                        #{o._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="line-clamp-1 max-w-[180px] font-medium text-ink">
                        {o.user?.name || "Guest"}
                      </p>
                      <p className="line-clamp-1 max-w-[180px] text-[11px] text-ink/45">
                        {o.user?.email || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-ink/60">{o.orderItems?.length || 0}</td>
                    <td className="px-4 py-2.5 font-medium">{inr(o.totalPrice)}</td>
                    <td className="px-4 py-2.5">
                      <PaymentBadge method={o.paymentMethod} paid={o.isPaid} />
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusSelect
                        value={o.orderStatus}
                        onChange={(s) => update(o._id, s)}
                        saving={savingId === o._id}
                      />
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

export default AdminOrders;