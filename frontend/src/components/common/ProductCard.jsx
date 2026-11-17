import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { toggleWishlist } from "../../redux/slices/wishlistSlice";
import Rating from "./Rating";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const wishlist = useSelector((s) => s.wishlist.wishlist.products || []);
  const inWishlist = wishlist.some((p) => (p._id || p) === product._id);

  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice > 0;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    await dispatch(addToCart({ productId: product._id, qty: 1 }));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    await dispatch(toggleWishlist(product._id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-nude-50 aspect-[4/5]">
          <img
            src={product.images?.[0] || "https://placehold.co/600x750/fbeae5/2b2422?text=Mehrwan"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 bg-blush-500 text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full">
              {discountPct}% off
            </span>
          )}

          {/* Quick actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            <button
              onClick={handleWishlist}
              className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                inWishlist ? "bg-blush-500 text-white" : "bg-white/90 text-ink hover:bg-ink hover:text-cream"
              }`}
              aria-label="Wishlist"
            >
              <FiHeart size={15} fill={inWishlist ? "currentColor" : "none"} />
            </button>
            <button
              onClick={handleAddToCart}
              className="w-9 h-9 rounded-full bg-white/90 text-ink flex items-center justify-center hover:bg-ink hover:text-cream transition-colors"
              aria-label="Add to cart"
            >
              <FiShoppingBag size={15} />
            </button>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-[11px] uppercase tracking-widest text-ink/40 font-medium">
            {product.brand}
          </p>
          <h3 className="mt-1 text-sm md:text-[15px] font-semibold text-ink leading-snug line-clamp-2 group-hover:text-blush-700 transition-colors">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5">
            <Rating value={product.rating} size={12} />
            <span className="text-[11px] text-ink/40">({product.numReviews || 0})</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-semibold text-ink">₹{price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-xs text-ink/40 line-through">₹{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;