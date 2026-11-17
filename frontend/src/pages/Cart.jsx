import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from "react-icons/fi";
import { fetchCart, updateCartItem, removeCartItem } from "../redux/slices/cartSlice";

const FREE_SHIPPING_MIN = 999;
const SHIPPING_FEE = 99;
const PLACEHOLDER = "https://placehold.co/100x100/fbeae5/2b2422";

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const EmptyState = ({ title, text, to, cta }) => (
  <div className="mx-auto max-w-md px-4 py-16 text-center md:py-24">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-2xl text-blush-600">
      <FiShoppingBag aria-hidden="true" />
    </div>
    <h1 className="font-serif text-2xl font-semibold text-ink">{title}</h1>
    <p className="mb-6 mt-2 text-sm text-ink/60">{text}</p>
    <Link to={to} className="btn-primary !px-6 !py-2.5 text-sm">
      {cta}
    </Link>
  </div>
);

const Cart = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);

  useEffect(() => {
    if (user) dispatch(fetchCart());
  }, [user, dispatch]);

  if (!user) {
    return (
      <EmptyState
        title="Your cart"
        text="Please log in to view your cart."
        to="/login"
        cta="Login"
      />
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <EmptyState
        title="Your cart is empty"
        text="Add a few favourites and they will show up here."
        to="/products"
        cta="Continue shopping"
      />
    );
  }

  const count = items.reduce((a, i) => a + i.qty, 0);
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;
  const remaining = FREE_SHIPPING_MIN - subtotal;
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_MIN) * 100));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-5 flex items-baseline justify-between gap-3 md:mb-7">
        <h1 className="font-serif text-2xl font-semibold text-ink md:text-3xl">Shopping cart</h1>
        <p className="text-sm text-ink/60">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[1fr_340px] lg:gap-8">
        {/* Items */}
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={`${item.product}-${item.variant || ""}`}
              className="flex gap-3 rounded-xl bg-white p-3 md:gap-4 md:p-4"
            >
              <img
                src={item.image || PLACEHOLDER}
                alt={item.name}
                loading="lazy"
                className="h-16 w-16 shrink-0 rounded-lg object-cover md:h-20 md:w-20"
              />

              <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="mt-0.5 text-xs text-ink/50">{item.variant}</p>
                    )}
                  </div>
                  <button
                    onClick={() => dispatch(removeCartItem(item.product))}
                    className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink/40 transition-colors hover:bg-red-50 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                    aria-label={`Remove ${item.name}`}
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center rounded-full border border-ink/15">
                    <button
                      onClick={() =>
                        dispatch(updateCartItem({ productId: item.product, qty: item.qty - 1 }))
                      }
                      disabled={item.qty <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
                      aria-label="Decrease quantity"
                    >
                      <FiMinus size={12} />
                    </button>
                    <span className="w-7 text-center text-sm font-medium" aria-live="polite">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(updateCartItem({ productId: item.product, qty: item.qty + 1 }))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-ink/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                      aria-label="Increase quantity"
                    >
                      <FiPlus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-ink">{inr(item.price * item.qty)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Summary */}
        <aside className="rounded-xl bg-white p-4 md:p-5 lg:sticky lg:top-20">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Order summary</h2>

          {/* Free shipping progress */}
          <div className="mb-4 rounded-lg bg-blush-50/60 p-3">
            <p className="text-xs text-ink/70">
              {remaining > 0
                ? `Add ${inr(remaining)} more for free shipping`
                : "You have unlocked free shipping"}
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink/10"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-label="Progress to free shipping"
            >
              <div
                className="h-full rounded-full bg-ink motion-safe:transition-all motion-safe:duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <dl className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd className="font-medium">{inr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd className="font-medium">{shipping === 0 ? "Free" : inr(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-semibold">{inr(total)}</dd>
            </div>
          </dl>

          <Link to="/checkout" className="btn-primary mt-5 w-full !py-2.5 text-sm">
            Checkout <FiArrowRight />
          </Link>
          <Link
            to="/products"
            className="mt-3 block text-center text-sm text-ink/60 transition-colors hover:text-ink"
          >
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;