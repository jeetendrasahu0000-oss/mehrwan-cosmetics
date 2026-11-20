import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiLoader } from "react-icons/fi";
import { productAPI } from "../../services/productService";
import ProductCard from "../common/ProductCard";

const PAGE_SIZE = 6;

const BestSellers = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const scrollRef = useRef(null);
  const loadingRef = useRef(false);
  const hasAutoScrolled = useRef(false); // ✅ Track karega ki auto-scroll ho chuka hai ya nahi

  const fetchProducts = useCallback(async (pageNumber = 1) => {
    if (loadingRef.current) return;

    loadingRef.current = true;

    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

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

        const existingIds = new Set(
          previous.map((product) => product._id)
        );

        return [
          ...previous,
          ...newProducts.filter(
            (product) => !existingIds.has(product._id)
          ),
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

  // ✅ AUTO SCROLL LOGIC (Sirf ek baar chalega)
  useEffect(() => {
    if (!loading && products.length > 0 && !hasAutoScrolled.current) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          const container = scrollRef.current;
          const cardWidth = container.firstChild?.clientWidth || 0;
          const gap = 16; // Tailwind gap-4
          
          // Ek card aage scroll karo
          container.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
          
          // Flag set karo taaki dobara na chale
          hasAutoScrolled.current = true;
        }
      }, 1500); // 1.5 second baad slide hoga

      return () => clearTimeout(timer);
    }
  }, [loading, products]);

  const loadMore = useCallback(() => {
    if (!hasMore || loadingRef.current || loading) return;
    fetchProducts(page + 1);
  }, [hasMore, loading, page, fetchProducts]);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const remaining =
      container.scrollWidth - container.scrollLeft - container.clientWidth;

    if (remaining < 350) {
      loadMore();
    }
  };

  const handleWheel = (event) => {
    const container = scrollRef.current;
    if (!container) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      container.scrollLeft += event.deltaY;
    }
  };

  if (!loading && products.length === 0) return null;

  return (
    <section className="bg-white pt-3 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink md:text-2xl">
              Best Sellers
              <span className="text-blush-500">.</span>
            </h2>
          </div>

          <Link
            to="/products?sort=popular"
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink transition hover:text-blush-600"
          >
            View All
            <FiArrowRight size={14} />
          </Link>
        </div>

        {/* Products Carousel */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          onWheel={handleWheel}
          className="flex cursor-grab snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="w-[42%] shrink-0 animate-pulse sm:w-[30%] lg:w-[calc(20%-13px)]"
                >
                  <div className="aspect-[4/5] rounded-xl bg-[#f5efe6]" />
                  <div className="mt-2 h-3 w-3/4 rounded bg-[#f5efe6]" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-[#f5efe6]" />
                </div>
              ))
            : products.map((product, index) => (
                <div
                  key={product._id || index}
                  className="w-[42%] shrink-0 snap-start animate-[fadeUp_500ms_ease_both] sm:w-[30%] lg:w-[calc(20%-13px)]"
                  style={{
                    animationDelay: `${(index % PAGE_SIZE) * 100}ms`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}

          {loadingMore &&
            Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`loading-${index}`}
                className="w-[42%] shrink-0 animate-pulse sm:w-[30%] lg:w-[calc(20%-13px)]"
              >
                <div className="aspect-[4/5] rounded-xl bg-[#f5efe6]" />
                <div className="mt-2 h-3 w-3/4 rounded bg-[#f5efe6]" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[#f5efe6]" />
              </div>
            ))}
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