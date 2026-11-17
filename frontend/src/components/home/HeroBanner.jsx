import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
      .then((res) => {
        if (active) {
          setBanners(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((err) => console.error("Error fetching banners:", err))
      .finally(() => {
        if (active) setLoaded(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const list = banners.length ? banners : [FALLBACK_BANNER];
  const count = list.length;

  useEffect(() => {
    if (count <= 1 || paused || reduce) return;

    const timer = setTimeout(() => {
      setIndex((current) => (current + 1) % count);
    }, INTERVAL);

    return () => clearTimeout(timer);
  }, [index, count, paused, reduce]);

  const go = (nextIndex) => {
    setIndex((nextIndex + count) % count);
  };

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchX.current === null) return;

    const dx = e.changedTouches[0].clientX - touchX.current;
    touchX.current = null;

    if (Math.abs(dx) > 50) {
      go(index + (dx < 0 ? 1 : -1));
    }
  };

  if (!loaded) {
    return (
      <div className="mx-auto w-full max-w-7xl px-3 md:px-8 mt-2 mb-1">
        <div
          className={`w-full ${HEIGHT} animate-pulse rounded-2xl bg-[#f1e3d6]/50`}
        />
      </div>
    );
  }

  const banner = list[index] || list[0];

  return (
    <div className="mx-auto w-full max-w-7xl px-3 md:px-8 mt-2 mb-1">
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
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={banner.image || FALLBACK_IMAGE}
              alt="Mehrwan Banner"
              className="h-full w-full object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>

        {/* Slider dots removed */}
      </section>
    </div>
  );
};

export default HeroBanner;