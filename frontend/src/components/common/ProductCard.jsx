import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { toggleWishlist } from "../../redux/slices/wishlistSlice";
import Rating from "./Rating";

const ProductCard = ({ product, index = 0 }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const wishlist = useSelector((s) => s.wishlist.wishlist.products || []);

  const inWishlist = wishlist.some(
    (p) => (p._id || p) === product._id
  );

  const price = product.discountPrice || product.price;
  const hasDiscount =
    product.discountPrice > 0 &&
    product.discountPrice < product.price;

  const discountPct = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return navigate("/login");

    await dispatch(addToCart({ productId: product._id, qty: 1 }));
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) return navigate("/login");

    await dispatch(toggleWishlist(product._id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
      className="h-full"
    >
      <Link
        to={`/product/${product._id}`}
        className="group block h-full"
      >
        {/* Product Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#f5efe6]">

          <img
            src={
              product.images?.[0] ||
              "https://placehold.co/600x750/f5efe6/33251D?text=Mehrwan"
            }
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Discount Badge */}
          {hasDiscount && (
            <span className="absolute left-3 top-3 rounded-full bg-[#33251D] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
              {discountPct}% OFF
            </span>
          )}

          {/* Wishlist & Cart */}
          <div className="absolute right-3 top-3 flex flex-col gap-2 sm:translate-x-3 sm:opacity-0 sm:transition-all sm:duration-300 sm:group-hover:translate-x-0 sm:group-hover:opacity-100">

            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                inWishlist
                  ? "bg-[#33251D] text-white"
                  : "bg-white/95 text-[#33251D] hover:bg-[#33251D] hover:text-white"
              }`}
            >
              <FiHeart
                size={16}
                fill={inWishlist ? "currentColor" : "none"}
              />
            </button>

            <button
              onClick={handleAddToCart}
              aria-label="Add to cart"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#33251D] shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-[#33251D] hover:text-white"
            >
              <FiShoppingBag size={16} />
            </button>
          </div>
        </div>

        {/* Product Details */}
        <div className="px-0.5 pt-3.5">

        

          <h3 className="mt-1.5 line-clamp-2 min-h-[40px] text-[13px] font-semibold leading-5 text-[#33251D] transition-colors duration-300 group-hover:text-[#94715d] sm:text-[14px]">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1.5">
            <Rating value={product.rating} size={12} />
            
          </div>

          {/* Price */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold text-[#33251D]">
              ₹{Number(price).toLocaleString("en-IN")}
            </span>

            {hasDiscount && (
              <>
                <span className="text-xs text-[#a99a8e] line-through">
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>

                <span className="rounded-md bg-[#f2e5d9] px-1.5 py-0.5 text-[9px] font-bold text-[#8b5941]">
                  Save {discountPct}%
                </span>
              </>
            )}
          </div>

        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;