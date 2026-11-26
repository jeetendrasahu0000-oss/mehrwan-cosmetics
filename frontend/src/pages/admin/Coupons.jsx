import { useEffect, useMemo, useState } from "react";
import {
  FiPlus, FiTrash2, FiTag, FiCalendar, FiPercent,
  FiShoppingBag, FiClock, FiGift, FiCheckCircle,
  FiSearch, FiRefreshCw, FiX, FiAlertCircle,
  FiChevronDown,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const INITIAL_FORM = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
};

const isExpired = (date) => {
  if (!date) return false;
  const expiry = new Date(date);
  expiry.setHours(23, 59, 59, 999);
  return expiry < new Date();
};

const formatDate = (date) => {
  if (!date) return "No expiry";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const statusColor = (expired) =>
  expired
    ? "bg-rose-50 text-rose-600 ring-rose-200"
    : "bg-emerald-50 text-emerald-700 ring-emerald-200";

/* ---------- compact coupon card ---------- */
const CouponCard = ({ coupon, onDelete, deleting }) => {
  const expired = isExpired(coupon.expiryDate);
  const off =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}%`
      : `₹${coupon.discountValue}`;

  return (
    <article className="overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 transition active:bg-ink/[0.015]">
      {/* top strip */}
      <div className="flex items-center justify-between gap-2 bg-ink/[0.03] px-2.5 py-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <FiTag className="h-3.5 w-3.5 shrink-0 text-ink/40" />
          <span className="truncate font-mono text-[13px] font-bold tracking-wider text-ink">
            {coupon.code}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="rounded-md bg-ink px-2 py-1 text-[11px] font-bold text-white">
            {off} OFF
          </span>
        </div>
      </div>

      {/* body */}
      <div className="px-2.5 py-2">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-1 text-ink/60">
            <FiShoppingBag className="h-3 w-3 shrink-0 text-ink/40" />
            Min ₹{Number(coupon.minOrderAmount || 0).toLocaleString("en-IN")}
          </div>
          <div className="flex items-center justify-end gap-1 text-ink/60">
            <FiCalendar className="h-3 w-3 shrink-0 text-ink/40" />
            {formatDate(coupon.expiryDate)}
          </div>
        </div>

        {coupon.maxDiscount > 0 && (
          <p className="mt-1 text-[10px] text-ink/45">
            Max discount ₹{Number(coupon.maxDiscount).toLocaleString("en-IN")}
          </p>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center justify-between gap-2 border-t border-ink/5 px-2.5 py-2">
        <span
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium ring-1 ${statusColor(
            expired
          )}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              expired ? "bg-rose-500" : "bg-emerald-500"
            }`}
          />
          {expired ? "Expired" : "Active"}
        </span>

        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(coupon._id)}
          className="flex h-7 items-center gap-1 rounded-md bg-rose-50 px-2 text-[10px] font-medium text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-100 active:scale-95 disabled:opacity-50"
        >
          {deleting ? (
            <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-rose-500 border-r-transparent" />
          ) : (
            <FiTrash2 className="h-3 w-3" />
          )}
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </article>
  );
};

/* ---------- coupon form (shared desktop + mobile sheet) ---------- */
const CouponForm = ({ form, updateField, submit, saving, onClose, showClose }) => {
  const preview = form.code && form.discountValue;
  return (
    <form onSubmit={submit} className="overflow-hidden rounded-xl bg-white ring-1 ring-ink/8">
      <div className="flex items-center justify-between border-b border-ink/5 bg-ink/[0.03] px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink/60 ring-1 ring-ink/8">
            <FiPlus className="h-3.5 w-3.5" />
          </div>
          <h2 className="text-[13px] font-semibold text-ink">Create coupon</h2>
        </div>
        {showClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close form"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/50 hover:bg-ink/5 hover:text-ink"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-2.5 p-3">
        {/* code */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink/60">
            Coupon code <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FiTag className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            <input
              required
              placeholder="e.g. WELCOME20"
              value={form.code}
              onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              className="w-full rounded-lg border border-ink/12 bg-white py-1.5 pl-8 pr-2.5 font-mono text-[13px] font-semibold uppercase tracking-wider text-ink placeholder:font-sans placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>
        </div>

        {/* type + value */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink/60">Type</label>
            <select
              value={form.discountType}
              onChange={(e) => updateField("discountType", e.target.value)}
              className="w-full cursor-pointer rounded-lg border border-ink/12 bg-white py-1.5 pl-2.5 pr-6 text-[12px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            >
              <option value="percentage">Percent (%)</option>
              <option value="fixed">Fixed (₹)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink/60">
              Value <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              {form.discountType === "percentage" ? (
                <FiPercent className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
              ) : (
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-ink/40">₹</span>
              )}
              <input
                type="number"
                min="0.01"
                max={form.discountType === "percentage" ? "100" : undefined}
                step="any"
                required
                placeholder="0"
                value={form.discountValue}
                onChange={(e) => updateField("discountValue", e.target.value)}
                className="w-full rounded-lg border border-ink/12 bg-white py-1.5 pl-8 pr-2.5 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
              />
            </div>
          </div>
        </div>

        {/* min + max */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink/60">Min order</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={form.minOrderAmount}
              onChange={(e) => updateField("minOrderAmount", e.target.value)}
              className="w-full rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium text-ink/60">
              Max discount
            </label>
            <input
              type="number"
              min="0"
              placeholder="Optional"
              value={form.maxDiscount}
              onChange={(e) => updateField("maxDiscount", e.target.value)}
              className="w-full rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>
        </div>

        {/* expiry */}
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink/60">
            Expiry date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <FiCalendar className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/40" />
            <input
              type="date"
              required
              min={new Date().toLocaleDateString("en-CA")}
              value={form.expiryDate}
              onChange={(e) => updateField("expiryDate", e.target.value)}
              className="w-full rounded-lg border border-ink/12 bg-white py-1.5 pl-8 pr-2.5 text-[13px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
            />
          </div>
        </div>

        {/* preview */}
        {preview && (
          <div className="rounded-lg border border-dashed border-ink/15 bg-ink/[0.02] px-2.5 py-2">
            <p className="text-[9px] font-bold uppercase tracking-wider text-ink/40">
              Preview
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="truncate font-mono text-[12px] font-bold tracking-wider text-ink">
                {form.code}
              </span>
              <span className="shrink-0 rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                {form.discountType === "percentage"
                  ? `${form.discountValue}% OFF`
                  : `₹${form.discountValue} OFF`}
              </span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-ink py-2 text-[12px] font-medium text-white transition hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white border-r-transparent" />
              Creating…
            </>
          ) : (
            <>
              <FiPlus className="h-3.5 w-3.5" /> Create coupon
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminAPI.getCoupons();
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Could not load coupons.");
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

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (Number(form.discountValue) <= 0) {
      setError("Please enter a valid discount value.");
      return;
    }
    if (form.discountType === "percentage" && Number(form.discountValue) > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await adminAPI.createCoupon({
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
      });
      setForm(INITIAL_FORM);
      setSheetOpen(false);
      await load(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      setDeleting(id);
      await adminAPI.deleteCoupon(id);
      setCoupons((list) => list.filter((c) => c._id !== id));
    } catch {
      setError("Failed to delete coupon.");
      await load(true);
    } finally {
      setDeleting(null);
    }
  };

  const activeCount = coupons.filter((c) => !isExpired(c.expiryDate)).length;
  const expiredCount = coupons.length - activeCount;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coupons.filter((c) => {
      const mq = !q || c.code?.toLowerCase().includes(q);
      const expired = isExpired(c.expiryDate);
      const mf =
        filter === "all" ||
        (filter === "active" && !expired) ||
        (filter === "expired" && expired);
      return mq && mf;
    });
  }, [coupons, query, filter]);

  const countFor = (key) =>
    key === "all" ? coupons.length : key === "active" ? activeCount : expiredCount;

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div className="space-y-3 pb-24 md:pb-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-lg font-semibold text-ink sm:text-xl md:text-2xl">
            Coupons
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50">
            {coupons.length} total · {activeCount} active · {expiredCount} expired
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/12 text-ink/60 transition hover:bg-ink/5 hover:text-ink active:scale-95"
          >
            <FiRefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="hidden h-8 items-center gap-1 rounded-lg bg-ink px-2.5 text-[11px] font-medium text-white transition hover:bg-ink/90 active:scale-95 md:flex"
          >
            <FiPlus className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      {/* ---------- Sticky search + filter ---------- */}
      <div className="sticky top-0 z-20 -mx-1 space-y-2 bg-white/90 px-1 py-2 backdrop-blur-md">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search coupon code…"
            className="w-full rounded-lg border border-ink/12 bg-white py-1.5 pl-8 pr-8 font-mono text-[13px] uppercase tracking-wide text-ink placeholder:font-sans placeholder:normal-case placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
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
        <p role="alert" className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-600 ring-1 ring-rose-100">
          <FiAlertCircle className="h-3 w-3 shrink-0" /> {error}
        </p>
      )}

      {/* ---------- Layout: list + form ---------- */}
      <div className="grid items-start gap-3 xl:grid-cols-[1fr_320px]">
        {/* List */}
        <section className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[140px] animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-white py-12 text-center ring-1 ring-ink/8">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink/40">
                <FiGift className="h-4 w-4" />
              </div>
              <p className="text-[13px] font-medium text-ink">
                {query || filter !== "all" ? "No matching coupons" : "No coupons yet"}
              </p>
              <p className="mt-1 text-[11px] text-ink/50">
                {query || filter !== "all"
                  ? "Try a different code or filter."
                  : "Create your first coupon to get started."}
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
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {filtered.map((c) => (
                <CouponCard
                  key={c._id}
                  coupon={c}
                  onDelete={remove}
                  deleting={deleting === c._id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Desktop form (aside) */}
        <aside className="hidden xl:block xl:sticky xl:top-4">
          <CouponForm
            form={form}
            updateField={updateField}
            submit={submit}
            saving={saving}
            showClose={false}
          />
        </aside>
      </div>

      {/* ---------- Mobile: floating action button ---------- */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label="Create coupon"
        className="fixed bottom-5 right-4 z-30 flex h-12 items-center gap-1.5 rounded-full bg-ink px-4 text-white shadow-lg shadow-ink/20 transition hover:bg-ink/90 active:scale-95 md:hidden"
      >
        <FiPlus className="h-4 w-4" />
        <span className="text-[12px] font-medium">New coupon</span>
      </button>

      {/* ---------- Mobile: bottom sheet ---------- */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setSheetOpen(false)}
          />
          {/* sheet */}
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex justify-center bg-white pt-2 pb-1">
              <div className="h-1 w-10 rounded-full bg-ink/15" />
            </div>
            <div className="px-2 pb-4">
              <CouponForm
                form={form}
                updateField={updateField}
                submit={submit}
                saving={saving}
                onClose={() => setSheetOpen(false)}
                showClose
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;