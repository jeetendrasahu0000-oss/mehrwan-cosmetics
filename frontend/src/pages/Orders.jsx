import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPackage, FiChevronRight } from "react-icons/fi";
import { orderAPI } from "../services/orderService";

const STATUS_STYLES = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Processing: "bg-purple-100 text-purple-700",
  Shipped: "bg-indigo-100 text-indigo-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

const PLACEHOLDER = "https://placehold.co/100x100/fbeae5/2b2422";
const MAX_THUMBS = 3;

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const SkeletonRow = () => (
  <div className="animate-pulse rounded-xl bg-white p-4" aria-hidden="true">
    <div className="flex justify-between">
      <div className="h-3 w-32 rounded bg-ink/5" />
      <div className="h-5 w-16 rounded-full bg-ink/5" />
    </div>
    <div className="mt-4 flex gap-2">
      <div className="h-12 w-12 rounded-lg bg-ink/5" />
      <div className="h-12 w-12 rounded-lg bg-ink/5" />
    </div>
  </div>
);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    orderAPI
      .getMyOrders()
      .then((res) => active && setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  if (loaded && orders.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:py-24">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-2xl text-blush-600">
          <FiPackage aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-ink">No orders yet</h1>
        <p className="mb-6 mt-2 text-sm text-ink/60">Your orders will show up here once you place one.</p>
        <Link to="/products" className="btn-primary !px-6 !py-2.5 text-sm">
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-baseline justify-between gap-3 md:mb-7">
        <h1 className="font-serif text-2xl font-semibold text-ink md:text-3xl">My orders</h1>
        {loaded && (
          <p className="text-sm text-ink/60">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </p>
        )}
      </div>

      <ul className="space-y-3">
        {!loaded && Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)}

        {orders.map((o) => {
          const items = o.orderItems || [];
          const extra = items.length - MAX_THUMBS;
          return (
            <li key={o._id}>
              <Link
                to={`/orders/${o._id}`}
                className="block rounded-xl bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 md:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">
                      Order #{o._id.slice(-8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/50">{formatDate(o.createdAt)}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      STATUS_STYLES[o.orderStatus] || "bg-ink/5 text-ink/70"
                    }`}
                  >
                    {o.orderStatus}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-ink/5 pt-3">
                  <div className="flex items-center gap-2">
                    {items.slice(0, MAX_THUMBS).map((it, i) => (
                      <img
                        key={i}
                        src={it.image || PLACEHOLDER}
                        alt=""
                        loading="lazy"
                        className="h-11 w-11 rounded-lg object-cover md:h-12 md:w-12"
                      />
                    ))}
                    {extra > 0 && (
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-ink/5 text-xs font-medium text-ink/60 md:h-12 md:w-12">
                        +{extra}
                      </span>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2 text-right">
                    <div>
                      <p className="text-sm font-semibold text-ink">{inr(o.totalPrice)}</p>
                      <p className="text-xs text-ink/50">
                        {items.length} {items.length === 1 ? "item" : "items"}
                      </p>
                    </div>
                    <FiChevronRight className="text-ink/30" aria-hidden="true" />
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Orders;