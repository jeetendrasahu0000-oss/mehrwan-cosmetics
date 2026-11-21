import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiLoader } from "react-icons/fi";
import { productAPI } from "../../services/productService";
import ProductCard from "../common/ProductCard";

const PAGE_SIZE = 6;

const ProductSkeleton = () => (
  <div className="w-[42%] shrink-0 sm:w-[30%] md:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]">
    <div className="animate-pulse">
      <div className="aspect-[4/5] rounded-xl bg-[#f5efe6]" />
      <div className="mt-2 h-3 w-3/4 rounded bg-[#f5efe6]" />
      <div className="mt-2 h-3 w-1/2 rounded bg-[#f5efe6]" />
    </div>
  </div>
);

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollRef = useRef(null);
  const loadingRef = useRef(false);
  const hasAutoScrolled = useRef(false);
  const rafRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchProducts = useCallback(async (pageNumber = 1) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (pageNumber === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await productAPI.getAll({
        sort: "popular",
        page: pageNumber,
        limit: PAGE_SIZE,
      });

      const responseData = res.data;
      const newProducts = Array.isArray(responseData)
        ? responseData
        : responseData?.products || [];

      setProducts((previous) => {
        if (pageNumber === 1) return newProducts;
        const existingIds = new Set(previous.map((p) => p._id));
        return [
          ...previous,
          ...newProducts.filter((p) => !existingIds.has(p._id)),
        ];
      });

      const pagination = responseData?.pagination;
      if (pagination) {
        setHasMore(pagination.currentPage < pagination.totalPages);
      } else {
        setHasMore(newProducts.length === PAGE_SIZE);
      }

      setPage(pageNumber);
    } catch (error) {
      console.error("Best sellers error:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  /* Auto Scroll */
  useEffect(() => {
    if (!loading && products.length > 0 && !hasAutoScrolled.current) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          const container = scrollRef.current;
          const cardWidth = container.firstChild?.clientWidth || 0;
          const gap = 12; 
          container.scrollTo({ left: cardWidth + gap, behavior: "smooth" });
          hasAutoScrolled.current = true;
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, products]);

  /* Throttled Scroll */
  const handleScroll = () => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const container = scrollRef.current;
      if (!container) return;

      const remaining =
        container.scrollWidth - container.scrollLeft - container.clientWidth;

      if (remaining < 500 && hasMore && !loadingRef.current) {
        loadMoreDebounced();
      }
    });
  };

  /* Debounced Load More */
  const loadMoreDebounced = useCallback(() => {
    if (debounceRef.current) return;

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      if (loadingRef.current || !hasMore) return;
      fetchProducts(page + 1);
    }, 150);
  }, [fetchProducts, hasMore, page]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-white pt-3 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink md:text-2xl">
              Best Sellers<span className="text-blush-500">.</span>
            </h2>
          </div>
          <Link
            to="/products?sort=popular"
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink transition hover:text-blush-600"
          >
            View All <FiArrowRight size={14} />
          </Link>
        </div>

        {/* 
          ✅ snap classes hata di
          ✅ overscroll-x-contain aur touch-pan-y add kiya 
        */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex gap-3 overflow-x-auto pb-2 pr-1 overscroll-x-contain touch-pan-y md:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))
          ) : (
            products.map((product, index) => (
              <div
                key={product._id || index}
                className="w-[42%] shrink-0 sm:w-[30%] md:w-[calc(33.333%-11px)] lg:w-[calc(20%-13px)]"
              >
                <ProductCard product={product} index={index} />
              </div>
            ))
          )}

          {loadingMore &&
            Array.from({ length: 3 }).map((_, i) => (
              <ProductSkeleton key={`loading-${i}`} />
            ))}

          <div className="w-1 shrink-0 md:hidden" />
        </div>

        {loadingMore && (
          <div className="flex justify-center py-2">
            <FiLoader className="animate-spin text-blush-500" size={18} />
          </div>
        )}
      </div>
    </section>
  );
};

export default BestSellers;