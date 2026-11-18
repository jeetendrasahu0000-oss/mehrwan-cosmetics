import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronDown, FiShoppingBag } from "react-icons/fi";

import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/common/ProductCard";
import ProductFilters from "../components/product/ProductFilters";
import Pagination from "../components/common/Pagination";
import Loader from "../components/common/Loader";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { products, page, pages, total, loading } = useSelector(
    (s) => s.products
  );

  const [sort, setSort] = useState(searchParams.get("sort") || "popular");

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
    <main className="min-h-screen bg-[#faf7f2]">

      <div className="mx-auto max-w-7xl px-4 py-7 md:px-8 md:py-12">

        
       

        {/* Products Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[245px_1fr] lg:gap-8">

          {/* Filters */}
          <aside>
            <ProductFilters />
          </aside>

          {/* Product Listing */}
          <section className="min-w-0">
            {/* Product Grid */}
            {loading ? (
              <div className="flex min-h-[350px] items-center justify-center">
                <Loader />
              </div>
            ) : products.length === 0 ? (
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#33251D]/15 bg-white px-5 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f5efe6] text-[#8e705c]">
                  <FiShoppingBag size={23} />
                </div>

                <h3 className="text-lg font-semibold text-[#33251D]">
                  No Products Found
                </h3>

                <p className="mt-2 max-w-xs text-xs leading-5 text-[#9b897c]">
                  We couldn't find products matching your selected filters.
                  Try changing your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-3 lg:gap-x-6">
                {products.map((p, i) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && pages > 1 && (
              <div className="mt-10 border-t border-[#33251D]/10 pt-6">
                <Pagination
                  page={page}
                  pages={pages}
                  onChange={handlePageChange}
                />
              </div>
            )}

          </section>
        </div>
      </div>
    </main>
  );
};

export default Products;