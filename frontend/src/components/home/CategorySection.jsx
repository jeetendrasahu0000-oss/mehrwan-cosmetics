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
    <div className="h-[60px] w-[60px] overflow-hidden rounded-full bg-[#ede3d5] ring-1 ring-[#e3d3c0] sm:h-[76px] sm:w-[76px]">
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
    <section className="bg-[#faf7f2] pt-1 pb-2">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="mb-2 flex items-center justify-between">
          <h2 className="my-[10px] font-serif text-xl font-semibold text-[#33251D] md:text-2xl">
            Shop by Category.
          </h2>
          <Link to="/products" className="text-xs font-semibold text-[#79624F] transition hover:text-black">
            View All →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex min-w-[65px] shrink-0 animate-pulse flex-col items-center gap-1.5">
                  <div className="h-[60px] w-[60px] rounded-full bg-[#ede3d5] sm:h-[76px] sm:w-[76px]" />
                  <div className="h-3 w-14 rounded bg-[#ede3d5]" />
                </div>
              ))
            : categories.map((category, index) => {
                const name = category.name || category.categoryName || category.title;

                return (
                  <Link
                    key={category._id || index}
                    /* ✅ FIX: URL mein ID bheji jaa rahi hai, Name nahi */
                    to={`/products?category=${encodeURIComponent(category._id)}`}
                    className="group flex min-w-[65px] shrink-0 flex-col items-center gap-1"
                  >
                    <CategoryAvatar name={name} image={category.image} />
                    <span className="max-w-[85px] truncate text-center text-[11px] font-medium text-[#33251D] sm:text-xs">
                      {name}
                    </span>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;