import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiPlus, FiTrash2, FiEdit, FiUploadCloud, FiImage,
  FiVideo, FiExternalLink, FiX, FiLayers,
  FiSearch, FiRefreshCw, FiAlertCircle,
  FiMoreVertical, FiCheck,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const INITIAL_FORM = {
  title: "", subtitle: "", image: "", videoUrl: "", link: "", type: "hero",
};

const TYPE_STYLES = {
  hero: "bg-ink text-white",
  promotional: "bg-amber-50 text-amber-700 ring-amber-200",
  collection: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  instagram: "bg-rose-50 text-rose-600 ring-rose-200",
  announcement: "bg-yellow-50 text-yellow-700 ring-yellow-200",
  video: "bg-sky-50 text-sky-700 ring-sky-200",
};

const typeColor = (type) =>
  TYPE_STYLES[type] || "bg-ink/5 text-ink/60 ring-ink/10";

/* ---------- 3-dot action menu ---------- */
const RowMenu = ({ banner, onEdit, onDelete, busy }) => {
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
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/90 backdrop-blur-sm transition active:scale-95 disabled:opacity-50 ${
          open ? "bg-white text-ink shadow-md" : "text-ink/70 hover:bg-white hover:text-ink"
        }`}
      >
        {busy ? (
          <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-ink/50 border-r-transparent" />
        ) : (
          <FiMoreVertical className="h-4 w-4" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg shadow-ink/15"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onEdit(banner); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink/80 transition hover:bg-ink/5"
          >
            <FiEdit className="h-3.5 w-3.5" /> Edit banner
          </button>
          <div className="my-1 h-px bg-ink/8" />
          <button
            type="button"
            role="menuitem"
            onClick={() => { setOpen(false); onDelete(banner._id); }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 transition hover:bg-rose-50"
          >
            <FiTrash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- compact banner card ---------- */
const BannerCard = ({ banner, onEdit, onDelete, busy }) => (
  <article className="overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 transition active:bg-ink/[0.015]">
    {/* image with overlay actions */}
    <div className="relative aspect-video bg-ink/5">
      <img
        src={banner.image}
        alt={banner.title || "Banner"}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      {/* type pill top-left */}
      <span
        className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ring-1 ${typeColor(
          banner.type
        )}`}
      >
        {banner.type}
      </span>

      {/* 3-dot menu top-right */}
      <div className="absolute right-2 top-2">
        <RowMenu banner={banner} onEdit={onEdit} onDelete={onDelete} busy={busy} />
      </div>

      {/* video badge bottom-left */}
      {banner.videoUrl && (
        <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
          <FiVideo className="h-2.5 w-2.5" /> Video
        </span>
      )}
    </div>

    {/* body */}
    <div className="px-2.5 py-2">
      <p className="truncate text-[12px] font-semibold text-ink">
        {banner.title || "Untitled Banner"}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-relaxed text-ink/55">
        {banner.subtitle || "No subtitle"}
      </p>

      {banner.link && (
        <div className="mt-1.5 inline-flex max-w-full items-center gap-1 rounded bg-ink/[0.04] px-1.5 py-0.5 text-[10px] text-ink/55">
          <FiExternalLink className="h-2.5 w-2.5 shrink-0" />
          <span className="truncate max-w-[180px]">{banner.link}</span>
        </div>
      )}
    </div>
  </article>
);

/* ---------- shared form (desktop aside + mobile sheet) ---------- */
const BannerForm = ({ form, updateField, submit, saving, uploading, editingId, resetForm, onClose, showClose, onImageUpload }) => (
  <form onSubmit={submit} className="overflow-hidden rounded-xl bg-white ring-1 ring-ink/8">
    <div className="flex items-center justify-between border-b border-ink/5 bg-ink/[0.03] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink/60 ring-1 ring-ink/8">
          {editingId ? <FiEdit className="h-3.5 w-3.5" /> : <FiPlus className="h-3.5 w-3.5" />}
        </div>
        <h2 className="text-[13px] font-semibold text-ink">
          {editingId ? "Edit banner" : "New banner"}
        </h2>
      </div>
      {showClose && (
        <button type="button" onClick={onClose} aria-label="Close"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-ink/50 hover:bg-ink/5 hover:text-ink">
          <FiX className="h-4 w-4" />
        </button>
      )}
    </div>

    <div className="space-y-2.5 p-3">
      {/* title */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-ink/60">
          Title <span className="text-rose-500">*</span>
        </label>
        <input
          required
          placeholder="Banner title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          className="w-full rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
        />
      </div>

      {/* subtitle */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-ink/60">Subtitle</label>
        <input
          placeholder="Short description"
          value={form.subtitle}
          onChange={(e) => updateField("subtitle", e.target.value)}
          className="w-full rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
        />
      </div>

      {/* image upload */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-ink/60">
          Image <span className="text-rose-500">*</span>
        </label>
        <input
          required={!form.image}
          placeholder="Image URL"
          value={form.image}
          onChange={(e) => updateField("image", e.target.value)}
          className="mb-2 w-full rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
        />

        <div className="relative">
          <input
            type="file" accept="image/*" onChange={onImageUpload}
            disabled={uploading}
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
          <div className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-3 py-3 text-center transition ${
            uploading ? "border-ink/20 bg-ink/5" : "border-ink/15 bg-ink/[0.02] hover:border-ink/30 hover:bg-ink/5"
          }`}>
            <FiUploadCloud className="mb-1 h-4 w-4 text-ink/40" />
            <p className="text-[11px] font-medium text-ink/60">
              {uploading ? "Uploading…" : "Tap to upload"}
            </p>
          </div>
        </div>

        {form.image && (
          <div className="relative mt-2 overflow-hidden rounded-lg ring-1 ring-ink/8">
            <div className="aspect-video">
              <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => updateField("image", "")}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-rose-500 shadow-md transition hover:bg-rose-500 hover:text-white"
            >
              <FiX className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {/* video + link — 2 cols */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink/60">Video URL</label>
          <input
            placeholder="Optional"
            value={form.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            className="w-full rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[12px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-ink/60">Link</label>
          <input
            placeholder="/products"
            value={form.link}
            onChange={(e) => updateField("link", e.target.value)}
            className="w-full rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[12px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
          />
        </div>
      </div>

      {/* type */}
      <div>
        <label className="mb-1 block text-[11px] font-medium text-ink/60">Type</label>
        <select
          value={form.type}
          onChange={(e) => updateField("type", e.target.value)}
          className="w-full cursor-pointer rounded-lg border border-ink/12 bg-white py-1.5 px-2.5 text-[12px] text-ink outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
        >
          <option value="hero">Hero</option>
          <option value="promotional">Promotional</option>
          <option value="collection">Collection</option>
          <option value="instagram">Instagram</option>
          <option value="announcement">Announcement</option>
          <option value="video">Video</option>
        </select>
      </div>

      {/* actions */}
      <div className="flex gap-2 border-t border-ink/5 pt-2.5">
        <button
          type="submit"
          disabled={saving || uploading}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink py-2 text-[12px] font-medium text-white transition hover:bg-ink/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <><span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-white border-r-transparent" /> Saving…</>
          ) : editingId ? (
            <><FiCheck className="h-3.5 w-3.5" /> Update</>
          ) : (
            <><FiPlus className="h-3.5 w-3.5" /> Create</>
          )}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={resetForm}
            className="flex items-center justify-center gap-1 rounded-lg border border-ink/15 px-3 text-[11px] font-medium text-ink/60 transition hover:bg-ink/5"
          >
            <FiX className="h-3 w-3" /> Cancel
          </button>
        )}
      </div>
    </div>
  </form>
);

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminAPI.getAllBanners();
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError("Could not load banners.");
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

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      e.target.value = "";
      return;
    }
    const formData = new FormData();
    formData.append("images", file);
    setUploading(true);
    setError("");
    try {
      const res = await adminAPI.uploadImages(formData);
      const imageUrl = res.data.images?.[0];
      if (!imageUrl) throw new Error("No URL returned");
      setForm((prev) => ({ ...prev, image: imageUrl }));
    } catch (err) {
      setError(err.response?.data?.message || "Image upload failed.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.image.trim()) {
      setError("Please upload an image or enter a URL.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await adminAPI.updateBanner(editingId, form);
      } else {
        await adminAPI.createBanner(form);
      }
      setForm(INITIAL_FORM);
      setEditingId(null);
      setSheetOpen(false);
      await load(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner) => {
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      videoUrl: banner.videoUrl || "",
      link: banner.link || "",
      type: banner.type || "hero",
    });
    setEditingId(banner._id);
    setSheetOpen(true);
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    setProcessing(id);
    try {
      await adminAPI.deleteBanner(id);
      setBanners((list) => list.filter((b) => b._id !== id));
    } catch {
      setError("Failed to delete banner.");
      await load(true);
    } finally {
      setProcessing(null);
    }
  };

  const updateField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return banners.filter((b) => {
      const mq = !q || b.title?.toLowerCase().includes(q) || b.subtitle?.toLowerCase().includes(q);
      const mf = filter === "all" || b.type === filter;
      return mq && mf;
    });
  }, [banners, query, filter]);

  const TYPES = ["hero", "promotional", "collection", "instagram", "announcement", "video"];
  const FILTERS = [
    { key: "all", label: "All" },
    ...TYPES.filter((t) => banners.some((b) => b.type === t)).map((t) => ({ key: t, label: t })),
  ];

  const countFor = (key) =>
    key === "all" ? banners.length : banners.filter((b) => b.type === key).length;

  return (
    <div className="space-y-3 pb-24 md:pb-6">
      {/* header */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-lg font-semibold text-ink sm:text-xl md:text-2xl">Banners</h1>
          <p className="mt-0.5 text-[11px] text-ink/50">
            {banners.length} total · {filtered.length} showing
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={handleRefresh} aria-label="Refresh"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-ink/12 text-ink/60 transition hover:bg-ink/5 hover:text-ink active:scale-95">
            <FiRefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button type="button" onClick={() => { resetForm(); setSheetOpen(true); }}
            className="hidden h-8 items-center gap-1 rounded-lg bg-ink px-2.5 text-[11px] font-medium text-white transition hover:bg-ink/90 active:scale-95 md:flex">
            <FiPlus className="h-3.5 w-3.5" /> New
          </button>
        </div>
      </div>

      {/* sticky search + filter */}
      <div className="sticky top-0 z-20 -mx-1 space-y-2 bg-white/90 px-1 py-2 backdrop-blur-md">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
          <input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title or subtitle…"
            className="w-full rounded-lg border border-ink/12 bg-white py-1.5 pl-8 pr-8 text-[13px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10" />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear"
              className="absolute right-1.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink">
              <FiX className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition active:scale-95 ${
                  active ? "bg-ink text-white" : "bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink"
                }`}>
                {f.label}
                <span className={`text-[10px] ${active ? "text-white/70" : "text-ink/40"}`}>
                  {countFor(f.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* error */}
      {error && (
        <p role="alert" className="flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1.5 text-[11px] text-rose-600 ring-1 ring-rose-100">
          <FiAlertCircle className="h-3 w-3 shrink-0" /> {error}
        </p>
      )}

      {/* layout */}
      <div className="grid items-start gap-3 xl:grid-cols-[1fr_320px]">
        <section className="min-w-0">
          {loading ? (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[180px] animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl bg-white py-12 text-center ring-1 ring-ink/8">
              <div className="mx-auto mb-2.5 flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 text-ink/40">
                <FiImage className="h-4 w-4" />
              </div>
              <p className="text-[13px] font-medium text-ink">
                {query || filter !== "all" ? "No matching banners" : "No banners yet"}
              </p>
              <p className="mt-1 text-[11px] text-ink/50">
                {query || filter !== "all" ? "Try a different search or filter." : "Create your first banner to get started."}
              </p>
              {(query || filter !== "all") && (
                <button onClick={() => { setQuery(""); setFilter("all"); }}
                  className="mt-3 text-[11px] font-medium text-ink underline-offset-2 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {filtered.map((b) => (
                <BannerCard key={b._id} banner={b} onEdit={handleEdit} onDelete={remove} busy={processing === b._id} />
              ))}
            </div>
          )}
        </section>

        {/* desktop form */}
        <aside className="hidden xl:block xl:sticky xl:top-4">
          <BannerForm
            form={form} updateField={updateField} submit={submit}
            saving={saving} uploading={uploading} editingId={editingId}
            resetForm={resetForm} showClose={false} onImageUpload={handleImageUpload}
          />
        </aside>
      </div>

      {/* mobile FAB */}
      <button type="button" onClick={() => { resetForm(); setSheetOpen(true); }}
        className="fixed bottom-5 right-4 z-30 flex h-12 items-center gap-1.5 rounded-full bg-ink px-4 text-white shadow-lg shadow-ink/20 transition hover:bg-ink/90 active:scale-95 md:hidden">
        <FiPlus className="h-4 w-4" />
        <span className="text-[12px] font-medium">New banner</span>
      </button>

      {/* mobile bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex justify-center bg-white pt-2 pb-1">
              <div className="h-1 w-10 rounded-full bg-ink/15" />
            </div>
            <div className="px-2 pb-4">
              <BannerForm
                form={form} updateField={updateField} submit={submit}
                saving={saving} uploading={uploading} editingId={editingId}
                resetForm={resetForm} onClose={() => setSheetOpen(false)}
                showClose onImageUpload={handleImageUpload}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;