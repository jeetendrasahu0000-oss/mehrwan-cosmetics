import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI } from "../../services/productService";

const ProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState({ category: true, price: true, skin: true, rating: true });

  useEffect(() => {
    productAPI.getCategories().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    setSearchParams(next);
  };

  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const current = (k) => searchParams.get(k) || "";

  const Section = ({ title, k, children }) => (
    <div className="border-b border-ink/10 pb-5 mb-5">
      <button onClick={() => toggle(k)} className="flex w-full items-center justify-between text-sm font-semibold tracking-wide">
        {title}
        <span className="text-ink/40">{open[k] ? "−" : "+"}</span>
      </button>
      {open[k] && <div className="mt-4 space-y-2">{children}</div>}
    </div>
  );

  return (
    <aside className="bg-white rounded-2xl p-6 h-fit lg:sticky lg:top-24">
      <h3 className="font-serif text-xl font-semibold mb-5">Filters</h3>

      <Section title="Category" k="category">
        <button
          onClick={() => updateParam("category", "")}
          className={`block text-sm text-left w-full py-1 ${!current("category") ? "text-blush-700 font-semibold" : "text-ink/60"}`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => updateParam("category", c._id)}
            className={`block text-sm text-left w-full py-1 ${current("category") === c._id ? "text-blush-700 font-semibold" : "text-ink/60 hover:text-ink"}`}
          >
            {c.name}
          </button>
        ))}
      </Section>

      <Section title="Price Range" k="price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={current("minPrice")}
            onChange={(e) => updateParam("minPrice", e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <span className="text-ink/40">–</span>
          <input
            type="number"
            placeholder="Max"
            value={current("maxPrice")}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
            className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>
      </Section>

      <Section title="Skin Type" k="skin">
        {["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"].map((s) => (
          <button
            key={s}
            onClick={() => updateParam("skinType", current("skinType") === s ? "" : s)}
            className={`block text-sm text-left w-full py-1 ${current("skinType") === s ? "text-blush-700 font-semibold" : "text-ink/60 hover:text-ink"}`}
          >
            {s}
          </button>
        ))}
      </Section>

      <Section title="Rating" k="rating">
        {[4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => updateParam("rating", current("rating") === String(r) ? "" : String(r))}
            className={`block text-sm text-left w-full py-1 ${current("rating") === String(r) ? "text-blush-700 font-semibold" : "text-ink/60 hover:text-ink"}`}
          >
            {"★".repeat(r)}{"☆".repeat(5 - r)} & above
          </button>
        ))}
      </Section>

      <button
        onClick={() => setSearchParams({})}
        className="w-full mt-2 text-sm text-blush-700 font-medium hover:underline"
      >
        Clear all filters
      </button>
    </aside>
  );
};

export default ProductFilters;