
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiFilter, FiX, FiChevronDown } from "react-icons/fi";
import { productAPI } from "../../services/productService";

const INITIAL_FILTERS = {
  category: "",
  minPrice: "",
  maxPrice: "",
  skinType: "",
  rating: "",
};

const ProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [open, setOpen] = useState({
    category: true,
    price: true,
    skin: true,
    rating: true,
  });

  const [draft, setDraft] = useState(INITIAL_FILTERS);

  // Load categories
  useEffect(() => {
    productAPI
      .getCategories()
      .then((res) => {
        setCategories(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => console.error("Category error:", err));
  }, []);

  // Sync URL filters with draft filters
  useEffect(() => {
    setDraft({
      category: searchParams.get("category") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      skinType: searchParams.get("skinType") || "",
      rating: searchParams.get("rating") || "",
    });
  }, [searchParams]);

  const toggle = (key) => {
    setOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const updateDraft = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Apply filters to URL
  const applyFilters = () => {
    const next = new URLSearchParams(searchParams);

    Object.entries(draft).forEach(([key, value]) => {
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
    });

    next.delete("page");

    setSearchParams(next);
    setMobileOpen(false);
  };

  // Clear filters
  const clearFilters = () => {
    setDraft(INITIAL_FILTERS);

    const next = new URLSearchParams(searchParams);

    Object.keys(INITIAL_FILTERS).forEach((key) => {
      next.delete(key);
    });

    next.delete("page");

    setSearchParams(next);
  };

  const activeCount = Object.values(draft).filter(Boolean).length;

  // Reusable Filter Section
  const Section = ({ title, sectionKey, children }) => (
    <div className="mb-5 border-b border-ink/10 pb-5 last:border-0">
      <button
        type="button"
        onClick={() => toggle(sectionKey)}
        className="flex w-full items-center justify-between text-sm font-semibold tracking-wide text-ink"
      >
        {title}

        <FiChevronDown
          className={`text-ink/50 transition-transform duration-300 ${
            open[sectionKey] ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open[sectionKey] && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Filter Content
  const FilterContent = () => (
    <>
      {/* Category */}
      <Section title="Category" sectionKey="category">
        <button
          type="button"
          onClick={() => updateDraft("category", "")}
          className={`block w-full py-1 text-left text-sm ${
            !draft.category
              ? "font-semibold text-ink"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          All Categories
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category._id}
            onClick={() => updateDraft("category", category._id)}
            className={`block w-full py-1 text-left text-sm ${
              draft.category === category._id
                ? "font-semibold text-ink"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            {category.name}
          </button>
        ))}
      </Section>

      {/* Price */}
      <Section title="Price Range" sectionKey="price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min ₹"
            value={draft.minPrice}
            onChange={(e) =>
              updateDraft("minPrice", e.target.value)
            }
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-ink"
          />

          <span className="text-ink/40">–</span>

          <input
            type="number"
            min="0"
            placeholder="Max ₹"
            value={draft.maxPrice}
            onChange={(e) =>
              updateDraft("maxPrice", e.target.value)
            }
            className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>
      </Section>

      {/* Skin Type */}
      <Section title="Skin Type" sectionKey="skin">
        {["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"].map(
          (skin) => (
            <button
              type="button"
              key={skin}
              onClick={() =>
                updateDraft(
                  "skinType",
                  skin === "All" || draft.skinType === skin ? "" : skin
                )
              }
              className={`block w-full py-1 text-left text-sm ${
                (skin === "All" && !draft.skinType) ||
                draft.skinType === skin
                  ? "font-semibold text-ink"
                  : "text-ink/60 hover:text-ink"
              }`}
            >
              {skin}
            </button>
          )
        )}
      </Section>

      {/* Rating */}
      <Section title="Customer Rating" sectionKey="rating">
        {[4, 3, 2, 1].map((rating) => (
          <button
            type="button"
            key={rating}
            onClick={() =>
              updateDraft(
                "rating",
                draft.rating === String(rating)
                  ? ""
                  : String(rating)
              )
            }
            className={`block w-full py-1 text-left text-sm ${
              draft.rating === String(rating)
                ? "font-semibold text-ink"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <span className="text-[#C69B42]">
              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}
            </span>{" "}
            & above
          </button>
        ))}
      </Section>
    </>
  );

  return (
    <>
      {/* MOBILE FILTER BUTTON */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm lg:hidden"
      >
        <span className="flex items-center gap-2">
          <FiFilter size={18} />
          Filters

          {activeCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 text-[10px] text-white">
              {activeCount}
            </span>
          )}
        </span>

        <span className="text-xs font-medium text-ink/50">
          Filter & Sort
        </span>
      </button>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden h-fit rounded-2xl bg-white p-6 lg:sticky lg:top-24 lg:block">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold">
            Filters
          </h3>

          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-ink/60 hover:text-ink"
            >
              Clear All
            </button>
          )}
        </div>

        <FilterContent />

        <button
          type="button"
          onClick={applyFilters}
          className="w-full rounded-full bg-[#33251D] py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          Apply Filters
        </button>
      </aside>

      {/* MOBILE BOTTOM DRAWER */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{
                type: "spring",
                damping: 28,
                stiffness: 220,
              }}
              className="fixed bottom-0 left-0 right-0 z-[90] flex max-h-[85dvh] flex-col rounded-t-3xl bg-[#f5efe6] shadow-2xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="shrink-0 border-b border-ink/10 px-5 pb-4 pt-3">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink/20" />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-ink">
                      Filters
                    </h3>

                    <p className="mt-1 text-xs text-ink/50">
                      Find your perfect beauty essentials
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink"
                    aria-label="Close filters"
                  >
                    <FiX size={19} />
                  </button>
                </div>
              </div>

              {/* Scrollable Filter Content */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                <FilterContent />
              </div>

              {/* Bottom Buttons */}
              <div className="flex shrink-0 gap-3 border-t border-ink/10 bg-[#f5efe6] px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-4">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex-1 rounded-full border border-ink/20 bg-white py-3 text-sm font-semibold text-ink"
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={applyFilters}
                  className="flex-[1.5] rounded-full bg-[#33251D] py-3 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Apply Filters
                  {activeCount > 0 && ` (${activeCount})`}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductFilters;
