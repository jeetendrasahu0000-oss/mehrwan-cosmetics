import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus, FiEdit, FiTrash2, FiMoreVertical, FiSearch,
  FiRefreshCw, FiFilter, FiStar, FiX, FiPackage, FiChevronDown,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";
import { productAPI } from "../../services/productService";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ---------- Row action menu (3 dots) ---------- */
const RowMenu = ({ product, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More actions"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
          open ? "bg-ink/10 text-ink" : "text-ink/50 hover:bg-ink/5 hover:text-ink"
        }`}
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-lg border border-ink/10 bg-white py-1 shadow-lg shadow-ink/5"
        >
          <Link
            to={`/admin/products/edit/${product._id}`}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-xs text-ink/80 transition hover:bg-ink/5"
          >
            <FiEdit className="h-3.5 w-3.5" /> Edit product
          </Link>
         
          <div className="my-1 h-px bg-ink/8" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete(product._id);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 transition hover:bg-red-50"
          >
            <FiTrash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ---------- Status pill ---------- */
const StatusPill = ({ featured }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
      featured ? "bg-blush-100 text-blush-700" : "bg-ink/5 text-ink/50"
    }`}
  >
    {featured && <FiStar className="h-2.5 w-2.5" />}
    {featured ? "Featured" : "Normal"}
  </span>
);

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // all | featured | low | out
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await productAPI.getAll({ limit: 100 });
      setProducts(res.data.products);
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load(true);
    setTimeout(() => setRefreshing(false), 400);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await adminAPI.deleteProduct(id);
    load(true);
  };

  /* ---------- Filtering ---------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        p.brand?.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" ||
        (filter === "featured" && p.isFeatured) ||
        (filter === "low" && p.stock > 0 && p.stock <= 10) ||
        (filter === "out" && p.stock === 0);
      return matchesQuery && matchesFilter;
    });
  }, [products, query, filter]);

  const FILTERS = [
    { key: "all", label: "All" },
    { key: "featured", label: "Featured" },
    { key: "low", label: "Low stock" },
    { key: "out", label: "Out of stock" },
  ];

  return (
    <div className="space-y-4">
      {/* ---------- Header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-serif text-xl font-semibold text-ink sm:text-2xl md:text-3xl">
            Products
          </h1>
          <p className="mt-0.5 text-[11px] text-ink/50 sm:text-sm">
            {products.length} total · {filtered.length} showing
          </p>
        </div>
        <Link
          to="/admin/products/add"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-xs font-medium text-white transition hover:bg-ink/90 sm:text-sm"
        >
          <FiPlus className="h-4 w-4" /> Add product
        </Link>
      </div>

      {/* ---------- Search + Filter toolbar ---------- */}
      <div className="rounded-xl bg-white p-2.5 ring-1 ring-ink/8 sm:p-3">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or brand…"
              className="w-full rounded-lg border border-ink/12 bg-white py-2 pl-9 pr-8 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-ink/40 hover:bg-ink/5 hover:text-ink"
              >
                <FiX className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            aria-label="Refresh list"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink/12 text-ink/60 transition hover:bg-ink/5 hover:text-ink"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filter chips */}
        <div className="-mx-0.5 mt-2.5 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition ${
                  active
                    ? "bg-ink text-white"
                    : "bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink"
                }`}
              >
                {f.key !== "all" && <FiFilter className="h-2.5 w-2.5" />}
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---------- Loading ---------- */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white ring-1 ring-ink/8" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-14 text-center ring-1 ring-ink/8">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink/5 text-ink/40">
            <FiPackage className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-ink">No products found</p>
          <p className="mt-1 text-xs text-ink/50">
            {query || filter !== "all" ? "Try a different search or filter." : "Add your first product to get started."}
          </p>
          {(query || filter !== "all") && (
            <button
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="mt-4 text-xs font-medium text-ink underline-offset-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ---------- Mobile: card list ---------- */}
          <ul className="space-y-2 md:hidden">
            {filtered.map((p) => (
              <li key={p._id} className="rounded-xl bg-white p-3 ring-1 ring-ink/8">
                <div className="flex items-start gap-3">
                  <img
                    src={p.images?.[0]}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-lg bg-ink/5 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-[13px] font-medium leading-snug text-ink">
                          {p.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] text-ink/50">
                          {p.brand || "—"}
                        </p>
                      </div>
                      <RowMenu product={p} onDelete={handleDelete} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                      <span className="font-semibold text-ink">
                        {inr(p.discountPrice || p.price)}
                      </span>
                      <span className="text-ink/50">Stock: {p.stock}</span>
                      <StatusPill featured={p.isFeatured} />
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* ---------- Desktop: table ---------- */}
          <div className="hidden overflow-hidden rounded-xl bg-white ring-1 ring-ink/8 md:block">
            <table className="w-full text-sm">
              <thead className="bg-ink/[0.03] text-left text-[11px] uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Product</th>
                  <th className="px-4 py-2.5 font-medium">Brand</th>
                  <th className="px-4 py-2.5 font-medium">Price</th>
                  <th className="px-4 py-2.5 font-medium">Stock</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((p) => (
                  <tr key={p._id} className="transition hover:bg-ink/[0.015]">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.images?.[0]}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg bg-ink/5 object-cover"
                        />
                        <span className="line-clamp-1 max-w-[240px] font-medium text-ink">
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-ink/60">{p.brand || "—"}</td>
                    <td className="px-4 py-2.5 font-medium">{inr(p.discountPrice || p.price)}</td>
                    <td className="px-4 py-2.5">
                      <span className={p.stock === 0 ? "text-red-600" : p.stock <= 10 ? "text-yellow-700" : ""}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill featured={p.isFeatured} />
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end">
                        <RowMenu product={p} onDelete={handleDelete} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminProducts;