import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiHeart, FiShoppingBag, FiMinus, FiPlus, FiChevronRight,
} from "react-icons/fi";
import { productAPI } from "../services/productService";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist } from "../redux/slices/wishlistSlice";
import Rating from "../components/common/Rating";
import ProductCard from "../components/common/ProductCard";
import Loader from "../components/common/Loader";
import ReviewSection from "../components/product/ReviewSection";

const PLACEHOLDER = "https://placehold.co/800x800/fbeae5/2b2422?text=Mehrwan";
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const stepBtn =
  "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink/5 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 " +
  "disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlist = useSelector((s) => s.wishlist.wishlist.products || []);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setQty(1);
    window.scrollTo(0, 0);

    productAPI.getById(id)
      .then((res) => {
        if (!active) return;
        setProduct(res.data);
        setActiveImg(0);
        
        if (res.data.variants && res.data.variants.length > 0) {
          setSelectedVariant(res.data.variants[0]);
        }
        
        productAPI.getRelated(id)
          .then((r) => active && setRelated(r.data || []))
          .catch(() => active && setRelated([]));
      })
      .catch(() => active && navigate("/products"))
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [id, navigate]);

  if (loading) return <Loader />;
  if (!product) return null;

  // ✅ Price Calculation
  const basePrice = product.discountPrice || product.price;
  const extraPrice = selectedVariant?.priceAdjustment || 0;
  const finalPrice = basePrice + extraPrice;

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPct = hasDiscount ? Math.round(((product.price - basePrice) / product.price) * 100) : 0;
  
  const inWishlist = wishlist.some((p) => (p._id || p) === product._id);
  const outOfStock = !product.stock || product.stock <= 0;
  const images = product.images || [];

  const handleAdd = async () => {
    if (!user) return navigate("/login");
    setAdding(true);
    try {
      const variantString = selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : "";
      const fullProductName = variantString ? `${product.name} (${variantString})` : product.name;
      
      await dispatch(addToCart({ 
        productId: product._id, 
        qty, 
        variant: variantString,
        productName: fullProductName 
      }));
    } finally {
      setAdding(false);
    }
  };

  const handleWish = async () => {
    if (!user) return navigate("/login");
    await dispatch(toggleWishlist(product._id));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8 bg-[#faf7f2]">
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-ink/50 md:mb-6">
        <Link to="/" className="hover:text-ink">Home</Link>
        <FiChevronRight size={12} aria-hidden="true" />
        <Link to="/products" className="hover:text-ink">Shop</Link>
        <FiChevronRight size={12} aria-hidden="true" />
        <span className="max-w-[140px] truncate text-ink sm:max-w-xs" aria-current="page">{product.name}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-14">
        {/* Gallery */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="mb-3 aspect-square overflow-hidden rounded-2xl bg-white border border-ink/5">
            <img src={images[activeImg] || PLACEHOLDER} alt={product.name} className="h-full w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 transition-colors md:h-16 md:w-16 ${i === activeImg ? "border-ink" : "border-transparent opacity-80 hover:opacity-100"}`}>
                  <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-sm font-medium text-blush-600">{product.brand}</p>}
          <h1 className="mt-1 font-serif text-2xl font-semibold leading-tight text-ink md:text-3xl">{product.name}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Rating value={product.rating} />
            <span className="text-sm text-ink/50">{product.numReviews || 0} reviews</span>
            {outOfStock ? (
              <span className="text-xs font-medium text-red-500">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-xs font-medium text-amber-600">Only {product.stock} left</span>
            ) : (
              <span className="text-xs font-medium text-green-600">In stock</span>
            )}
          </div>

          {/* Dynamic Price */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-semibold text-ink md:text-3xl">{inr(finalPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-base text-ink/40 line-through">{inr(product.price + extraPrice)}</span>
                <span className="rounded-full bg-blush-100 px-2 py-0.5 text-xs font-semibold text-blush-700">
                  {discountPct}% off
                </span>
              </>
            )}
          </div>

          {product.description && <p className="mt-4 text-sm leading-relaxed text-ink/60">{product.description}</p>}

          {/* Variants Selection */}
          {product.variants?.length > 0 && (
            <div className="mt-5 border-t border-ink/10 pt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-ink">
                  Select {product.variants[0]?.name || "Size"}:
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, i) => {
                  const isSelected = selectedVariant?.value === v.value;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(v)}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                        isSelected 
                          ? "border-ink bg-ink text-cream shadow-md" 
                          : "border-ink/20 hover:border-ink bg-white text-ink"
                      }`}
                    >
                      {v.value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center gap-2.5 md:gap-3">
            <div className="flex shrink-0 items-center rounded-full border border-ink/20">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={outOfStock || qty <= 1} className={stepBtn}>
                <FiMinus size={14} />
              </button>
              <span className="w-7 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={outOfStock || qty >= product.stock} className={stepBtn}>
                <FiPlus size={14} />
              </button>
            </div>

            <button onClick={handleAdd} disabled={outOfStock || adding} className="btn-primary h-10 flex-1 !py-0 text-sm disabled:opacity-50">
              <FiShoppingBag />
              {outOfStock ? "Out of stock" : adding ? "Adding…" : "Add to cart"}
            </button>

            <button onClick={handleWish} className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${inWishlist ? "border-blush-500 bg-blush-500 text-white" : "border-ink/20 hover:bg-blush-50"}`}>
              <FiHeart fill={inWishlist ? "currentColor" : "none"} />
            </button>
          </div>

          {/* ✅ UPDATED: Ingredients & Benefits (Dropdown Removed) */}
          <div className="mt-6 border-t border-ink/10">
            {product.ingredients && (
              <div className="border-b border-ink/10 py-3">
                <p className="text-sm font-semibold text-ink mb-1.5">Ingredients</p>
                <p className="text-sm leading-relaxed text-ink/60">{product.ingredients}</p>
              </div>
            )}
            {product.benefits && (
              <div className="border-b border-ink/10 py-3">
                <p className="text-sm font-semibold text-ink mb-1.5">Benefits</p>
                <p className="text-sm leading-relaxed text-ink/60">{product.benefits}</p>
              </div>
            )}
            {product.skinType && (
              <div className="flex items-center justify-between border-b border-ink/10 py-3 text-sm">
                <span className="font-semibold text-ink">Skin type</span>
                <span className="text-ink/60">{product.skinType}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReviewSection productId={product._id} />

      {/* ✅ UPDATED: Removed .slice(0, 4) to show all related products */}
      {related.length > 0 && (
        <section className="mt-12 md:mt-16 pt-8 border-t border-ink/10">
          <div className="mb-6 text-center md:text-left">
            <p className="text-[10px] tracking-[0.3em] uppercase text-blush-600 font-semibold mb-1">Complete your routine</p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-ink">You may also like</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
            {related.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;