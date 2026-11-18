import { useEffect, useState } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUploadCloud,
  FiGrid,
  FiTag,
  FiImage,
  FiX,
  FiFolder,
  FiArrowUpRight,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const INITIAL_FORM = {
  name: "",
  description: "",
  image: "",
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await adminAPI.getAllCategories();
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditing(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);

    try {
      const res = await adminAPI.uploadImages(formData);

      const baseUrl = (
        import.meta.env.VITE_API_URL || "http://localhost:5000/api"
      ).replace("/api", "");

      const imageUrl = baseUrl + res.data.images[0];

      setForm((prev) => ({
        ...prev,
        image: imageUrl,
      }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter category name.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
      };

      if (editing) {
        await adminAPI.updateCategory(editing, payload);
      } else {
        await adminAPI.createCategory(payload);
      }

      resetForm();
      await load();
    } catch (err) {
      console.error("Category save failed:", err);
      alert(
        err.response?.data?.message ||
          "Failed to save category. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete category permanently?")) return;

    try {
      setDeleting(id);
      await adminAPI.deleteCategory(id);
      await load();

      if (editing === id) {
        resetForm();
      }
    } catch (err) {
      console.error("Category deletion failed:", err);
      alert("Failed to delete category.");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
    });

    setEditing(category._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const inputClass =
    "w-full rounded-xl border border-[#e9e0d7] bg-[#fdfbf9] px-3.5 py-3 text-xs text-[#33251D] outline-none transition-all placeholder:text-[#b4a69b] focus:border-[#947761] focus:bg-white focus:ring-2 focus:ring-[#947761]/10";

  const labelClass =
    "mb-2 block text-[11px] font-semibold text-[#594638]";

  return (
    <div className="min-h-screen space-y-6 pb-10">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#a1816d]">
            <FiGrid size={13} />
            Store Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#33251D] sm:text-3xl">
            Categories
          </h1>

          <p className="mt-1.5 text-xs text-[#9b897c]">
            Organize your products into beautiful shopping collections.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-2xl border border-[#e9e0d7] bg-white px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5eee7] text-[#80644f]">
            <FiFolder size={19} />
          </div>

          <div>
            <p className="text-xl font-bold text-[#33251D]">
              {categories.length}
            </p>
            <p className="text-[10px] text-[#9b897c]">
              Total Categories
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e9e0d7] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#9b897c]">
              Total Categories
            </p>
            <FiGrid size={17} className="text-[#947761]" />
          </div>

          <h3 className="mt-3 text-2xl font-bold text-[#33251D]">
            {categories.length}
          </h3>

          <p className="mt-1 text-[10px] text-[#a99a8e]">
            All collections
          </p>
        </div>

        <div className="rounded-2xl border border-[#e9e0d7] bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#9b897c]">
              With Images
            </p>
            <FiImage size={17} className="text-green-600" />
          </div>

          <h3 className="mt-3 text-2xl font-bold text-[#33251D]">
            {categories.filter((c) => c.image).length}
          </h3>

          <p className="mt-1 text-[10px] text-green-600">
            Visual collections
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-[#e9e0d7] bg-white p-4 shadow-sm sm:col-span-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#9b897c]">
              Without Images
            </p>
            <FiTag size={17} className="text-[#947761]" />
          </div>

          <h3 className="mt-3 text-2xl font-bold text-[#33251D]">
            {categories.filter((c) => !c.image).length}
          </h3>

          <p className="mt-1 text-[10px] text-[#a99a8e]">
            Pending images
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">

        {/* Category List */}
        <section className="min-w-0">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#33251D]">
                All Categories
              </h2>

              <p className="mt-1 text-[11px] text-[#9b897c]">
                View and manage your product collections.
              </p>
            </div>

            <span className="rounded-full bg-[#f2e9df] px-3 py-1.5 text-[10px] font-semibold text-[#80644f]">
              {categories.length} Collections
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-[#e9e0d7] bg-white">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#e9e0d7] border-t-[#80644f]" />
            </div>
          ) : categories.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#d9c9ba] bg-white p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5eee7] text-[#947761]">
                <FiGrid size={27} />
              </div>

              <h3 className="text-base font-semibold text-[#33251D]">
                No Categories Yet
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-5 text-[#9b897c]">
                Create your first category to organize your store products.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#e9e0d7] bg-white shadow-sm">

              {/* Table Header */}
              <div className="hidden grid-cols-[minmax(0,1fr)_120px] items-center border-b border-[#eee5dc] bg-[#faf7f2] px-5 py-3 sm:grid">
                <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#9b897c]">
                  Category Details
                </p>

                <p className="text-right text-[9px] font-bold uppercase tracking-[0.15em] text-[#9b897c]">
                  Actions
                </p>
              </div>

              <div className="divide-y divide-[#eee5dc]">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="group flex items-center justify-between gap-3 p-4 transition-colors hover:bg-[#fdfbf9] sm:px-5"
                  >
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">

                      {/* Category Image */}
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#e9e0d7] bg-[#f5eee7] sm:h-16 sm:w-16">
                        {category.image ? (
                          <img
                            src={category.image}
                            alt={category.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[#b7a493]">
                            <FiImage size={21} />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="min-w-0">
                        <h3 className="truncate text-xs font-semibold text-[#33251D] sm:text-sm">
                          {category.name}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#9b897c] sm:text-[11px]">
                          {category.description || "No description added"}
                        </p>

                        <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#f5eee7] px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-[#947761]">
                          <FiTag size={9} />
                          Category
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        title="Edit Category"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f5ff] text-blue-600 transition-all hover:bg-blue-600 hover:text-white"
                      >
                        <FiEdit size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category._id)}
                        disabled={deleting === category._id}
                        title="Delete Category"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
                      >
                        {deleting === category._id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                        ) : (
                          <FiTrash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Add / Edit Form */}
        <aside className="xl:sticky xl:top-24">
          <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl border border-[#e9e0d7] bg-white shadow-sm"
          >

            {/* Form Header */}
            <div className="border-b border-[#e9e0d7] bg-[#f8f4ee] px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a1816d]">
                    Store Collection
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#33251D]">
                    {editing ? "Edit Category" : "Add Category"}
                  </h2>

                  <p className="mt-1 text-[10px] text-[#9b897c]">
                    {editing
                      ? "Update your category details."
                      : "Create a new product collection."}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#80644f] shadow-sm">
                  {editing ? (
                    <FiEdit size={19} />
                  ) : (
                    <FiPlus size={21} />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">

              {/* Name */}
              <div>
                <label className={labelClass}>
                  Category Name <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  placeholder="e.g. Skincare"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelClass}>
                  Description
                </label>

                <textarea
                  rows={3}
                  placeholder="Write a short category description..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Image Section */}
              <div className="border-t border-[#eee5dc] pt-4">
                <label className={labelClass}>
                  Category Image
                </label>

                {/* URL Input */}
                <div className="relative">
                  <FiImage
                    size={15}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#947761]"
                  />

                  <input
                    placeholder="Paste image URL..."
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>

                {/* Upload Divider */}
                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#eee5dc]" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-[#b4a69b]">
                    Or Upload Image
                  </span>
                  <div className="h-px flex-1 bg-[#eee5dc]" />
                </div>

                {/* Upload Box */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />

                  <div
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all ${
                      uploading
                        ? "border-[#d9c9ba] bg-[#faf7f2]"
                        : "border-[#d9c9ba] bg-[#fdfbf9] hover:border-[#947761] hover:bg-[#f8f4ee]"
                    }`}
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0e7dd] text-[#80644f]">
                      <FiUploadCloud size={20} />
                    </div>

                    <p className="text-[11px] font-semibold text-[#594638]">
                      {uploading
                        ? "Uploading Image..."
                        : "Click to upload image"}
                    </p>

                    <p className="mt-1 text-[9px] text-[#a99a8e]">
                      Select an image from your computer
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {form.image && (
                  <div className="mt-4 overflow-hidden rounded-xl border border-[#e9e0d7] bg-[#faf7f2]">
                    <div className="flex items-center justify-between px-3 py-2">
                      <span className="text-[10px] font-semibold text-[#594638]">
                        Image Preview
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            image: "",
                          }))
                        }
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                        title="Remove Image"
                      >
                        <FiX size={13} />
                      </button>
                    </div>

                    <div className="h-36 w-full bg-[#f0e7dd]">
                      <img
                        src={form.image}
                        alt="Category Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="border-t border-[#eee5dc] pt-4">
                <button
                  type="submit"
                  disabled={uploading || saving}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#33251D] px-4 py-3.5 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#594333] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    "Saving Category..."
                  ) : (
                    <>
                      <FiPlus size={16} />
                      {editing ? "Update Category" : "Create Category"}
                    </>
                  )}
                </button>

                {editing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-3 w-full rounded-xl border border-[#e9e0d7] py-3 text-xs font-semibold text-[#80644f] transition-colors hover:bg-[#faf7f2]"
                  >
                    Cancel Editing
                  </button>
                )}
              </div>
            </div>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default AdminCategories;