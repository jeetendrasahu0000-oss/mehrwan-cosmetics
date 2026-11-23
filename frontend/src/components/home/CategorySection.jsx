import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiDroplet,
  FiFeather,
  FiSun,
  FiHeart,
  FiStar,
} from "react-icons/fi";
import { GiLipstick, GiFlowerPot } from "react-icons/gi";
import { productAPI } from "../../services/productService";

const getCategoryIcon = (name) => {
  const value = name?.toLowerCase() || "";
  if (value.includes("skin")) return FiDroplet;
  if (value.includes("makeup") || value.includes("lip")) return GiLipstick;
  if (value.includes("body")) return FiFeather;
  if (value.includes("hair")) return FiSun;
  if (value.includes("fragrance") || value.includes("perfume")) return GiFlowerPot;
  if (value.includes("care")) return FiHeart;
  return FiStar;
};

const CategoryAvatar = ({ name, image }) => {
  const [imgError, setImgError] = useState(false);
  const Icon = getCategoryIcon(name);

  if (!image || imgError) {
    return (
      <div className="flex h-[60px] w-[60px] items-center justify-center rounded-full bg-[#ede3d5] sm:h-[76px] sm:w-[76px]">
        <Icon className="text-[25px] text-[#4A6B4A] sm:text-[29px]" />
      </div>
    );
  }

  return (
    <div className="h-[60px] w-[60px] overflow-hidden rounded-full bg-[#ede3d5] ring-1 ring-[#e3d3c0] sm:h-[76px] sm:w-[76px] shadow-sm">
      <img
        src={image}
        alt={name}
        loading="lazy"
        onError={() => setImgError(true)}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
      />
    </div>
  );
};

const CategorySection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productAPI.getCategories();
        const data = Array.isArray(res.data) ? res.data : res.data?.categories || [];
        setCategories(data);
      } catch (error) {
        console.error("Category fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="pt-4 pb-2 bg-[#faf7f2] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        {/* Heading - Reduced margin */}
        <div className="mb-4 flex items-end justify-between">
          <div>
          
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-ink">
              Explore Categories<span className="text-blush-500">.</span>
            </h2>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-[#79624F] hover:text-black transition flex items-center gap-1 pb-1"
          >
            View All <span className="text-[10px]">→</span>
          </Link>
        </div>

        {/* Carousel - Reduced padding */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-proximity">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-2 shrink-0 snap-start animate-pulse">
                  <div className="h-[60px] w-[60px] md:h-[76px] md:w-[76px] rounded-full bg-[#ede3d5]" />
                  <div className="h-3 w-16 rounded bg-[#ede3d5]" />
                </div>
              ))
            : categories.map((category, index) => {
                const name = category.name || category.categoryName || category.title;

                return (
                  <div
                    key={category._id || index}
                    className="shrink-0 snap-start"
                  >
                    <Link
                      to={`/products?category=${encodeURIComponent(category._id)}`}
                      className="group flex flex-col items-center gap-2 w-[80px] md:w-[90px]"
                    >
                      <CategoryAvatar name={name} image={category.image} />
                      <span className="text-center text-[11px] md:text-xs font-semibold text-ink/80 line-clamp-1 w-full group-hover:text-ink transition-colors">
                        {name}
                      </span>
                    </Link>
                  </div>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;