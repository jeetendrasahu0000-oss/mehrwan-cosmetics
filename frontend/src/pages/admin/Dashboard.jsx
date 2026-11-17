import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiDollarSign, FiShoppingBag, FiBox, FiUsers, FiClock, FiCheckCircle } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="bg-white rounded-2xl p-5">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${accent}`}>
      <Icon />
    </div>
    <p className="text-xs text-ink/50 uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminAPI.getStats().then((res) => setStats(res.data)).catch(() => {});
  }, []);

  if (!stats) return <p className="text-ink/50">Loading dashboard…</p>;

  const maxRevenue = Math.max(...(stats.salesByDay.map((d) => d.revenue) || [1]), 1);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-ink/50 mt-1">Overview of your store's performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={FiDollarSign} accent="bg-green-100 text-green-600" />
        <StatCard label="Total Orders" value={stats.totalOrders} icon={FiShoppingBag} accent="bg-blue-100 text-blue-600" />
        <StatCard label="Products" value={stats.totalProducts} icon={FiBox} accent="bg-purple-100 text-purple-600" />
        <StatCard label="Customers" value={stats.totalCustomers} icon={FiUsers} accent="bg-blush-100 text-blush-700" />
        <StatCard label="Pending" value={stats.pendingOrders} icon={FiClock} accent="bg-yellow-100 text-yellow-600" />
        <StatCard label="Completed" value={stats.completedOrders} icon={FiCheckCircle} accent="bg-green-100 text-green-700" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Revenue · Last 7 Days</h2>
          {stats.salesByDay.length === 0 ? (
            <p className="text-sm text-ink/40 py-8 text-center">No sales in the last 7 days.</p>
          ) : (
            <div className="flex items-end gap-3 h-52">
              {stats.salesByDay.map((d) => (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-blush-200 rounded-t-lg relative group" style={{ height: `${(d.revenue / maxRevenue) * 100}%`, minHeight: 6 }}>
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-ink text-cream px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                      ₹{d.revenue}
                    </span>
                  </div>
                  <span className="text-[10px] text-ink/40">{d._id.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6">
          <h2 className="font-semibold mb-5">Recent Orders</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-ink/40 py-8 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 6).map((o) => (
                <div key={o._id} className="flex items-center justify-between text-sm py-2 border-b border-ink/5 last:border-0">
                  <div>
                    <p className="font-medium">#{o._id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-ink/50">{o.user?.name || "Guest"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹{o.totalPrice.toLocaleString()}</p>
                    <p className="text-[11px] text-ink/50">{o.orderStatus}</p>
                  </div>
                </div>
              ))}
              <Link to="/admin/orders" className="block text-center text-sm text-blush-700 font-medium mt-3 hover:underline">View all orders →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;