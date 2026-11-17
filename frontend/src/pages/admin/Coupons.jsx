import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({
    code: "", discountType: "percentage", discountValue: "", minOrderAmount: "",
    maxDiscount: "", expiryDate: "",
  });

  const load = () => adminAPI.getCoupons().then((r) => setCoupons(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    await adminAPI.createCoupon({
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxDiscount: Number(form.maxDiscount) || 0,
    });
    setForm({ code: "", discountType: "percentage", discountValue: "", minOrderAmount: "", maxDiscount: "", expiryDate: "" });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete coupon?")) return;
    await adminAPI.deleteCoupon(id);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Coupons</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="bg-white rounded-2xl p-6 space-y-2">
          {coupons.map((c) => (
            <div key={c._id} className="flex items-center justify-between p-3 border border-ink/5 rounded-xl">
              <div>
                <p className="font-semibold text-sm">{c.code}</p>
                <p className="text-xs text-ink/50">
                  {c.discountType === "percentage" ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                  {" · "}Min ₹{c.minOrderAmount}
                </p>
              </div>
              <button onClick={() => remove(c._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
          {coupons.length === 0 && <p className="text-sm text-ink/40 text-center py-6">No coupons yet.</p>}
        </div>

        <form onSubmit={submit} className="bg-white rounded-2xl p-6 space-y-3 h-fit">
          <h2 className="font-semibold">Create Coupon</h2>
          <input required placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input-field" />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input-field">
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed</option>
          </select>
          <input type="number" required placeholder="Discount value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input-field" />
          <input type="number" placeholder="Min order amount" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="input-field" />
          <input type="number" placeholder="Max discount" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="input-field" />
          <input type="date" required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input-field" />
          <button className="btn-primary w-full"><FiPlus /> Create</button>
        </form>
      </div>
    </div>
  );
};

export default AdminCoupons;