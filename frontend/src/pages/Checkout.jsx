import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { orderAPI, cartAPI } from "../services/orderService";
import { clearCartLocal } from "../redux/slices/cartSlice";

const FREE_SHIPPING_MIN = 999;
const SHIPPING_FEE = 99;

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Component ke bahar define kiya hai taaki har keystroke par input remount na ho
const Field = ({ label, name, className = "", ...props }) => (
  <div className={className}>
    <label htmlFor={name} className="mb-1 block text-xs font-medium text-ink/70">
      {label}
    </label>
    {/* text-base mobile par: iPhone input par zoom nahi karta */}
    <input
      id={name}
      name={name}
      required
      className="input-field !py-2.5 text-base sm:text-sm"
      {...props}
    />
  </div>
);

const Card = ({ title, children }) => (
  <section className="rounded-xl bg-white p-4 md:p-5">
    <h2 className="mb-4 text-base font-semibold text-ink">{title}</h2>
    {children}
  </section>
);

const PAYMENT_OPTIONS = [
  { value: "COD", label: "Cash on delivery", hint: "Pay when your order arrives" },
  { value: "Razorpay", label: "Pay online", hint: "Card, UPI or netbanking via Razorpay" },
];

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const { cart } = useSelector((s) => s.cart);

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState(null); // { ok, text }
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const items = cart?.items || [];
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal + shipping - discount);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCouponInput = (e) => {
    setCouponCode(e.target.value.toUpperCase());
    // Code badal gaya to purana discount hata do (galat code order ke saath na jaaye)
    if (appliedCode) {
      setAppliedCode("");
      setDiscount(0);
      setCouponMsg(null);
    }
  };

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setApplying(true);
    try {
      const res = await cartAPI.applyCoupon(code);
      const c = res.data.coupon;
      let d =
        c.discountType === "percentage"
          ? (subtotal * c.discountValue) / 100
          : c.discountValue;
      if (c.maxDiscount > 0) d = Math.min(d, c.maxDiscount);
      d = Math.min(Math.round(d), subtotal);
      setDiscount(d);
      setAppliedCode(code);
      setCouponMsg({ ok: true, text: `Coupon applied: ${inr(d)} off` });
    } catch (err) {
      setDiscount(0);
      setAppliedCode("");
      setCouponMsg({ ok: false, text: err.response?.data?.message || "Invalid coupon" });
    } finally {
      setApplying(false);
    }
  };

  const placeOrder = async () => {
    setLoading(true);
    setError("");
    try {
      await orderAPI.create({
        orderItems: items.map((i) => ({
          product: i.product,
          name: i.name,
          image: i.image,
          price: i.price,
          qty: i.qty,
          variant: i.variant,
        })),
        shippingAddress: form,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shipping,
        discount,
        totalPrice: total,
        couponCode: discount > 0 ? appliedCode : "",
      });
      dispatch(clearCartLocal());
      navigate("/orders");
    } catch (err) {
      setError(err.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    setLoading(true);
    setError("");
    try {
      if (!window.Razorpay) throw new Error("gateway");
      const { data: order } = await orderAPI.createRazorpayOrder(total);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        name: "Mehrwan",
        description: "Cosmetics purchase",
        order_id: order.id,
        handler: async (response) => {
          try {
            await orderAPI.verifyPayment(response);
            await placeOrder();
          } catch {
            setError("Payment could not be verified. If money was deducted, please contact support.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) }, // user ne popup band kiya
        prefill: { name: form.fullName, contact: form.phone, email: user?.email },
        theme: { color: "#2b2422" },
      };
      new window.Razorpay(options).open();
    } catch {
      setError("Could not start the payment. Please try again or choose cash on delivery.");
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (paymentMethod === "Razorpay") handleRazorpay();
    else placeOrder();
  };

  // Cart khaali hai (order place hone ke dauraan nahi)
  if (items.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:py-24">
        <h1 className="font-serif text-2xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mb-6 mt-2 text-sm text-ink/60">Add a few products to continue to checkout.</p>
        <Link to="/products" className="btn-primary !px-6 !py-2.5 text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
      <h1 className="mb-5 font-serif text-2xl font-semibold text-ink md:mb-7 md:text-3xl">
        Checkout
      </h1>

      <form onSubmit={submit} className="grid items-start gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
        <div className="space-y-4 md:space-y-5">
          <Card title="Shipping address">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" name="fullName" autoComplete="name" value={form.fullName} onChange={handleChange} />
              <Field label="Phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={handleChange} />
              <Field label="Address" name="addressLine" autoComplete="street-address" className="sm:col-span-2" value={form.addressLine} onChange={handleChange} />
              <Field label="City" name="city" autoComplete="address-level2" value={form.city} onChange={handleChange} />
              <Field label="State" name="state" autoComplete="address-level1" value={form.state} onChange={handleChange} />
              <Field label="Pincode" name="pincode" inputMode="numeric" autoComplete="postal-code" value={form.pincode} onChange={handleChange} />
              <Field label="Country" name="country" autoComplete="country-name" value={form.country} onChange={handleChange} />
            </div>
          </Card>

          <Card title="Payment method">
            <div role="radiogroup" aria-label="Payment method" className="space-y-2.5">
              {PAYMENT_OPTIONS.map((m) => {
                const selected = paymentMethod === m.value;
                return (
                  <label
                    key={m.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-ink/30 ${
                      selected ? "border-ink bg-blush-50" : "border-ink/15 hover:border-ink/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.value}
                      checked={selected}
                      onChange={() => setPaymentMethod(m.value)}
                      className="h-4 w-4 shrink-0 accent-ink"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">{m.label}</span>
                      <span className="block text-xs text-ink/50">{m.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Summary */}
        <aside className="rounded-xl bg-white p-4 md:p-5 lg:sticky lg:top-20">
          <h2 className="mb-4 font-serif text-lg font-semibold text-ink">Order summary</h2>

          <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto text-sm">
            {items.map((i) => (
              <li key={`${i.product}-${i.variant || ""}`} className="flex justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-ink/60">
                  {i.name} × {i.qty}
                </span>
                <span className="shrink-0">{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>

          {/* Coupon */}
          <div className="mb-1 flex gap-2">
            <input
              aria-label="Coupon code"
              placeholder="Coupon code"
              value={couponCode}
              onChange={handleCouponInput}
              className="input-field min-w-0 !py-2 text-base sm:text-sm"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={applying || !couponCode.trim()}
              className="btn-outline shrink-0 !px-4 !py-2 text-sm disabled:opacity-50"
            >
              {applying ? "Applying…" : "Apply"}
            </button>
          </div>
          <p
            role="status"
            className={`mb-3 min-h-[1rem] text-xs ${couponMsg?.ok ? "text-green-600" : "text-red-500"}`}
          >
            {couponMsg?.text}
          </p>

          <dl className="space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/60">Subtotal</dt>
              <dd>{inr(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/60">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : inr(shipping)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Discount</dt>
                <dd>-{inr(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{inr(total)}</dd>
            </div>
          </dl>

          {error && (
            <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-5 w-full !py-2.5 text-sm disabled:opacity-60"
          >
            {loading
              ? "Processing…"
              : paymentMethod === "Razorpay"
              ? `Pay ${inr(total)}`
              : `Place order · ${inr(total)}`}
          </button>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;