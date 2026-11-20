import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";
import API from "../../services/api";

// Fallback Data
const FALLBACK_COLLECTIONS = [
  {
    _id: "1",
    title: "The Glow Ritual",
    subtitle: "SKINCARE COLLECTION",
    desc: "Serums & essences for luminous, naturally radiant skin.",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=85",
    link: "/products",
  },
  {
    _id: "2",
    title: "Velvet Lips",
    subtitle: "LIP CARE COLLECTION",
    desc: "Discover rich shades and luxurious long-wear lip colour.",
    image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1200&q=85",
    link: "/products",
  },
  {
    _id: "3",
    title: "Body Care Essentials",
    subtitle: "BODY COLLECTION",
    desc: "Nourishing lotions and scrubs for soft, glowing skin.",
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1200&q=85",
    link: "/products",
  },
];

const FeaturedCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // Hover/Touch par pause karne ke liye

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    API.get("/banners?type=collection")
      .then((res) => {
        const data = res.data && res.data.length > 0 ? res.data : FALLBACK_COLLECTIONS;
        setCollections(data);
      })
      .catch(() => setCollections(FALLBACK_COLLECTIONS))
      .finally(() => setLoaded(true));
  }, []);

  // ✅ AUTO SCROLL LOGIC (Har 2 second me)
  useEffect(() => {
    if (isPaused || collections.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Agar 2 cards dikh rahe hain (desktop), to last se ek pehle ruk jao
        const maxIndex = window.innerWidth >= 768 ? collections.length - 2 : collections.length - 1;
        return prevIndex >= maxIndex ? 0 : prevIndex + 1;
      });
    }, 2000); // 2000ms = 2 seconds

    return () => clearInterval(interval);
  }, [collections, isPaused]);

  // ✅ SWIPE (Hand Scroll) LOGIC
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true); // Swipe karte waqt auto-scroll pause
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => Math.min(prev + 1, collections.length - 1));
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }

    // Swipe ke baad thodi der pause karke wapas auto start
    setTimeout(() => setIsPaused(false), 3000);
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!loaded) return null;

  return (
    <section className="overflow-hidden bg-[#F5EFE6] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        {/* Section Heading */}
        <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
          <div>
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.3em] text-blush-600">
              Explore our world
            </span>
            <h2 className="font-serif text-2xl font-semibold text-ink md:text-3xl">
              Featured Collections<span className="text-blush-500">.</span>
            </h2>
          </div>
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-ink/40 sm:block">
            Curated beauty essentials
          </span>
        </div>

        {/* ✅ Slider Container */}
        <div 
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <motion.div 
            className="flex gap-4 md:gap-6 transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(calc(-${currentIndex} * (100% / ${window.innerWidth >= 768 ? 2 : 1})))` }}
          >
            {collections.map((collection) => (
              <div key={collection._id} className="w-full md:w-1/2 shrink-0">
                <Link
                  to={collection.link || "/products"}
                  className="group relative block aspect-[5/4] overflow-hidden rounded-2xl bg-[#D8C9B8] md:aspect-[4/3]"
                >
                  <img
                    src={collection.image}
                    alt={collection.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-[#211711]/75 via-[#211711]/30 to-transparent transition-opacity duration-500 group-hover:from-[#211711]/80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                  <div className="absolute inset-y-0 left-0 flex max-w-[85%] flex-col justify-center px-6 py-7 sm:max-w-[75%] md:px-9 lg:px-11">
                    <span className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#E9D4BF] md:text-[10px]">
                      {collection.subtitle || "COLLECTION"}
                    </span>

                    <h3 className="font-serif text-3xl font-medium leading-tight text-white sm:text-4xl lg:text-[42px]">
                      {collection.title}
                    </h3>

                    <p className="mt-3 max-w-[260px] text-xs leading-relaxed text-white/75 md:text-sm">
                      {collection.description || "Discover our latest curated beauty essentials."}
                    </p>

                    <div className="mt-6 inline-flex w-fit items-center gap-3 border-b border-white/50 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 group-hover:gap-5 group-hover:border-white md:mt-8">
                      Explore Collection
                      <FiArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ✅ Slider Dots (Navigation) */}
        <div className="mt-6 flex justify-center gap-2">
          {collections.map((_, index) => {
             // Desktop par 2 cards dikhte hain isliye dot count array length - 1 hoga
             const dotCount = window.innerWidth >= 768 ? collections.length - 1 : collections.length;
             if (index >= dotCount) return null;

             return (
               <button
                 key={index}
                 onClick={() => setCurrentIndex(index)}
                 className={`h-1.5 rounded-full transition-all duration-300 ${
                   currentIndex === index ? "w-6 bg-ink" : "w-1.5 bg-ink/20 hover:bg-ink/40"
                 }`}
                 aria-label={`Go to slide ${index + 1}`}
               />
             );
          })}
        </div>

      </div>
    </section>
  );
};

export default FeaturedCollections;