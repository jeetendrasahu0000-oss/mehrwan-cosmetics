import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";
import { productAPI } from "../../services/productService";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  
  // ✅ Image update ke liye nayi states
  const [uploading, setUploading] = useState(false);
  const [newImages, setNewImages] = useState([]); // Naye upload kiye gaye images
  const [imageUrlInput, setImageUrlInput] = useState(""); // Manual URL input

  useEffect(() => {
    Promise.all([adminAPI.getAllCategories(), productAPI.getById(id)])
      .then(([cats, prod]) => {
        setCategories(cats.data);
        // Purane images ko state me load karo
        setForm({
          ...prod.data,
          images: prod.data.images || [], 
        });
      })
      .catch(() => {});
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ File Upload (Cloudinary) Handler
  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    setUploading(true);
    try {
      // Backend me upload route call karo
      const res = await adminAPI.uploadImages(formData);
      
      // Cloudinary se aayi hui nayi image URLs ko form me add karo
      const uploadedUrls = res.data.images;
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

    } catch (err) {
      console.error("Upload failed:", err);
      alert("Image upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Image URL se add karna
  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()]
    }));
    setImageUrlInput("");
  };

  // ✅ Image remove karna
  const removeImage = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateProduct(id, {
        ...form,
        price: Number(form.price),
        discountPrice: Number(form.discountPrice) || 0,
        stock: Number(form.stock),
      });
      navigate("/admin/products");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update product");
    }
  };

  if (!form) return <p className="text-ink/50 p-10">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl font-semibold mb-6">Edit Product</h1>
      
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-6">
        
        {/* Basic Details */}
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="name" required placeholder="Product Name" value={form.name} onChange={change} className="input-field" />
          <input name="sku" required placeholder="SKU" value={form.sku} onChange={change} className="input-field" />
          <input name="brand" required placeholder="Brand" value={form.brand} onChange={change} className="input-field" />
          <select name="category" value={form.category?._id || form.category} onChange={change} className="input-field">
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input name="price" type="number" required placeholder="Price" value={form.price} onChange={change} className="input-field" />
          <input name="discountPrice" type="number" placeholder="Discount Price" value={form.discountPrice} onChange={change} className="input-field" />
          <input name="stock" type="number" required placeholder="Stock" value={form.stock} onChange={change} className="input-field" />
          <select name="skinType" value={form.skinType} onChange={change} className="input-field">
            {["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <textarea name="description" required placeholder="Description" rows={3} value={form.description} onChange={change} className="input-field" />
        <textarea name="ingredients" placeholder="Ingredients" rows={2} value={form.ingredients || ""} onChange={change} className="input-field" />
        <textarea name="benefits" placeholder="Benefits" rows={2} value={form.benefits || ""} onChange={change} className="input-field" />
        
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4" />
          Featured product
        </label>

        {/* ✅ Naya Section: Images */}
        <div className="border-t border-ink/10 pt-6">
          <h2 className="font-semibold mb-4 text-lg">Product Images</h2>
          
          {/* Image Grid (Current Images) */}
          <div className="flex flex-wrap gap-4 mb-4">
            {form.images?.map((img, idx) => (
              <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-ink/10 group">
                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiTrash2 className="text-white" size={20} />
                </button>
              </div>
            ))}
            
            {(!form.images || form.images.length === 0) && (
              <div className="w-24 h-24 rounded-lg bg-gray-50 flex items-center justify-center text-xs text-gray-400 border border-dashed border-gray-300">
                No Images
              </div>
            )}
          </div>

          {/* Naya Image Upload / URL Add */}
          <div className="grid sm:grid-cols-2 gap-4">
            
            {/* 1. File Upload */}
            <div className="relative">
              <input 
                type="file" 
                accept="image/*"
                multiple // Ek saath kai images upload kar sakte hain
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium transition-colors ${uploading ? "border-gray-300 text-gray-400 bg-gray-50" : "border-ink/20 text-ink/60 hover:border-ink/50 hover:text-ink hover:bg-gray-50"}`}>
                <FiUploadCloud size={24} />
                {uploading ? "Uploading..." : "Upload New Images"}
              </div>
            </div>

            {/* 2. Add by URL */}
            <div className="flex gap-2">
              <input 
                placeholder="Paste Image URL here..." 
                value={imageUrlInput} 
                onChange={(e) => setImageUrlInput(e.target.value)} 
                className="input-field text-sm" 
              />
              <button 
                type="button" 
                onClick={addImageUrl}
                className="btn-outline !py-2 !px-4 text-sm whitespace-nowrap"
              >
                Add URL
              </button>
            </div>
          </div>
        </div>

        <button disabled={uploading} className="btn-primary w-full mt-6 disabled:opacity-50">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProduct;