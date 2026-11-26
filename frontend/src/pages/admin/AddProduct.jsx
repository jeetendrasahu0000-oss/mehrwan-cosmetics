import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUploadCloud, FiTrash2, FiStar, FiPlus, FiX,
  FiChevronDown, FiImage, FiPackage, FiTag, FiLayers,
  FiInfo, FiCheck, FiAlertCircle,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

/* ---------- Section wrapper (collapsible-friendly) ---------- */
const Section = ({ icon: Icon, title, hint, children, right }) => (
  <section className="rounded-xl bg-white ring-1 ring-ink/8">
    <header className="flex items-center justify-between gap-2 border-b border-ink/8 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink/5 text-ink/70">
          <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-semibold text-ink">{title}</h2>
          {hint && <p className="truncate text-[11px] text-ink/50">{hint}</p>}
        </div>
      </div>
      {right}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

/* ---------- Field ---------- */
const Field = ({ label, name, required, as = "input", options, className = "", ...props }) => {
  const common =
    "w-full rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm";
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-ink/60">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {as === "textarea" ? (
        <textarea id={name} name={name} required={required} className={common} {...props} />
      ) : as === "select" ? (
        <div className="relative">
          <select id={name} name={name} required={required} className={`${common} appearance-none pr-8`} {...props}>
            {options}
          </select>
          <FiChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
        </div>
      ) : (
        <input id={name} name={name} required={required} className={common} {...props} />
      )}
    </div>
  );
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", sku: "", brand: "", category: "",
    description: "", ingredients: "", benefits: "",
    skinType: "All", price: "", discountPrice: "", stock: "",
    images: [], variants: [], isFeatured: false,
  });

  useEffect(() => {
    adminAPI.getAllCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  /* ---------- Images ---------- */
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    const fd = new FormData();
    for (const f of files) fd.append("images", f);
    setUploading(true);
    try {
      const res = await adminAPI.uploadImages(fd);
      setForm((f) => ({ ...f, images: [...f.images, ...res.data.images] }));
    } catch {
      setError("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = ""; // allow re-selecting same file
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, imageUrlInput.trim()] }));
    setImageUrlInput("");
  };

  const removeImage = (i) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  const setPrimaryImage = (i) =>
    setForm((f) => {
      const arr = [...f.images];
      const [p] = arr.splice(i, 1);
      arr.unshift(p);
      return { ...f, images: arr };
    });

  /* ---------- Variants ---------- */
  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { name: "Size", value: "", priceAdjustment: 0 }],
    }));

  const updateVariant = (i, field, value) =>
    setForm((f) => {
      const v = [...f.variants];
      v[i][field] = value;
      return { ...f, variants: v };
    });

  const removeVariant = (i) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((_, idx) => idx !== i) }));

  /* ---------- Submit ---------- */
  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await adminAPI.createProduct({
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
      });
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl pb-28 md:pb-6">
      {/* ---------- Header ---------- */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-xl font-semibold text-ink sm:text-2xl md:text-3xl">
            Add product
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50 sm:text-sm">
            Fill in the details to add to your store
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-ink/15 px-2.5 py-1.5 text-xs font-medium text-ink/60 transition hover:border-ink/30 hover:text-ink sm:px-3 sm:py-2"
        >
          <FiX className="h-3.5 w-3.5" /> Cancel
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3 sm:space-y-4">
        {/* ---------- 1. Basic info ---------- */}
        <Section icon={FiInfo} title="Basic information" hint="Name, brand and category">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Product name" name="name" required value={form.name} onChange={change} placeholder="e.g. Hydra Glow Serum" />
            <Field label="SKU" name="sku" required value={form.sku} onChange={change} placeholder="MHR-SERUM-001" />
            <Field label="Brand" name="brand" required value={form.brand} onChange={change} placeholder="e.g. Plix" />
            <Field
              label="Category" name="category" required as="select"
              value={form.category} onChange={change}
              options={
                <>
                  <option value="">Select a category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </>
              }
            />
          </div>
        </Section>

        {/* ---------- 2. Pricing & stock ---------- */}
        <Section icon={FiTag} title="Pricing & stock" hint="Set price and inventory">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Price (₹)" name="price" required type="number" inputMode="numeric" value={form.price} onChange={change} placeholder="212" />
            <Field label="Discount (₹)" name="discountPrice" type="number" inputMode="numeric" value={form.discountPrice} onChange={change} placeholder="199" />
            <Field label="Stock qty" name="stock" required type="number" inputMode="numeric" value={form.stock} onChange={change} placeholder="50" />
            <Field
              label="Skin type" name="skinType" as="select"
              value={form.skinType} onChange={change}
              options={["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            />
          </div>
        </Section>

        {/* ---------- 3. Details ---------- */}
        <Section icon={FiLayers} title="Product details" hint="Description, ingredients & benefits">
          <div className="space-y-3">
            <Field label="Description" name="description" required as="textarea" rows={3} value={form.description} onChange={change} placeholder="Describe the product…" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ingredients" name="ingredients" as="textarea" rows={2} value={form.ingredients} onChange={change} placeholder="Vitamin C, Hyaluronic Acid…" />
              <Field label="Benefits" name="benefits" as="textarea" rows={2} value={form.benefits} onChange={change} placeholder="Brightens skin, 24h hydration…" />
            </div>
          </div>
        </Section>

        {/* ---------- 4. Variants ---------- */}
        <Section
          icon={FiPackage}
          title="Variants"
          hint="Optional — e.g. 50ml, 100ml"
          right={
            <button
              type="button"
              onClick={addVariant}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-ink/5 px-2.5 py-1.5 text-[11px] font-medium text-ink transition hover:bg-ink/10"
            >
              <FiPlus className="h-3.5 w-3.5" /> Add
            </button>
          }
        >
          {form.variants.length === 0 ? (
            <p className="py-3 text-center text-xs text-ink/40">
              No variants added. Click <span className="font-medium text-ink/60">Add</span> to create one.
            </p>
          ) : (
            <div className="space-y-2.5">
              {form.variants.map((v, i) => (
                <div key={i} className="rounded-lg border border-ink/10 bg-ink/[0.02] p-2.5">
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_110px_auto] sm:items-end">
                    <Field
                      label="Type" value={v.name}
                      onChange={(e) => updateVariant(i, "name", e.target.value)}
                      placeholder="Size"
                    />
                    <Field
                      label="Value" required value={v.value}
                      onChange={(e) => updateVariant(i, "value", e.target.value)}
                      placeholder="50ml"
                    />
                    <Field
                      label="Extra ₹" type="number" inputMode="numeric" value={v.priceAdjustment}
                      onChange={(e) => updateVariant(i, "priceAdjustment", Number(e.target.value))}
                      placeholder="0"
                    />
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      aria-label="Remove variant"
                      className="flex h-10 w-10 items-center justify-center self-end rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ---------- 5. Images ---------- */}
        <Section
          icon={FiImage}
          title="Images"
          hint="First image is the primary"
          right={
            form.images.length > 0 && (
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-medium text-ink/60">
                {form.images.length}
              </span>
            )
          }
        >
          {/* Image thumbs */}
          {form.images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {form.images.map((img, idx) => (
                <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10 bg-ink/5">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  {idx === 0 ? (
                    <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-ink px-1.5 py-0.5 text-[8px] font-bold text-white">
                      <FiStar className="h-2 w-2 fill-white" /> Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(idx)}
                      className="absolute inset-x-1 top-1 rounded bg-white/90 py-0.5 text-[9px] font-semibold text-ink opacity-0 shadow-sm transition group-hover:opacity-100"
                    >
                      Set primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 transition-transform hover:scale-110">
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload / URL */}
          <div className="grid gap-2 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-3 text-xs font-medium transition ${
                uploading
                  ? "cursor-wait border-ink/10 bg-ink/[0.02] text-ink/40"
                  : "border-ink/20 text-ink/70 hover:border-ink/40 hover:bg-ink/[0.02]"
              }`}
            >
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="sr-only"
                disabled={uploading}
              />
              <FiUploadCloud className="h-4 w-4" />
              {uploading ? "Uploading…" : "Upload images"}
            </label>

            <div className="flex gap-2">
              <input
                placeholder="Or paste image URL…"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm"
              />
              <button
                type="button"
                onClick={addImageUrl}
                disabled={!imageUrlInput.trim()}
                aria-label="Add image URL"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink text-white transition hover:bg-ink/90 disabled:opacity-40"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </Section>

        {/* ---------- Error ---------- */}
        {error && (
          <p role="alert" className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 ring-1 ring-red-100">
            <FiAlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </p>
        )}

        {/* ---------- Featured toggle + Desktop submit ---------- */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-ink/8">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="h-4 w-4 accent-ink"
            />
            Mark as featured
          </label>

          <button
            type="submit"
            disabled={uploading || saving}
            className="hidden rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50 md:inline-flex md:items-center md:gap-1.5"
          >
            {saving ? "Creating…" : <> <FiCheck className="h-4 w-4" /> Create product </>}
          </button>
        </div>
      </form>

      {/* ---------- Mobile sticky footer ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
        <button
          type="submit"
          onClick={submit}
          disabled={uploading || saving}
          className="w-full rounded-lg bg-ink py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Creating…" : uploading ? "Uploading…" : "Create product"}
        </button>
      </div>
    </div>
  );
};

export default AddProduct;