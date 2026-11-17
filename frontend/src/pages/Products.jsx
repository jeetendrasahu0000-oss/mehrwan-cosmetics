import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/common/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { products, page, pages, total, loading } = useSelector((s) => s.products);
  const [sort, setSort] = useState(searchParams.get("sort") || "");

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    dispatch(fetchProducts({ ...params, sort: sort || params.sort }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams, sort, dispatch]);

  const handlePageChange = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", p);
    setSearchParams(next);
  };

  const handleSort = (val) => {
    setSort(val);
    const next = new URLSearchParams(searchParams);
    if (val) next.set("sort", val);
    else next.delete("sort");
    next.delete("page");
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-blush-600 font-semibold mb-2">Shop</p>
        <h1 className="section-title font-semibold">All Products</h1>
        <p className="text-sm text-ink/50 mt-2">{total} products available</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <ProductFilters />

        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-ink/50">{loading ? "Loading…" : `${products.length} shown`}</p>
            <select
              value={sort}
              onChange={(e) => handleSort(e.target.value)}
              className="border border-ink/15 rounded-full px-4 py-2 text-sm bg-white outline-none focus:border-ink"
            >
              <option value="">Newest</option>
              <option value="popular">Popularity</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>

          {loading ? (
            <Loader />
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-ink/40">No products found matching your filters.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          )}

          <Pagination page={page} pages={pages} onChange={handlePageChange} />
        </div>
      </div>
    </div>
  );
};

export default Products;