import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiSearch,
  FiRefreshCw, FiFilter, FiImage, FiX, FiFolder,
  FiTag, FiUploadCloud, FiCheck,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const INITIAL_FORM = { name: "", description: "", image: "" };

/* ---------- Row action menu (3 dots) ---------- */
const RowMenu = ({ category, onEdit, onDelete, deleting }) => {
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
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          open ? "bg-ink/10 text-ink" : "text-ink/50 hover:bg-ink/5 hover:text-ink"
        }`}
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg shadow-ink/5"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onEdit(category);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink/80 transition hover:bg-ink/5"
          >
            <FiEdit className="h-3.5 w-3.5" /> Edit category
          </button>
          <div className="my-1 h-px bg-ink/8" />
          <button
            type="button"
            role="menuitem"
            disabled={deleting}
            onClick={() => {
              setOpen(false);
              onDelete(category._id);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
            ) : (
              <FiTrash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- Image thumb ---------- */
const Thumb = ({ src, name, size = "md" }) => {
  const dims = size === "lg" ? "h-16 w-16" : "h-12 w-12";
  return (
    <div className={`${dims} shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-ink/5`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-ink/30">
          <FiImage className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

/* ---------- Modal ---------- */
const Modal = ({ open, onClose, children, labelledBy }) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* panel: bottom sheet on mobile, centered on sm+ */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="relative w-full max-w-md overflow-hidden rounded-t-2xl bg-white shadow-xl ring-1 ring-ink/10 sm:rounded-2xl"
      >
        {children}
      </div>
    </div>
  );
};

/* ---------- Category Form (inside modal) ---------- */
const CategoryForm = ({ editing, initial, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initial || INITIAL_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial || INITIAL_FORM);
  }, [initial]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("images", file);
    setUploading(true);
    try {
      const res = await adminAPI.uploadImages(fd);
      const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
      setForm((p) => ({ ...p, image: baseUrl + res.data.images[0] }));
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {/* Header */}
      <header className="flex items-start justify-between gap-3 border-b border-ink/8 px-4 py-3.5">
        <div className="min-w-0">
          <h2 id="cat-form-title" className="text-base font-semibold text-ink">
            {editing ? "Edit category" : "Add category"}
          </h2>
          <p className="mt-0.5 text-[11px] text-ink/50">
            {editing ? "Update the details below" : "Create a new product collection"}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink/50 transition hover:bg-ink/5 hover:text-ink"
        >
          <FiX className="h-4 w-4" />
        </button>
      </header>

      {/* Body */}
      <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4 sm:max-h-[60vh]">
        <div>
          <label htmlFor="cat-name" className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink/60">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="cat-name"
            required
            autoFocus
            placeholder="e.g. Skincare"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="cat-desc" className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink/60">
            Description
          </label>
          <textarea
            id="cat-desc"
            rows={2}
            placeholder="Short description…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full resize-none rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink/60">
            Image
          </label>

          <div className="relative">
            <FiImage className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink/35" />
            <input
              placeholder="Paste image URL…"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="w-full rounded-lg border border-ink/15 bg-white py-2.5 pl-9 pr-3 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm"
            />
          </div>

          <label
            className={`mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-2.5 text-xs font-medium transition ${
              uploading
                ? "cursor-wait border-ink/10 bg-ink/[0.02] text-ink/40"
                : "border-ink/20 text-ink/70 hover:border-ink/40 hover:bg-ink/[0.02]"
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="sr-only"
            />
            <FiUploadCloud className="h-4 w-4" />
            {uploading ? "Uploading…" : "Upload image"}
          </label>

          {form.image && (
            <div className="mt-2.5 flex items-center gap-2.5 rounded-lg border border-ink/10 bg-ink/[0.02] p-2">
              <Thumb src={form.image} name="preview" />
              <p className="min-w-0 flex-1 truncate text-[11px] text-ink/60">
                {form.image}
              </p>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, image: "" }))}
                aria-label="Remove image"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-500 hover:text-white"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex gap-2 border-t border-ink/8 px-4 py-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-ink/15 py-2.5 text-sm font-medium text-ink/70 transition hover:bg-ink/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading || saving || !form.name.trim()}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50"
        >
          {saving ? (
            "Saving…"
          ) : (
            <>
              <FiCheck className="h-4 w-4" />
              {editing ? "Update" : "Create"}
            </>
          )}
        </button>
      </footer>
    </form>
  );
};

/* ---------- Main page ---------- */
const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // category id or null
  const [initialForm, setInitialForm] = useState(INITIAL_FORM);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await adminAPI.getAllCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* noop */
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

  const openAdd = () => {
    setEditing(null);
    setInitialForm(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setInitialForm({
      name: c.name || "",
      description: c.description || "",
      image: c.image || "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setInitialForm(INITIAL_FORM);
  };

  const handleSubmit = async (payload) => {
    try {
      if (editing) await adminAPI.updateCategory(editing, payload);
      else await adminAPI.createCategory(payload);
      closeModal();
      await load(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save category.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete category permanently?")) return;
    try {
      setDeleting(id);
      await adminAPI.deleteCategory(id);
      await load(true);
    } catch {
      alert("Failed to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  /* ---- filter ---- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories.filter((c) => {
      const mq = !q || c.name?.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q);
      const mf =
        filter === "all" ||
        (filter === "with" && c.image) ||
        (filter === "without" && !c.image);
      return mq && mf;
    });
  }, [categories, query, filter]);

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "with", label: "With image" },
    { key: "without", label: "No image" },
  ];

  const withImage = categories.filter((c) => c.image).length;

  return (
    <div className="space-y-4">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-xl font-semibold text-ink sm:text-2xl md:text-3xl">
            Categories
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50 sm:text-sm">
            {categories.length} total · {filtered.length} showing
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-white transition hover:bg-ink/90 sm:text-sm"
        >
          <FiPlus className="h-4 w-4" /> Add category
        </button>
      </div>

      {/* ---------- Search + filters ---------- */}
      <div className="rounded-xl bg-white p-2.5 ring-1 ring-ink/8 sm:p-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search categories…"
              className="w-full rounded-lg border border-ink/12 bg-white py-2 pl-9 pr-8 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh list"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink/12 text-ink/60 transition hover:bg-ink/5 hover:text-ink"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="-mx-0.5 mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            const count =
              f.key === "with" ? withImage : f.key === "without" ? categories.length - withImage : categories.length;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? "bg-ink text-white"
                    : "bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink"
                }`}
              >
                {f.key !== "all" && <FiFilter className="h-2.5 w-2.5" />}
                {f.label} <span className={active ? "text-white/70" : "text-ink/40"}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- List ---------- */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-14 text-center ring-1 ring-ink/8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink/40">
            <FiFolder className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-ink">No categories found</p>
          <p className="mt-1 text-xs text-ink/50">
            {query || filter !== "all"
              ? "Try a different search or filter."
              : "Create your first category to get started."}
          </p>
          {(query || filter !== "all") ? (
            <button
              onClick={() => { setQuery(""); setFilter("all"); }}
              className="mt-4 text-xs font-medium text-ink underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-white hover:bg-ink/90"
            >
              <FiPlus className="h-3.5 w-3.5" /> Add category
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 md:hidden">
            {filtered.map((c) => (
              <li key={c._id} className="rounded-xl bg-white p-3 ring-1 ring-ink/8">
                <div className="flex items-start gap-3">
                  <Thumb src={c.image} name={c.name} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-1 text-[13px] font-medium text-ink">{c.name}</p>
                        <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-ink/50">
                          {c.description || "No description added"}
                        </p>
                      </div>
                      <RowMenu
                        category={c}
                        onEdit={openEdit}
                        onDelete={handleDelete}
                        deleting={deleting === c._id}
                      />
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-1.5 py-0.5 text-[9px] font-medium text-ink/60">
                        <FiTag className="h-2.5 w-2.5" /> Category
                      </span>
                      {c.image ? (
                        <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[9px] font-medium text-green-700">
                          Has image
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-50 px-1.5 py-0.5 text-[9px] font-medium text-yellow-700">
                          No image
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 md:block">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-left text-[11px] uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Category</th>
                  <th className="px-4 py-2.5 font-medium">Description</th>
                  <th className="px-4 py-2.5 font-medium">Image</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((c) => (
                  <tr key={c._id} className="transition hover:bg-ink/[0.015]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Thumb src={c.image} name={c.name} />
                        <span className="line-clamp-1 max-w-[200px] font-medium text-ink">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="line-clamp-1 max-w-[320px] text-ink/60">
                        {c.description || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {c.image ? (
                        <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-700">
                          Yes
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-medium text-yellow-700">
                          None
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end">
                        <RowMenu
                          category={c}
                          onEdit={openEdit}
                          onDelete={handleDelete}
                          deleting={deleting === c._id}
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

      {/* ---------- Modal ---------- */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        labelledBy="cat-form-title"
      >
        <CategoryForm
          editing={editing}
          initial={initialForm}
          onSubmit={handleSubmit}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
};

export default AdminCategories;