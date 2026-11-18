import { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiEdit,
  FiUploadCloud,
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

  // Fetch banners
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

  // Cloudinary Image Upload
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
      // Same upload API used in AddProduct.jsx
      const res = await adminAPI.uploadImages(formData);

      // Cloudinary returns the complete image URL
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

  // Form Submit
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

  // Edit Banner
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

  // Reset Form
  const resetForm = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
  };

  // Delete Banner
  const remove = async (id) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      await adminAPI.deleteBanner(id);
      await load();
      alert("Banner deleted successfully!");
    } catch (err) {
      console.error("Banner delete failed:", err);
      alert("Failed to delete banner.");
    }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">
        Banners & Videos
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">

        {/* Banner List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">

          {banners.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-ink/5"
            >
              <div className="relative h-40">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2 right-2 bg-ink/60 text-white text-[10px] px-2 py-1 rounded-full uppercase">
                  {banner.type}
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {banner.title}
                  </p>

                  <p className="text-xs text-ink/50 truncate">
                    {banner.subtitle}
                  </p>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEdit(banner)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                  >
                    <FiEdit size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => remove(banner._id)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {banners.length === 0 && (
            <p className="text-sm text-ink/50">
              No banners available.
            </p>
          )}
        </div>

        {/* Add / Edit Banner Form */}
        <form
          onSubmit={submit}
          className="bg-white rounded-2xl p-6 space-y-3 h-fit lg:sticky lg:top-24"
        >
          <h2 className="font-semibold">
            {editingId ? "Edit Banner" : "Add Banner/Video"}
          </h2>

          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            className="input-field"
          />

          <input
            placeholder="Subtitle"
            value={form.subtitle}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                subtitle: e.target.value,
              }))
            }
            className="input-field"
          />

          {/* Banner Image */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-ink/60 mb-2 block">
              Banner Image
            </label>

            <input
              required
              placeholder="Paste Image URL here..."
              value={form.image}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  image: e.target.value,
                }))
              }
              className="input-field mb-3 text-sm"
            />

            <div className="flex items-center gap-3 mb-3">
              <div className="h-px bg-ink/10 flex-1" />
              <span className="text-xs text-ink/40">OR</span>
              <div className="h-px bg-ink/10 flex-1" />
            </div>

            {/* Cloudinary Upload */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />

              <div
                className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-3 text-sm font-medium ${
                  uploading
                    ? "border-gray-300 text-gray-400"
                    : "border-ink/20 text-ink/60 hover:border-ink/50"
                }`}
              >
                <FiUploadCloud size={18} />

                {uploading
                  ? "Uploading to Cloudinary..."
                  : "Upload to Cloudinary"}
              </div>
            </div>

            {/* Image Preview */}
            {form.image && (
              <div className="mt-3 relative w-full h-28 rounded-lg overflow-hidden border border-ink/10">
                <img
                  src={form.image}
                  alt="Banner Preview"
                  className="w-full h-full object-cover"
                />

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      image: "",
                    }))
                  }
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            )}
          </div>

          <input
            placeholder="Video URL (Optional)"
            value={form.videoUrl}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                videoUrl: e.target.value,
              }))
            }
            className="input-field mt-4"
          />

          <input
            placeholder="Redirect Link (Instagram Reel etc.)"
            value={form.link}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                link: e.target.value,
              }))
            }
            className="input-field"
          />

          <select
            value={form.type}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
            className="input-field"
          >
            <option value="hero">Hero (Main Homepage)</option>
            <option value="promotional">Promotional (Offers)</option>
            <option value="collection">Collection</option>
            <option value="instagram">Instagram Gallery</option>
            <option value="announcement">Announcement Bar</option>
            <option value="video">Video Reels</option>
          </select>

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              disabled={uploading || saving}
              type="submit"
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? <><FiEdit /> Update</>
                : <><FiPlus /> Create</>}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-outline px-4"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBanners;