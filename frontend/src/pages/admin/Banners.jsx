import { useEffect, useState } from "react";
import { FiPlus, FiTrash2, FiEdit, FiUploadCloud } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", videoUrl: "", link: "", type: "hero" });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false); // ✅ Uploading state

  const load = () => adminAPI.getAllBanners().then((r) => setBanners(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  // ✅ Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file);

    setUploading(true);
    try {
      const res = await adminAPI.uploadImages(formData);
      const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
      const imageUrl = baseUrl + res.data.images[0];
      
      setForm({ ...form, image: imageUrl });
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await adminAPI.updateBanner(editingId, form);
      setEditingId(null);
    } else {
      await adminAPI.createBanner(form);
    }
    setForm({ title: "", subtitle: "", image: "", videoUrl: "", link: "", type: "hero" });
    load();
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    await adminAPI.deleteBanner(id);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Banners & Videos</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
          {banners.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-ink/5">
              <div className="relative h-40">
                <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-ink/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full uppercase tracking-wider">
                  {b.type}
                </div>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{b.title}</p>
                  <p className="text-xs text-ink/50 truncate">{b.subtitle}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleEdit(b)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition">
                    <FiEdit size={14} />
                  </button>
                  <button onClick={() => remove(b._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-3 h-fit lg:sticky lg:top-24">
          <h2 className="font-semibold">{editingId ? "Edit" : "Add"} Banner/Video</h2>
          
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="input-field" />
          
          {/* ✅ Image Section (URL + Upload) */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-ink/60 mb-2 block">Banner Image</label>
            
            <input 
              required
              placeholder="Paste Image URL here..." 
              value={form.image} 
              onChange={(e) => setForm({ ...form, image: e.target.value })} 
              className="input-field mb-2 text-sm" 
            />
            
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px bg-ink/10 flex-1"></div>
              <span className="text-xs text-ink/40 font-medium">OR</span>
              <div className="h-px bg-ink/10 flex-1"></div>
            </div>

            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className={`flex items-center justify-center gap-2 border-2 border-dashed rounded-xl p-3 text-sm font-medium transition-colors ${uploading ? "border-gray-300 text-gray-400" : "border-ink/20 text-ink/60 hover:border-ink/50 hover:text-ink"}`}>
                <FiUploadCloud size={18} />
                {uploading ? "Uploading..." : "Upload from Computer"}
              </div>
            </div>

            {form.image && (
              <div className="mt-3 relative w-full h-24 rounded-lg overflow-hidden border border-ink/10">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setForm({ ...form, image: "" })} 
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            )}
          </div>

          <input placeholder="Video URL (Optional)" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="input-field mt-4" />
          <input placeholder="Redirect Link (Instagram Reel etc.)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="input-field" />
          
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            <option value="hero">Hero (Main Homepage)</option>
            <option value="promotional">Promotional (Offers)</option>
            <option value="collection">Collection</option>
            <option value="instagram">Instagram Gallery</option>
            <option value="announcement">Announcement Bar</option>
            <option value="video">Video Reels</option>
          </select>

          <div className="flex gap-2 pt-2">
            <button disabled={uploading} type="submit" className="btn-primary flex-1 justify-center disabled:opacity-50">
              {editingId ? <><FiEdit /> Update</> : <><FiPlus /> Create</>}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setForm({ title: "", subtitle: "", image: "", videoUrl: "", link: "", type: "hero" }); }} className="btn-outline px-4">Cancel</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminBanners;