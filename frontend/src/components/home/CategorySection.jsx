import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productAPI } from "../../services/productService";
import { 
  FiDroplet, FiSun, FiFeather, FiStar, FiHeart
} from "react-icons/fi";
import { GiLipstick, GiFlowerPot } from "react-icons/gi";

// ✅ Icons ka size badhaya (32) aur strokeWidth (2) se bold kiya
const getCategoryIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes("skin")) return <FiDroplet size={32} strokeWidth={2} />;
  if (n.includes("makeup") || n.includes("lip")) return <GiLipstick size={32} />;
  if (n.includes("body")) return <FiFeather size={32} strokeWidth={2} />;
  if (n.includes("hair")) return <FiSun size={32} strokeWidth={2} />;
  if (n.includes("fragrance") || n.includes("perfume")) return <GiFlowerPot size={32} />;
  if (n.includes("care")) return <FiHeart size={32} strokeWidth={2} />;
  return <FiStar size={32} strokeWidth={2} />; 
};

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    productAPI
      .getCategories()
      .then((res) => active && setCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  if (loaded && categories.length === 0) return null;

  return (
    <section className="w-full bg-[#faf7f2] py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        <div 
          className="flex items-start gap-6 md:gap-10 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
        >
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          
          <div className="flex items-start gap-6 md:gap-10 hide-scrollbar">
            {!loaded &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-3 shrink-0 w-20">
                  <div className="w-[72px] h-[72px] md:w-24 md:h-24 rounded-full bg-ink/5 animate-pulse" />
                  <div className="w-12 h-3 bg-ink/5 rounded animate-pulse" />
                </div>
              ))}

            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="flex flex-col items-center gap-3 shrink-0 group focus-visible:outline-none"
              >
                {/* Circle ki size same hai (w-[72px] h-[72px] md:w-24 md:h-24) */}
                <div className="w-[72px] h-[72px] md:w-24 md:h-24 rounded-full bg-[#ede3d5] flex items-center justify-center text-[#4A6B4A] 
                                shadow-[inset_0_-3px_6px_rgba(0,0,0,0.04)] transition-all duration-300 
                                group-hover:bg-[#e3d5c3] group-hover:shadow-[inset_0_-3px_6px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] 
                                group-hover:-translate-y-1">
                  {getCategoryIcon(c.name)}
                </div>
                
                <span className="text-[13px] md:text-sm font-semibold text-ink/75 group-hover:text-ink transition-colors">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategorySection;