import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/adminService";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", brand: "", category: "", description: "", ingredients: "",
    benefits: "", skinType: "All", price: "", discountPrice: "", stock: "",
    images: [], isFeatured: false,
  });

  useEffect(() => {
    adminAPI.getAllCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleImage = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    const fd = new FormData();
    for (const f of files) fd.append("images", f);
    setUploading(true);
    try {
      const res = await adminAPI.uploadImages(fd);
      const base = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
      setForm((f) => ({ ...f, images: [...f.images, ...res.data.images.map((p) => base + p)] }));
    } catch (err) {
      alert("Upload failed");
    }
    setUploading(false);
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
      alert(err.response?.data?.message || "Failed");
    }
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl font-semibold mb-6">Add Product</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="name" required placeholder="Product Name" value={form.name} onChange={change} className="input-field" />
          <input name="sku" required placeholder="SKU" value={form.sku} onChange={change} className="input-field" />
          <input name="brand" required placeholder="Brand" value={form.brand} onChange={change} className="input-field" />
          <select name="category" required value={form.category} onChange={change} className="input-field">
            <option value="">Select Category</option>
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
        <textarea name="ingredients" placeholder="Ingredients" rows={2} value={form.ingredients} onChange={change} className="input-field" />
        <textarea name="benefits" placeholder="Benefits" rows={2} value={form.benefits} onChange={change} className="input-field" />

        <div>
          <label className="text-sm font-medium block mb-2">Images</label>
          <input type="file" multiple accept="image/*" onChange={handleImage} className="text-sm" />
          {uploading && <p className="text-xs text-ink/50 mt-1">Uploading…</p>}
          <div className="flex gap-2 mt-3 flex-wrap">
            {form.images.map((img, i) => <img key={i} src={img} className="w-16 h-16 object-cover rounded-lg" />)}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
          Featured product
        </label>

        <button className="btn-primary">Create Product</button>
      </form>
    </div>
  );
};

export default AddProduct;