
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiLoader } from "react-icons/fi";

import { productAPI } from "../../services/productService";
import ProductCard from "../common/ProductCard";

const PAGE_SIZE = 6;

// Skeleton Card
const SkeletonCard = () => (
  <div className="w-[42%] shrink-0 animate-pulse sm:w-[30%] lg:w-[calc(20%-16px)]">
    <div className="aspect-[4/5] rounded-xl bg-ink/5" />
    <div className="mt-3 h-3 w-3/4 rounded bg-ink/5" />
    <div className="mt-2 h-3 w-1/3 rounded bg-ink/5" />
  </div>
);

// Throttle
const throttle = (callback, delay) => {
  let lastCall = 0;

  return (...args) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
};

// Debounce
const debounce = (callback, delay) => {
  let timer;

  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };

  debounced.cancel = () => clearTimeout(timer);

  return debounced;
};

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const carouselRef = useRef(null);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  // Fetch New Arrivals
  const fetchProducts = useCallback(async (page = 1) => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;

    if (page === 1) {
      setInitialLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await productAPI.getAll({
        sort: "newest",
        page,
        limit: PAGE_SIZE,
      });

      const newProducts = res.data?.products || [];

      setProducts((prev) => {
        if (page === 1) return newProducts;

        const existingIds = new Set(prev.map((product) => product._id));

        const uniqueProducts = newProducts.filter(
          (product) => !existingIds.has(product._id)
        );

        return [...prev, ...uniqueProducts];
      });

      pageRef.current = page;

      const pagination = res.data?.pagination;

      const moreAvailable = pagination
        ? pagination.hasNextPage ??
          (pagination.totalPages != null
            ? page < pagination.totalPages
            : newProducts.length === PAGE_SIZE)
        : newProducts.length === PAGE_SIZE;

      hasMoreRef.current = moreAvailable;
      setHasMore(moreAvailable);
    } catch (error) {
      console.error("New arrivals loading failed:", error);
    } finally {
      loadingRef.current = false;
      setInitialLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Initial Loading
  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  // Horizontal Infinite Scroll
  const checkHorizontalScroll = useCallback(() => {
    const slider = carouselRef.current;

    if (!slider || loadingRef.current || !hasMoreRef.current) return;

    const remaining =
      slider.scrollWidth - slider.scrollLeft - slider.clientWidth;

    if (remaining < 350) {
      fetchProducts(pageRef.current + 1);
    }
  }, [fetchProducts]);

  useEffect(() => {
    const slider = carouselRef.current;

    if (!slider) return;

    const debouncedCheck = debounce(checkHorizontalScroll, 120);

    const throttledCheck = throttle(() => {
      checkHorizontalScroll();
      debouncedCheck();
    }, 200);

    slider.addEventListener("scroll", throttledCheck, {
      passive: true,
    });

    return () => {
      slider.removeEventListener("scroll", throttledCheck);
      debouncedCheck.cancel();
    };
  }, [checkHorizontalScroll]);

  // Mouse Wheel Horizontal Scrolling
  const handleWheel = (event) => {
    const slider = carouselRef.current;

    if (!slider) return;

    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      slider.scrollLeft += event.deltaY;
    }
  };

  // Hide if no products
  if (!initialLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-blush-50/50 py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">

        {/* Compact Heading */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <span className="mb-1 block text-[9px] font-semibold uppercase tracking-[0.25em] text-blush-600">
              Just arrived
            </span>

            <h2 className="font-serif text-2xl font-semibold text-ink md:text-3xl">
              New Arrivals
              <span className="text-blush-500">.</span>
            </h2>
          </div>

          <Link
            to="/products?sort=newest"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-ink/10 px-4 py-2 text-xs font-semibold text-ink/70 transition-all duration-300 hover:border-blush-500 hover:bg-blush-500 hover:text-white"
          >
            View All
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Horizontal Carousel */}
        <div
          ref={carouselRef}
          onWheel={handleWheel}
          className="flex cursor-grab gap-3 overflow-x-auto scroll-smooth pb-4 active:cursor-grabbing snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:gap-4"
        >
          {/* Initial Skeleton */}
          {initialLoading &&
            Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <SkeletonCard key={`initial-${index}`} />
            ))}

          {/* Products */}
          {products.map((product, index) => (
            <div
              key={product._id}
              className="w-[42%] shrink-0 snap-start animate-[fadeUp_500ms_ease_both] sm:w-[30%] lg:w-[calc(20%-16px)]"
              style={{
                animationDelay: `${(index % PAGE_SIZE) * 150}ms`,
              }}
            >
              <ProductCard product={product} index={index} />
            </div>
          ))}

          {/* Loading More Skeleton */}
          {loadingMore &&
            Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <SkeletonCard key={`loading-${index}`} />
            ))}
        </div>

        {/* Loading Indicator */}
        {loadingMore && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ink/60">
            <FiLoader className="animate-spin text-blush-500" />
            Loading more new arrivals...
          </div>
        )}

        {/* End Message */}
        {!hasMore && products.length > 0 && (
          <p className="mt-6 text-center font-serif text-xs text-ink/50">
            You've seen all our latest arrivals.
          </p>
        )}
      </div>
    </section>
  );
};

export default NewArrivals;
