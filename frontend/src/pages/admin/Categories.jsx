import { useEffect, useState } from "react";
import { FiPlus, FiEdit, FiTrash2, FiUploadCloud } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", image: "" });
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false); // ✅ Upload loading state

  const load = () => {
    adminAPI.getAllCategories()
      .then((r) => setCategories(r.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => { load(); }, []);

  // ✅ Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("images", file); // Backend me 'images' array field hai

    setUploading(true);
    try {
      const res = await adminAPI.uploadImages(formData);
      // Backend se URL aayega jaise "/uploads/1234-image.jpg"
      // Hume base URL add karna hoga taaki frontend me dikhe
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
    if (editing) await adminAPI.updateCategory(editing, form);
    else await adminAPI.createCategory(form);
    setForm({ name: "", description: "", image: "" }); // Reset
    setEditing(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete category permanently?")) return;
    await adminAPI.deleteCategory(id);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Categories</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        
        {/* Category List */}
        <div className="bg-white rounded-2xl p-6">
          <div className="space-y-2">
            {categories.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-3 border border-ink/5 rounded-xl">
                <div className="flex items-center gap-4">
                  {c.image ? (
                    <img src={c.image} alt={c.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">No Img</div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-ink/40 line-clamp-1">{c.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setForm({ name: c.name, description: c.description || "", image: c.image || "" }); setEditing(c._id); }} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiEdit size={14} />
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-ink/40 text-center py-6">No categories yet.</p>}
          </div>
        </div>

        {/* Add/Edit Form */}
        <form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-3 h-fit">
          <h2 className="font-semibold">{editing ? "Edit" : "Add"} Category</h2>
          
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
          
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" />
          
          <div className="pt-2">
            <label className="text-xs font-semibold text-ink/60 mb-2 block">Category Image</label>
            
            {/* URL Input */}
            <input 
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

            {/* File Upload Button */}
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

            {/* Image Preview */}
            {form.image && (
              <div className="mt-3 relative w-20 h-20 rounded-lg overflow-hidden border border-ink/10">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => setForm({ ...form, image: "" })} 
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-[10px]"
                >
                  <FiTrash2 />
                </button>
              </div>
            )}
          </div>

          <button disabled={uploading} className="btn-primary w-full mt-4 disabled:opacity-50">
            <FiPlus /> {editing ? "Update" : "Create"}
          </button>
          
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", description: "", image: "" }); }} className="text-xs text-ink/50 hover:underline w-full text-center">Cancel</button>}
        </form>
      </div>
    </div>
  );
};

export default AdminCategories;