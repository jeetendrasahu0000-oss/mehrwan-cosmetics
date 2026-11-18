import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiTrash2, FiStar, FiPlus, FiX } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(""); // URL se add karne ke liye
  
  const [form, setForm] = useState({
    name: "", sku: "", brand: "", category: "", description: "", ingredients: "",
    benefits: "", skinType: "All", price: "", discountPrice: "", stock: "",
    images: [], // Index 0 wali image primary (thumbnail) hogi
    isFeatured: false,
  });

  useEffect(() => {
    adminAPI.getAllCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ Cloudinary File Upload Handler
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const fd = new FormData();
    for (const f of files) fd.append("images", f);
    
    setUploading(true);
    try {
      const res = await adminAPI.uploadImages(fd);
      // ✅ Cloudinary full URL deta hai, isliye base URL add nahi karna hai
      const newUrls = res.data.images;
      
      setForm((f) => ({ ...f, images: [...f.images, ...newUrls] }));
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ URL se image add karna
  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm((f) => ({ ...f, images: [...f.images, imageUrlInput.trim()] }));
    setImageUrlInput("");
  };

  // ✅ Image remove karna
  const removeImage = (indexToRemove) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // ✅ Set Primary Image (Make it Thumbnail)
  const setPrimaryImage = (indexToPromote) => {
    setForm((f) => {
      const newImages = [...f.images];
      const [primary] = newImages.splice(indexToPromote, 1);
      newImages.unshift(primary); // Move to front (0 index)
      return { ...f, images: newImages };
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createProduct({
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
      });
      navigate("/admin/products");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create product");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-semibold">Add New Product</h1>
        <button onClick={() => navigate("/admin/products")} className="text-sm font-medium text-ink/50 hover:text-ink flex items-center gap-1">
          <FiX /> Cancel
        </button>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl p-6 md:p-8 space-y-8 shadow-sm border border-ink/5">
        
        {/* --- Section 1: Basic Info --- */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50 mb-4 border-b border-ink/5 pb-2">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Product Name</label>
              <input name="name" required value={form.name} onChange={change} className="input-field" placeholder="e.g. Hydra Glow Serum" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">SKU</label>
              <input name="sku" required value={form.sku} onChange={change} className="input-field" placeholder="e.g. MHR-SERUM-001" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Brand</label>
              <input name="brand" required value={form.brand} onChange={change} className="input-field" placeholder="e.g. Mehrwan" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Category</label>
              <select name="category" required value={form.category} onChange={change} className="input-field">
                <option value="">Select a category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- Section 2: Pricing & Inventory --- */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50 mb-4 border-b border-ink/5 pb-2">Pricing & Stock</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Price (₹)</label>
              <input name="price" type="number" required value={form.price} onChange={change} className="input-field" placeholder="1299" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Discount Price (₹)</label>
              <input name="discountPrice" type="number" value={form.discountPrice} onChange={change} className="input-field" placeholder="999 (Optional)" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Stock Qty</label>
              <input name="stock" type="number" required value={form.stock} onChange={change} className="input-field" placeholder="50" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Skin Type</label>
              <select name="skinType" value={form.skinType} onChange={change} className="input-field">
                {["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* --- Section 3: Product Details --- */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50 mb-4 border-b border-ink/5 pb-2">Product Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Description</label>
              <textarea name="description" required rows={3} value={form.description} onChange={change} className="input-field" placeholder="Describe the product..." />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Ingredients</label>
                <textarea name="ingredients" rows={2} value={form.ingredients} onChange={change} className="input-field" placeholder="Vitamin C, Hyaluronic Acid..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Benefits</label>
                <textarea name="benefits" rows={2} value={form.benefits} onChange={change} className="input-field" placeholder="Brightens skin, 24h hydration..." />
              </div>
            </div>
          </div>
        </div>

        {/* --- Section 4: Images --- */}
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-ink/5 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50">Product Images</h2>
            <span className="text-[10px] text-ink/40">First image is the primary thumbnail</span>
          </div>

          {/* Image Grid */}
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-4 mb-5">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-28 rounded-xl overflow-hidden border border-ink/10 group bg-gray-50">
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  
                  {/* Primary Badge */}
                  {idx === 0 ? (
                    <div className="absolute top-1.5 left-1.5 bg-blush-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <FiStar size={10} className="fill-white" /> Primary
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(idx)}
                      className="absolute top-1.5 left-1.5 bg-white/90 text-ink text-[9px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white"
                    >
                      Set Primary
                    </button>
                  )}

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                      <FiTrash2 size={14} />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload Controls */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <input 
                type="file" multiple accept="image/*" onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading}
              />
              <div className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-5 text-sm font-medium transition-colors ${uploading ? "border-gray-300 text-gray-400 bg-gray-50" : "border-blush-200 text-blush-700 hover:border-blush-400 hover:bg-blush-50/50"}`}>
                <FiUploadCloud size={24} />
                {uploading ? "Uploading to Cloudinary..." : "Upload Images (Cloudinary)"}
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <input 
                placeholder="Paste Image URL..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} 
                className="input-field text-sm" 
              />
              <button type="button" onClick={addImageUrl} className="btn-outline !py-3 !px-4 whitespace-nowrap">
                <FiPlus />
              </button>
            </div>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="pt-4 border-t border-ink/5 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-ink" />
            Mark as Featured Product
          </label>
          
          <button disabled={uploading} type="submit" className="btn-primary disabled:opacity-50 min-w-[150px]">
            {uploading ? "Uploading..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;