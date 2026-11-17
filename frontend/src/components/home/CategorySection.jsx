import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { productAPI } from "../../services/productService";

// Agar database me image na ho to ye fallback images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80", // Skincare
  "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80", // Makeup
  "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80", // Body care
  "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=80", // Fragrances
];

const CARD_RATIO = "aspect-[4/5]";

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    productAPI
      .getCategories()
      .then((res) => {
        if (active) setCategories(Array.isArray(res.data) ? res.data.slice(0, 4) : []);
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  // Load ho gaya aur koi category nahi: poora section chhupa do
  if (loaded && categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <div className="mb-5 flex items-end justify-between gap-4 md:mb-7">
        <div>
          <h2 className="font-serif text-2xl font-semibold leading-tight text-ink md:text-3xl">
            Shop by category
          </h2>
          <p className="mt-1 text-sm text-ink/60">Find what suits your routine.</p>
        </div>
        <Link
          to="/products"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-ink/70 transition-colors hover:text-blush-600"
        >
          View all <FiArrowRight aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {/* Loading skeleton: same size, layout jump nahi hota */}
        {!loaded &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`${CARD_RATIO} animate-pulse rounded-xl bg-ink/5`}
              aria-hidden="true"
            />
          ))}

        {categories.map((c, i) => {
          const fallback = FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];
          return (
            <Link
              key={c._id}
              to={`/products?category=${c._id}`}
              className={`group relative block ${CARD_RATIO} overflow-hidden rounded-xl bg-ink/5
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:ring-offset-2`}
            >
              <img
                src={c.image || fallback}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                }}
                className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-3 md:p-4">
                <h3 className="truncate font-serif text-base font-semibold text-cream md:text-lg">
                  {c.name}
                </h3>
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream/90 text-sm text-ink
                             motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5"
                >
                  <FiArrowRight />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategorySection;