import { useEffect, useState } from "react";
import { productAPI } from "../../services/productService";
import ProductCard from "../common/ProductCard";

const SkeletonCard = () => (
  <div className="animate-pulse" aria-hidden="true">
    <div className="aspect-[4/5] rounded-xl bg-ink/5" />
    <div className="mt-3 h-3 w-3/4 rounded bg-ink/5" />
    <div className="mt-2 h-3 w-1/3 rounded bg-ink/5" />
  </div>
);

const TrendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    productAPI
      .getAll({ sort: "rating", limit: 4 })
      .then((res) => {
        if (active) setProducts(res.data?.products || []);
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  // Load ho gaya aur koi product nahi: section chhupa do
  if (loaded && products.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
      <div className="mb-5 text-center md:mb-7">
        <h2 className="font-serif text-2xl font-semibold leading-tight text-ink md:text-3xl">
          Trending now
        </h2>
        <p className="mt-1 text-sm text-ink/60">Top-rated picks on everyone's list.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {!loaded && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

        {products.map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
};

export default TrendingProducts;