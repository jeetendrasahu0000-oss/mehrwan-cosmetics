import { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiUploadCloud,
  FiImage,
  FiVideo,
  FiExternalLink,
  FiX,
  FiLayers,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const INITIAL_FORM = {
  title: "",
  subtitle: "",
  image: "",
  videoUrl: "",
  link: "",
  type: "hero",
};

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await adminAPI.getAllBanners();
      setBanners(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Banner fetch failed:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      e.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);

    try {
      const res = await adminAPI.uploadImages(formData);
      const imageUrl = res.data.images?.[0];

      if (!imageUrl) {
        throw new Error("Cloudinary image URL not received.");
      }

      setForm((prev) => ({
        ...prev,
        image: imageUrl,
      }));

      alert("Image uploaded successfully!");
    } catch (err) {
      console.error(
        "Cloudinary Upload Failed:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
        "Image upload failed. Please try again."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.image.trim()) {
      alert("Please upload a banner image or enter an image URL.");
      return;
    }

    setSaving(true);

    try {
      if (editingId) {
        await adminAPI.updateBanner(editingId, form);
        alert("Banner updated successfully!");
      } else {
        await adminAPI.createBanner(form);
        alert("Banner created successfully!");
      }

      setForm(INITIAL_FORM);
      setEditingId(null);
      await load();
    } catch (err) {
      console.error("Banner save failed:", err);

      alert(
        err.response?.data?.message ||
        "Failed to save banner. Please try again."
      );
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      await adminAPI.deleteBanner(id);
      await load();
      alert("Banner deleted successfully!");
    } catch (err) {
      console.error("Banner delete failed:", err);
      alert("Failed to delete banner.");
    }
  };

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const getTypeStyle = (type) => {
    const styles = {
      hero: "bg-[#33251D] text-white",
      promotional: "bg-[#f4e3d5] text-[#895b43]",
      collection: "bg-[#e8eee5] text-[#526b4e]",
      instagram: "bg-[#f4e6ed] text-[#a34e72]",
      announcement: "bg-[#f8efd7] text-[#95702b]",
      video: "bg-[#e7eafa] text-[#5363a0]",
    };

    return styles[type] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen space-y-7 pb-10">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#a1816d]">
            <FiLayers size={13} />
            Store Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#33251D] sm:text-3xl">
            Banners & Videos
          </h1>

          <p className="mt-1.5 text-xs text-[#9b897c] sm:text-sm">
            Manage your homepage banners, promotional images and videos.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-xl border border-[#33251D]/10 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5efe6] text-[#8b705e]">
            <FiImage size={19} />
          </div>

          <div>
            <p className="text-xl font-bold text-[#33251D]">
              {banners.length}
            </p>
            <p className="text-[10px] text-[#9b897c]">
              Total Banners
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">

        {/* Banner Collection */}
        <section className="min-w-0">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#33251D]">
                Your Banners
              </h2>
              <p className="mt-1 text-[11px] text-[#9b897c]">
                All your uploaded promotional content
              </p>
            </div>

            <span className="rounded-full bg-[#f0e8df] px-3 py-1.5 text-[10px] font-semibold text-[#795e4c]">
              {banners.length} Items
            </span>
          </div>

          {banners.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#33251D]/15 bg-white p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5efe6] text-[#947761]">
                <FiImage size={27} />
              </div>

              <h3 className="text-base font-semibold text-[#33251D]">
                No banners yet
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-5 text-[#9b897c]">
                Start by adding your first banner or promotional image using
                the form.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {banners.map((banner) => (
                <article
                  key={banner._id}
                  className="group overflow-hidden rounded-2xl border border-[#33251D]/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#f5efe6]">
                    <img
                      src={banner.image}
                      alt={banner.title || "Banner"}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider shadow-sm ${getTypeStyle(
                        banner.type
                      )}`}
                    >
                      {banner.type}
                    </span>

                    {banner.videoUrl && (
                      <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-medium text-white backdrop-blur-md">
                        <FiVideo size={12} />
                        Video Available
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <div className="mb-4 min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#33251D]">
                        {banner.title || "Untitled Banner"}
                      </h3>

                      <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-[#9b897c]">
                        {banner.subtitle || "No subtitle added"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#33251D]/10 pt-3">
                      <div className="flex min-w-0 items-center gap-1.5 text-[10px] text-[#9b897c]">
                        {banner.link ? (
                          <>
                            <FiExternalLink size={12} />
                            <span className="max-w-[130px] truncate">
                              {banner.link}
                            </span>
                          </>
                        ) : (
                          "No redirect link"
                        )}
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(banner)}
                          title="Edit Banner"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f1f4fa] text-[#5875a5] transition-colors hover:bg-[#5875a5] hover:text-white"
                        >
                          <FiEdit size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => remove(banner._id)}
                          title="Delete Banner"
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff0ef] text-[#cf625a] transition-colors hover:bg-[#cf625a] hover:text-white"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

            </div>
          )}
        </section>

        {/* Add / Edit Form */}
        <aside className="xl:sticky xl:top-24">
          <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl border border-[#33251D]/10 bg-white shadow-sm"
          >
            {/* Form Header */}
            <div className="border-b border-[#33251D]/10 bg-[#f8f4ee] px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a1816d]">
                    Banner Management
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#33251D]">
                    {editingId ? "Edit Banner" : "Create New Banner"}
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#80644f] shadow-sm">
                  {editingId ? <FiEdit size={18} /> : <FiPlus size={20} />}
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">

              {/* Title */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Banner Title <span className="text-red-500">*</span>
                </label>

                <input
                  required
                  placeholder="Enter banner title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Subtitle
                </label>

                <input
                  placeholder="Enter a short description"
                  value={form.subtitle}
                  onChange={(e) => updateField("subtitle", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-[#5c493b]">
                  Banner Image <span className="text-red-500">*</span>
                </label>

                <input
                  required={!form.image}
                  placeholder="Paste image URL here..."
                  value={form.image}
                  onChange={(e) => updateField("image", e.target.value)}
                  className="input-field mb-3"
                />

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                  />

                  <div
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
                      uploading
                        ? "border-gray-300 bg-gray-50"
                        : "border-[#cbb8a7] bg-[#faf7f2] hover:border-[#80644f] hover:bg-[#f5efe6]"
                    }`}
                  >
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#80644f] shadow-sm">
                      <FiUploadCloud size={20} />
                    </div>

                    <p className="text-xs font-semibold text-[#5c493b]">
                      {uploading
                        ? "Uploading image..."
                        : "Click to upload image"}
                    </p>

                    <p className="mt-1 text-[10px] text-[#9b897c]">
                      Upload directly to Cloudinary
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {form.image && (
                  <div className="relative mt-3 overflow-hidden rounded-xl border border-[#33251D]/10 bg-[#f5efe6]">
                    <div className="aspect-[16/8]">
                      <img
                        src={form.image}
                        alt="Banner Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="absolute bottom-2 left-2 rounded-full bg-black/50 px-2.5 py-1 text-[9px] font-medium text-white backdrop-blur-sm">
                      Image Preview
                    </div>

                    <button
                      type="button"
                      onClick={() => updateField("image", "")}
                      title="Remove image"
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-md transition-colors hover:bg-red-500 hover:text-white"
                    >
                      <FiX size={15} />
                    </button>
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Video URL <span className="font-normal text-[#9b897c]">(Optional)</span>
                </label>

                <input
                  placeholder="Paste video URL"
                  value={form.videoUrl}
                  onChange={(e) => updateField("videoUrl", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Redirect Link */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Redirect Link
                </label>

                <input
                  placeholder="/products or external URL"
                  value={form.link}
                  onChange={(e) => updateField("link", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Banner Type */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Banner Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="hero">Hero (Main Homepage)</option>
                  <option value="promotional">Promotional (Offers)</option>
                  <option value="collection">Collection</option>
                  <option value="instagram">Instagram Gallery</option>
                  <option value="announcement">Announcement Bar</option>
                  <option value="video">Video Reels</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-[#33251D]/10 pt-4">
                <button
                  disabled={uploading || saving}
                  type="submit"
                  className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    "Saving..."
                  ) : editingId ? (
                    <>
                      <FiEdit size={14} />
                      Update Banner
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Create Banner
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-[#33251D]/15 px-4 text-xs font-semibold text-[#665448] transition-colors hover:bg-[#f5efe6]"
                  >
                    <FiX size={14} />
                    Cancel
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

export default AdminBanners;