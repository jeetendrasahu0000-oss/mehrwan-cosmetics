import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminAPI } from "../../services/adminService";
import { productAPI } from "../../services/productService";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([adminAPI.getAllCategories(), productAPI.getById(id)]).then(([cats, prod]) => {
      setCategories(cats.data);
      setForm(prod.data);
    }).catch(() => {});
  }, [id]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
      alert(err.response?.data?.message || "Failed");
    }
  };

  if (!form) return <p className="text-ink/50">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl font-semibold mb-6">Edit Product</h1>
      <form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="name" required value={form.name} onChange={change} className="input-field" />
          <input name="sku" required value={form.sku} onChange={change} className="input-field" />
          <input name="brand" required value={form.brand} onChange={change} className="input-field" />
          <select name="category" value={form.category?._id || form.category} onChange={change} className="input-field">
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input name="price" type="number" required value={form.price} onChange={change} className="input-field" />
          <input name="discountPrice" type="number" value={form.discountPrice} onChange={change} className="input-field" />
          <input name="stock" type="number" required value={form.stock} onChange={change} className="input-field" />
          <select name="skinType" value={form.skinType} onChange={change} className="input-field">
            {["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <textarea name="description" required rows={3} value={form.description} onChange={change} className="input-field" />
        <textarea name="ingredients" rows={2} value={form.ingredients || ""} onChange={change} className="input-field" />
        <textarea name="benefits" rows={2} value={form.benefits || ""} onChange={change} className="input-field" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
          Featured product
        </label>
        <button className="btn-primary">Save Changes</button>
      </form>
    </div>
  );
};

export default EditProduct;