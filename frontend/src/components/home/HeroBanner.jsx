import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import API from "../../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&q=80";

// Admin ne koi banner add nahi kiya (ya API fail hui) to ye dikhega
const FALLBACK_BANNER = {
  title: "Glow that feels like you.",
  subtitle: "New arrivals",
  image: FALLBACK_IMAGE,
  link: "/products",
};

const DEFAULT_DESC =
  "Clean, cruelty-free beauty essentials made with botanical actives.";

const INTERVAL = 5000; // 5 second: padhne ke liye kaafi time
const HEIGHT = "h-[420px] sm:h-[460px] lg:h-[520px]"; // fixed height = layout shift nahi

const HeroBanner = () => {
  const [banners, setBanners] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let active = true;
    API.get("/banners?type=hero")
      .then((res) => active && setBanners(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("Error fetching banners:", err))
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  const list = banners.length ? banners : [FALLBACK_BANNER];
  const count = list.length;

  // Auto slide: hover/focus par ruke, reduced-motion me band
  // (index dependency hai, to manual click par timer fresh start hota hai)
  useEffect(() => {
    if (count <= 1 || paused || reduce) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => clearTimeout(t);
  }, [index, count, paused, reduce]);

  const go = (i) => setIndex((i + count) % count);

  const onTouchStart = (e) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;
    if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
  };

  // Loading skeleton: same height, text nahi
  if (!loaded) {
    return (
      <div className={`w-full ${HEIGHT} bg-ink`} aria-busy="true">
        <div className="h-full w-full animate-pulse bg-cream/5" />
      </div>
    );
  }

  const banner = list[index] || list[0];

  return (
    <section
      aria-label="Featured offers"
      className={`relative w-full ${HEIGHT} overflow-hidden bg-ink`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background: crossfade (beech me khaali flash nahi) */}
      <AnimatePresence>
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={banner.image || FALLBACK_IMAGE}
            alt=""
            decoding="async"
            onError={(e) => {
              if (e.currentTarget.src !== FALLBACK_IMAGE) e.currentTarget.src = FALLBACK_IMAGE;
            }}
            className="h-full w-full object-cover object-center"
          />
          {/* Mobile: neeche se gradient (text neeche hai), desktop: left se */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-ink/10
                       md:bg-gradient-to-r md:from-ink/80 md:via-ink/40 md:to-transparent"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div
        className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-start
                   justify-end px-4 pb-14 sm:px-6 md:justify-center md:px-8 md:pb-0"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.3 }}
            className="max-w-xl"
          >
            <p className="mb-2 text-xs font-medium tracking-wide text-blush-200 md:mb-3 md:text-sm">
              {banner.subtitle || "New arrivals"}
            </p>

            <h1 className="font-serif text-3xl font-semibold leading-tight text-cream sm:text-4xl lg:text-5xl">
              {banner.title || FALLBACK_BANNER.title}
            </h1>

            <p className="mt-3 line-clamp-2 max-w-md text-sm leading-relaxed text-cream/80 md:text-base">
              {banner.description || DEFAULT_DESC}
            </p>

            <div className="mt-5 flex flex-wrap gap-3 md:mt-6">
              <Link
                to={banner.link || "/products"}
                className="btn-primary border-none bg-cream !px-5 !py-2.5 text-sm text-ink hover:bg-white"
              >
                Shop collection <FiArrowRight />
              </Link>
              <Link
                to="/products?sort=popular"
                className="btn-outline border-cream/50 !px-5 !py-2.5 text-sm text-cream hover:bg-cream hover:text-ink"
              >
                Best sellers
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots (chhote dikhte hain, tap area bada hai) */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center md:bottom-3">
          {list.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className="group p-2 focus-visible:outline-none"
            >
              <span
                className={`block h-1.5 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-cream ${
                  i === index ? "w-6 bg-cream" : "w-1.5 bg-cream/40 group-hover:bg-cream/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroBanner;