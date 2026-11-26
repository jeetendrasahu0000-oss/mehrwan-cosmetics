import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiDollarSign, FiShoppingBag, FiBox, FiUsers, FiClock,
  FiCheckCircle, FiTrendingUp, FiArrowRight, FiAlertCircle,
} from "react-icons/fi";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, BarChart, Bar,
} from "recharts";
import { adminAPI } from "../../services/adminService";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ---------- Stat card (mobile-safe) ---------- */
const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="min-w-0 overflow-hidden rounded-xl bg-white p-3.5 ring-1 ring-ink/8 sm:p-4">
    <div className={`flex h-8 w-8 items-center justify-center rounded-lg sm:h-9 sm:w-9 ${accent}`}>
      <Icon className="h-4 w-4" />
    </div>
    <p className="mt-2.5 truncate text-[10px] font-medium uppercase tracking-wider text-ink/45 sm:text-[11px]">
      {label}
    </p>
    <p className="mt-0.5 truncate text-lg font-semibold text-ink sm:text-xl md:text-2xl">
      {value}
    </p>
  </div>
);

/* ---------- Skeleton ---------- */
const Skeleton = () => (
  <div className="space-y-4">
    <div className="h-6 w-40 animate-pulse rounded bg-ink/10" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="h-64 animate-pulse rounded-xl bg-white ring-1 ring-ink/8 lg:col-span-2" />
      <div className="h-64 animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
    </div>
  </div>
);

const statusColor = (s = "") => {
  const k = s.toLowerCase();
  if (k.includes("deliver") || k.includes("complete")) return "bg-green-50 text-green-700";
  if (k.includes("cancel") || k.includes("fail")) return "bg-red-50 text-red-600";
  if (k.includes("pend") || k.includes("process")) return "bg-yellow-50 text-yellow-700";
  return "bg-ink/5 text-ink/60";
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [range, setRange] = useState(7);

  useEffect(() => {
    adminAPI
      .getStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load dashboard data."));
  }, []);

  const chartData = useMemo(() => {
    if (!stats?.salesByDay) return [];
    return stats.salesByDay.slice(-range).map((d) => ({
      day: d._id.slice(5),
      revenue: d.revenue,
      orders: d.orders || 0,
    }));
  }, [stats, range]);

  const totalChartRevenue = chartData.reduce((a, d) => a + d.revenue, 0);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100">
        <FiAlertCircle className="mr-1.5 inline h-4 w-4" /> {error}
      </div>
    );
  }

  if (!stats) return <Skeleton />;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-xl font-semibold text-ink sm:text-2xl md:text-3xl">
            Dashboard
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50 sm:text-sm">
            Overview of your store's performance
          </p>
        </div>
        <Link
          to="/admin/orders"
          className="flex shrink-0 items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-[11px] font-medium text-white transition hover:bg-ink/90 sm:px-3 sm:py-2 sm:text-xs"
        >
          Manage orders <FiArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
        </Link>
      </div>

      {/* ---------- KPI Cards ---------- */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-3 md:gap-4">
        <StatCard label="Revenue" value={inr(stats.totalRevenue)} icon={FiDollarSign} accent="bg-green-100 text-green-600" />
        <StatCard label="Orders" value={stats.totalOrders} icon={FiShoppingBag} accent="bg-blue-100 text-blue-600" />
        <StatCard label="Products" value={stats.totalProducts} icon={FiBox} accent="bg-purple-100 text-purple-600" />
        <StatCard label="Customers" value={stats.totalCustomers} icon={FiUsers} accent="bg-blush-100 text-blush-700" />
        <StatCard label="Pending" value={stats.pendingOrders} icon={FiClock} accent="bg-yellow-100 text-yellow-600" />
        <StatCard label="Completed" value={stats.completedOrders} icon={FiCheckCircle} accent="bg-green-100 text-green-700" />
      </div>

      {/* ---------- Charts ---------- */}
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-3">
        {/* Revenue — min-w-0 is critical */}
        <div className="min-w-0 rounded-xl bg-white ring-1 ring-ink/8 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/8 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-ink">Revenue trend</h2>
              <p className="truncate text-[10px] text-ink/45 sm:text-[11px]">
                {inr(totalChartRevenue)} in last {range} days
              </p>
            </div>
            <div className="flex shrink-0 gap-0.5 rounded-lg bg-ink/5 p-0.5">
              {[7, 14, 30].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-md px-2 py-1 text-[10px] font-medium transition sm:text-[11px] ${
                    range === r ? "bg-white text-ink shadow-sm" : "text-ink/50 hover:text-ink"
                  }`}
                >
                  {r}d
                </button>
              ))}
            </div>
          </div>
          <div className="w-full overflow-hidden p-2 sm:p-3">
            {chartData.length === 0 ? (
              <p className="py-14 text-center text-xs text-ink/40">No sales data.</p>
            ) : (
              <div className="h-52 w-full sm:h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2b2422" stopOpacity={0.22} />
                        <stop offset="100%" stopColor="#2b2422" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 9, fill: "#00000070" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={18}
                    />
                    <YAxis
                      width={32}
                      tick={{ fontSize: 9, fill: "#00000070" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #00000010",
                        fontSize: 11,
                        padding: "5px 8px",
                      }}
                      formatter={(v) => [inr(v), "Revenue"]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2b2422" strokeWidth={2} fill="url(#rev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Orders bar chart */}
        <div className="min-w-0 rounded-xl bg-white ring-1 ring-ink/8">
          <div className="border-b border-ink/8 px-3 py-2.5 sm:px-4 sm:py-3">
            <h2 className="text-sm font-semibold text-ink">Orders / day</h2>
            <p className="text-[10px] text-ink/45 sm:text-[11px]">Last {range} days</p>
          </div>
          <div className="w-full overflow-hidden p-2 sm:p-3">
            {chartData.length === 0 ? (
              <p className="py-14 text-center text-xs text-ink/40">No orders.</p>
            ) : (
              <div className="h-52 w-full sm:h-56 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 9, fill: "#00000070" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                      minTickGap={18}
                    />
                    <YAxis
                      width={26}
                      tick={{ fontSize: 9, fill: "#00000070" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "1px solid #00000010",
                        fontSize: 11,
                        padding: "5px 8px",
                      }}
                      formatter={(v) => [v, "Orders"]}
                    />
                    <Bar dataKey="orders" fill="#2b2422" radius={[4, 4, 0, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Recent Orders ---------- */}
      <div className="rounded-xl bg-white ring-1 ring-ink/8">
        <div className="flex items-center justify-between border-b border-ink/8 px-3 py-2.5 sm:px-4 sm:py-3">
          <h2 className="text-sm font-semibold text-ink">Recent orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center gap-1 text-[11px] font-medium text-ink/60 hover:text-ink"
          >
            View all <FiArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p className="py-10 text-center text-xs text-ink/40">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-ink/5">
            {stats.recentOrders.slice(0, 6).map((o) => (
              <li
                key={o._id}
                className="flex items-center justify-between gap-2 px-3 py-2.5 transition hover:bg-ink/[0.02] sm:px-4 sm:py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-[13px] font-medium text-ink sm:text-sm">
                      #{o._id.slice(-6).toUpperCase()}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-medium capitalize sm:text-[10px] ${statusColor(o.orderStatus)}`}
                    >
                      {o.orderStatus}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-ink/50 sm:text-[11px]">
                    {o.user?.name || "Guest"}
                  </p>
                </div>
                <p className="shrink-0 text-[13px] font-semibold text-ink sm:text-sm">
                  {inr(o.totalPrice)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;