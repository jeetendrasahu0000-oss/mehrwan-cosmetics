import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiHeart } from "react-icons/fi";
import { fetchWishlist } from "../redux/slices/wishlistSlice";
import ProductCard from "../components/common/ProductCard";

const EmptyState = ({ title, text, to, cta }) => (
  <div className="mx-auto max-w-md px-4 py-16 text-center md:py-24">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-2xl text-blush-600">
      <FiHeart aria-hidden="true" />
    </div>
    <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
    <p className="mb-6 mt-2 text-sm text-ink/60">{text}</p>
    <Link to={to} className="btn-primary !px-6 !py-2.5 text-sm">
      {cta}
    </Link>
  </div>
);

const Wishlist = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { wishlist } = useSelector((s) => s.wishlist);

  useEffect(() => {
    if (user) dispatch(fetchWishlist());
  }, [user, dispatch]);

  if (!user) {
    return (
      <EmptyState
        title="Your wishlist"
        text="Please log in to view your saved products."
        to="/login"
        cta="Login"
      />
    );
  }

  const products = wishlist?.products || [];

  if (products.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        text="Tap the heart on any product to save it here."
        to="/products"
        cta="Discover products"
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-baseline justify-between gap-3 md:mb-7">
        <h1 className="font-serif text-2xl font-semibold text-ink md:text-3xl">My wishlist</h1>
        <p className="text-sm text-ink/60">
          {products.length} {products.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {products.map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;