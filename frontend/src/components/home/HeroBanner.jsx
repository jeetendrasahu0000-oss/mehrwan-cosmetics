import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import API from "../../services/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1617897903246-719242758050?w=1600&q=80";

const FALLBACK_BANNER = {
  image: FALLBACK_IMAGE,
  link: "/products",
};

const INTERVAL = 5000; 
const HEIGHT = "h-[220px] sm:h-[280px] md:h-[320px] lg:h-[360px]";

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

  if (!loaded) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-3 mb-6">
         <div className={`w-full ${HEIGHT} rounded-2xl bg-[#f1e3d6]/50 animate-pulse`} />
      </div>
    );
  }

  const banner = list[index] || list[0];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-4 mb-8">
      <section
        aria-label="Featured Offers"
        className={`relative w-full ${HEIGHT} overflow-hidden rounded-2xl bg-[#f1e3d6] shadow-sm`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.6 }}
            className="absolute inset-0"
          >
            {/* ✅ Image (Bina kisi gradient/shadow ke) */}
            <img
              src={banner.image || FALLBACK_IMAGE}
              alt="Mehrwan Banner"
              className="h-full w-full object-cover object-center"
            />



          </motion.div>
        </AnimatePresence>

        {/* Dots / Indicators */}
        {count > 1 && (
          <div className="absolute inset-x-0 bottom-16 z-20 flex justify-center gap-1">
            {list.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="group p-1 focus-visible:outline-none"
              >
                <span
                  className={`block h-1 rounded-full transition-all duration-300 ${
                    i === index ? "w-5 bg-white" : "w-1.5 bg-white/50 group-hover:bg-white/80"
                  }`}
                />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HeroBanner;