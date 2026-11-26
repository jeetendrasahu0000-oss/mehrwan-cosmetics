import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCheck, FiTrash2, FiStar, FiMessageSquare,
  FiPackage, FiClock, FiAlertCircle,
  FiSearch, FiRefreshCw, FiX,
  FiMoreVertical, FiShield,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const formatDate = (date) => {
  if (!date) return "Recently";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

/* ---------- compact star row ---------- */
const Stars = ({ rating = 0, size = 12 }) => (
  <div className="flex items-center gap-0.5 text-amber-500">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={size}
        className={s <= Number(rating) ? "fill-current" : "text-ink/15"}
      />
    ))}
  </div>
);

/* ---------- 3-dot action menu ---------- */
const RowMenu = ({ review, onApprove, onDelete, busy }) => {
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
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition active:scale-95 disabled:opacity-50 ${
          open ? "bg-ink/10 text-ink" : "text-ink/50 hover:bg-ink/5 hover:text-ink"
        }`}
      >
        {busy ? (
          <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-ink/40 border-r-transparent" />
        ) : (
          <FiMoreVertical className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg shadow-ink/10"
        >
          {!review.isApproved && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onApprove(review._id);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-emerald-700 transition hover:bg-emerald-50"
            >
              <FiCheck className="h-3.5 w-3.5" /> Approve review
            </button>
          )}
          {review.isApproved && (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-ink/50">
              <FiShield className="h-3.5 w-3.5" /> Already approved
            </div>
          )}
          <div className="my-1 h-px bg-ink/8" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete(review._id);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 transition hover:bg-rose-50"
          >
            <FiTrash2 className="h-3.5 w-3.5" /> Delete review
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- compact review card ---------- */
const ReviewCard = ({ review, onApprove, onDelete, busy }) => {
  const approved = review.isApproved;
  return (
    <article className="overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 transition active:bg-ink/[0.015]">
      {/* top strip: avatar + name + rating + menu */}
      <div className="flex items-start gap-2 px-2.5 py-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-[11px] font-bold uppercase text-ink/60">
          {review.name?.charAt(0) || "U"}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="truncate text-[12px] font-semibold text-ink">
                {review.name || "Anonymous"}
              </p>
              <span
                className={`inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-medium ring-1 ${
                  approved
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
                }`}
              >
                <span
                  className={`h-1 w-1 rounded-full ${
                    approved ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {approved ? "Approved" : "Pending"}
              </span>
            </div>
            <RowMenu
              review={review}
              onApprove={onApprove}
              onDelete={onDelete}
              busy={busy}
            />
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <Stars rating={review.rating} />
            <span className="text-[10px] font-semibold text-ink/50">
              {review.rating}/5
            </span>
            <span className="text-[10px] text-ink/30">·</span>
            <span className="flex items-center gap-1 text-[10px] text-ink/45">
              <FiClock className="h-2.5 w-2.5" />
              {formatDate(review.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* body: comment + product */}
      <div className="space-y-1.5 px-2.5 pb-2">
        <p className="whitespace-pre-wrap break-words text-[11.5px] leading-relaxed text-ink/70 line-clamp-4">
          {review.comment || "No comment provided."}
        </p>

        <div className="inline-flex max-w-full items-center gap-1 rounded bg-ink/[0.04] px-1.5 py-0.5 text-[10px] text-ink/55">
          <FiPackage className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate max-w-[200px]">
            {review.product?.name || "Product unavailable"}
          </span>
        </div>
      </div>
    </article>
  );
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminAPI.getAllReviews();
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Could not load reviews.");
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

  const approve = async (id) => {
    setProcessing(id);
    try {
      await adminAPI.approveReview(id);
      setReviews((list) =>
        list.map((r) => (r._id === id ? { ...r, isApproved: true } : r))
      );
    } catch {
      setError("Failed to approve review.");
      await load(true);
    } finally {
      setProcessing(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    setProcessing(id);
    try {
      await adminAPI.deleteReview(id);
      setReviews((list) => list.filter((r) => r._id !== id));
    } catch {
      setError("Failed to delete review.");
      await load(true);
    } finally {
      setProcessing(null);
    }
  };

  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.length - approvedCount;
  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reviews.filter((r) => {
      const mq =
        !q ||
        r.name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q) ||
        r.product?.name?.toLowerCase().includes(q);
      const mf =
        filter === "all" ||
        (filter === "pending" && !r.isApproved) ||
        (filter === "approved" && r.isApproved);
      return mq && mf;
    });
  }, [reviews, query, filter]);

  const countFor = (key) =>
    key === "all" ? reviews.length : key === "pending" ? pendingCount : approvedCount;

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
  ];

  return (
    <div className="space-y-3 pb-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-lg font-semibold text-ink sm:text-xl md:text-2xl">
            Reviews
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50">
            {reviews.length} total · {pendingCount} pending · ★ {averageRating}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          aria-label="Refresh reviews"
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
            placeholder="Search name, comment or product…"
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[108px] animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-12 text-center ring-1 ring-ink/8">
          <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink/40">
            <FiMessageSquare className="h-4 w-4" />
          </div>
          <p className="text-[13px] font-medium text-ink">
            {query || filter !== "all" ? "No matching reviews" : "No reviews yet"}
          </p>
          <p className="mt-1 text-[11px] text-ink/50">
            {query || filter !== "all"
              ? "Try a different search or filter."
              : "Customer reviews will appear here when submitted."}
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
        <div className="space-y-2">
          {filtered.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              onApprove={approve}
              onDelete={remove}
              busy={processing === r._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;