import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../../services/api";

const BrandSection = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/products", { params: { limit: 100 } })
      .then((res) => {
        const products = res.data.products || [];
        const brandMap = {};
        products.forEach((p) => {
          if (p.brand && !brandMap[p.brand]) {
            brandMap[p.brand] = {
              name: p.brand,
              image: p.images?.[0] || "https://placehold.co/400x400/f5efe6/2b2422?text=Brand",
            };
          }
        });
        setBrands(Object.values(brandMap));
      })
      .catch((err) => console.error("Brand fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && brands.length === 0) return null;

  return (
    <section className="pt-4 pb-2 bg-[#faf7f2] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        {/* Heading - Reduced margin */}
        <div className="mb-4 flex items-end justify-between">
          <div>
            
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-ink">
              Top Brands<span className="text-blush-500">.</span>
            </h2>
          </div>
          <Link
            to="/brands"
            className="text-xs font-semibold text-[#79624F] hover:text-black transition flex items-center gap-1 pb-1"
          >
            View All <span className="text-[10px]">→</span>
          </Link>
        </div>

        {/* Carousel - Reduced padding */}
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-proximity">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 shrink-0 snap-start animate-pulse">
                  <div className="h-[60px] w-[60px] md:h-[76px] md:w-[76px] rounded-full bg-[#ede3d5]" />
                  <div className="h-3 w-16 rounded bg-[#ede3d5]" />
                </div>
              ))
            : brands.map((brand, i) => (
                <motion.div
                  key={brand.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="shrink-0 snap-start"
                >
                  <Link
                    to={`/products?brand=${encodeURIComponent(brand.name)}`}
                    className="group flex flex-col items-center gap-2 w-[80px] md:w-[90px]"
                  >
                    <div className="h-[60px] w-[60px] md:h-[76px] md:w-[76px] overflow-hidden rounded-full border border-ink/5 bg-white shadow-sm transition-all duration-300 group-hover:border-[#33251D]/20 group-hover:shadow-md">
                      <img
                        src={brand.image}
                        alt={brand.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    
                    <p className="text-center text-[11px] md:text-xs font-semibold text-ink/80 line-clamp-1 w-full group-hover:text-ink transition-colors">
                      {brand.name}
                    </p>
                  </Link>
                </motion.div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default BrandSection;