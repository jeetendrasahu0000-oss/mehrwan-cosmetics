import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";
import { productAPI } from "../../services/productService";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);

  const load = () =>
    productAPI.getAll({ limit: 100 }).then((res) => setProducts(res.data.products)).catch(() => {});

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await adminAPI.deleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Products</h1>
          <p className="text-sm text-ink/50 mt-1">{products.length} products</p>
        </div>
        <Link to="/admin/products/add" className="btn-primary !py-2.5 text-sm">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left text-xs uppercase tracking-wider text-ink/50">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-ink/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium line-clamp-1 max-w-[220px]">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink/60">{p.brand}</td>
                <td className="px-4 py-3">₹{(p.discountPrice || p.price).toLocaleString()}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-1 rounded-full ${p.isFeatured ? "bg-blush-100 text-blush-700" : "bg-ink/5 text-ink/50"}`}>
                    {p.isFeatured ? "Featured" : "Normal"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to={`/admin/products/edit/${p._id}`} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100">
                      <FiEdit size={14} />
                    </Link>
                    <button onClick={() => handleDelete(p._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center py-12 text-ink/40 text-sm">No products yet.</p>}
      </div>
    </div>
  );
};

export default AdminProducts;