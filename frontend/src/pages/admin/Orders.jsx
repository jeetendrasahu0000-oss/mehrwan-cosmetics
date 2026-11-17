import { useEffect, useState } from "react";
import { adminAPI } from "../../services/adminService";

const statuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  const load = () => adminAPI.getAllOrders().then((r) => setOrders(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const update = async (id, status) => {
    await adminAPI.updateOrderStatus(id, status);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Orders</h1>
      <div className="bg-white rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-left text-xs uppercase text-ink/50">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-t border-ink/5">
                <td className="px-4 py-3 font-medium">#{o._id.slice(-6).toUpperCase()}</td>
                <td className="px-4 py-3">
                  <p>{o.user?.name}</p>
                  <p className="text-xs text-ink/40">{o.user?.email}</p>
                </td>
                <td className="px-4 py-3">₹{o.totalPrice.toLocaleString()}</td>
                <td className="px-4 py-3">{o.paymentMethod}</td>
                <td className="px-4 py-3">
                  <select value={o.orderStatus} onChange={(e) => update(o._id, e.target.value)} className="border border-ink/15 rounded-lg px-2 py-1 text-xs outline-none">
                    {statuses.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-12 text-ink/40 text-sm">No orders yet.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;