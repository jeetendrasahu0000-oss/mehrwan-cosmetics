import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiUploadCloud, FiTrash2, FiStar, FiPlus } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";
import { productAPI } from "../../services/productService";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    Promise.all([adminAPI.getAllCategories(), productAPI.getById(id)])
      .then(([cats, prod]) => {
        setCategories(cats.data);
        setForm({
          ...prod.data,
          images: prod.data.images || [], 
          variants: prod.data.variants || [], 
        });
      })
      .catch(() => {});
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) formData.append("images", files[i]);
    setUploading(true);
    try {
      const res = await adminAPI.uploadImages(formData);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...res.data.images] }));
    } catch (err) {
      alert("Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setForm((prev) => ({ ...prev, images: [...prev.images, imageUrlInput.trim()] }));
    setImageUrlInput("");
  };

  const removeImage = (indexToRemove) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== indexToRemove) }));
  };

  const setPrimaryImage = (indexToPromote) => {
    setForm((f) => {
      const newImages = [...f.images];
      const [primary] = newImages.splice(indexToPromote, 1);
      newImages.unshift(primary);
      return { ...f, images: newImages };
    });
  };

  const addVariant = () => {
    setForm({ ...form, variants: [...form.variants, { name: "Size", value: "", priceAdjustment: 0 }] });
  };

  const updateVariant = (index, field, value) => {
    const newVariants = [...form.variants];
    newVariants[index][field] = value;
    setForm({ ...form, variants: newVariants });
  };

  const removeVariant = (index) => {
    setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) });
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
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-3xl font-semibold">Edit Product</h1>
        <button onClick={() => navigate("/admin/products")} className="text-sm font-medium text-ink/50 hover:text-ink flex items-center gap-1">
          Cancel
        </button>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl p-6 md:p-8 space-y-8 shadow-sm border border-ink/5">
        
        {/* Basic Info */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50 mb-4 border-b border-ink/5 pb-2">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Product Name</label>
              <input name="name" required value={form.name} onChange={change} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">SKU</label>
              <input name="sku" required value={form.sku} onChange={change} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Brand</label>
              <input name="brand" required value={form.brand} onChange={change} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Category</label>
              <select name="category" required value={form.category?._id || form.category} onChange={change} className="input-field">
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50 mb-4 border-b border-ink/5 pb-2">Pricing & Stock</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Price (₹)</label>
              <input name="price" type="number" required value={form.price} onChange={change} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Discount Price (₹)</label>
              <input name="discountPrice" type="number" value={form.discountPrice} onChange={change} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Stock Qty</label>
              <input name="stock" type="number" required value={form.stock} onChange={change} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Skin Type</label>
              <select name="skinType" value={form.skinType} onChange={change} className="input-field">
                {["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50 mb-4 border-b border-ink/5 pb-2">Product Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Description</label>
              <textarea name="description" required rows={3} value={form.description} onChange={change} className="input-field" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Ingredients</label>
                <textarea name="ingredients" rows={2} value={form.ingredients || ""} onChange={change} className="input-field" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/70 mb-1.5 block">Benefits</label>
                <textarea name="benefits" rows={2} value={form.benefits || ""} onChange={change} className="input-field" />
              </div>
            </div>
          </div>
        </div>

        {/* Variants Section */}
        <div className="border-t border-ink/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50">Product Variants</h2>
              <p className="text-xs text-ink/40 mt-1">Default size should have Extra Price 0.</p>
            </div>
            <button type="button" onClick={addVariant} className="text-xs font-semibold text-blush-600 hover:text-blush-800 flex items-center gap-1">
              <FiPlus /> Add Variant
            </button>
          </div>
          <div className="space-y-3">
            {form.variants?.map((variant, index) => (
              <div key={index} className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <input placeholder="Type (Size/Color)" value={variant.name} onChange={(e) => updateVariant(index, 'name', e.target.value)} className="input-field !py-2 text-sm w-full sm:w-1/3" />
                <input placeholder="Value (50ml/Red)" value={variant.value} onChange={(e) => updateVariant(index, 'value', e.target.value)} className="input-field !py-2 text-sm w-full sm:w-1/3" required />
                <input type="number" placeholder="Extra Price (₹)" value={variant.priceAdjustment} onChange={(e) => updateVariant(index, 'priceAdjustment', Number(e.target.value))} className="input-field !py-2 text-sm w-full sm:w-1/4" />
                <button type="button" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700 p-2"><FiTrash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Images */}
        <div className="border-t border-ink/10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink/50">Product Images</h2>
            <span className="text-[10px] text-ink/40">First image is primary</span>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            {form.images?.map((img, idx) => (
              <div key={idx} className="relative w-24 h-28 rounded-xl overflow-hidden border border-ink/10 group bg-gray-50">
                <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                {idx === 0 ? (
                  <div className="absolute top-1.5 left-1.5 bg-blush-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <FiStar size={10} className="fill-white" /> Primary
                  </div>
                ) : (
                  <button type="button" onClick={() => setPrimaryImage(idx)} className="absolute top-1.5 left-1.5 bg-white/90 text-ink text-[9px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white">
                    Set Primary
                  </button>
                )}
                <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-8 h-8 bg-white text-red-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <FiTrash2 size={14} />
                  </div>
                </button>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="relative">
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={uploading} />
              <div className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-4 text-sm font-medium transition-colors ${uploading ? "border-gray-300 text-gray-400 bg-gray-50" : "border-ink/20 text-ink/60 hover:border-ink/50 hover:text-ink hover:bg-gray-50"}`}>
                <FiUploadCloud size={24} />
                {uploading ? "Uploading..." : "Upload New Images"}
              </div>
            </div>
            <div className="flex gap-2">
              <input placeholder="Paste Image URL..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} className="input-field text-sm" />
              <button type="button" onClick={addImageUrl} className="btn-outline !py-2 !px-4 text-sm whitespace-nowrap">Add URL</button>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-ink/5 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-ink" />
            Mark as Featured
          </label>
          <button disabled={uploading} className="btn-primary disabled:opacity-50 min-w-[150px]">
            {uploading ? "Uploading..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;