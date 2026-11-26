import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiArrowLeft, FiChevronDown, FiTag, FiCheck, FiCreditCard,
  FiTruck, FiUser, FiPhone, FiMapPin, FiLock, FiShoppingBag, FiX,
} from "react-icons/fi";
import { orderAPI, cartAPI } from "../services/orderService";
import { clearCartLocal } from "../redux/slices/cartSlice";

const FREE_SHIPPING_MIN = 999;
const SHIPPING_FEE = 99;
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

/* ---------- Input Field ---------- */
const Field = ({ label, name, icon: Icon, className = "", ...props }) => (
  <div className={className}>
    <label htmlFor={name} className="mb-1.5 block text-[11px] font-medium uppercase tracking-wide text-ink/60">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/35" />
      )}
      <input
        id={name}
        name={name}
        required
        className={`w-full rounded-lg border border-ink/15 bg-white ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-[15px] text-ink placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm`}
        {...props}
      />
    </div>
  </div>
);

/* ---------- Section Card ---------- */
const Card = ({ title, step, action, children }) => (
  <section className="rounded-xl bg-white ring-1 ring-ink/8">
    <header className="flex items-center justify-between border-b border-ink/8 px-4 py-3">
      <div className="flex items-center gap-2">
        {step && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[10px] font-semibold text-white">
            {step}
          </span>
        )}
        <h2 className="text-sm font-semibold text-ink">{title}</h2>
      </div>
      {action}
    </header>
    <div className="p-4">{children}</div>
  </section>
);

/* ---------- Payment Options ---------- */
const PAYMENT_OPTIONS = [
  { value: "COD", label: "Cash on delivery", hint: "Pay when it arrives", Icon: FiTruck },
  { value: "Razorpay", label: "Pay online", hint: "Card · UPI · Netbanking", Icon: FiCreditCard },
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
  const [couponMsg, setCouponMsg] = useState(null);
  const [applying, setApplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);

  const items = cart?.items || [];
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
  const total = Math.max(0, subtotal + shipping - discount);
  const totalQty = items.reduce((a, i) => a + i.qty, 0);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCouponInput = (e) => {
    setCouponCode(e.target.value.toUpperCase());
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
      let d = c.discountType === "percentage" ? (subtotal * c.discountValue) / 100 : c.discountValue;
      if (c.maxDiscount > 0) d = Math.min(d, c.maxDiscount);
      d = Math.min(Math.round(d), subtotal);
      setDiscount(d);
      setAppliedCode(code);
      setCouponMsg({ ok: true, text: `Saved ${inr(d)} with ${code}` });
    } catch (err) {
      setDiscount(0);
      setAppliedCode("");
      setCouponMsg({ ok: false, text: err.response?.data?.message || "Invalid coupon" });
    } finally {
      setApplying(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCode("");
    setDiscount(0);
    setCouponCode("");
    setCouponMsg(null);
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
            setError("Payment could not be verified. If money was deducted, contact support.");
            setLoading(false);
          }
        },
        modal: { ondismiss: () => setLoading(false) },
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

  /* ---------- Empty state ---------- */
  if (items.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center md:py-24">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush-50 text-ink">
          <FiShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-ink">Your cart is empty</h1>
        <p className="mb-6 mt-1.5 text-sm text-ink/60">Add a few products to continue to checkout.</p>
        <Link to="/products" className="btn-primary inline-block !px-6 !py-2.5 text-sm">
          Continue shopping
        </Link>
      </div>
    );
  }

  /* ---------- Line items ---------- */
  const LineItems = (
    <ul className="max-h-44 space-y-2.5 overflow-y-auto text-[13px]">
      {items.map((i) => (
        <li key={`${i.product}-${i.variant || ""}`} className="flex justify-between gap-3">
          <span className="min-w-0 flex-1 truncate text-ink/70">
            {i.name} <span className="text-ink/40">× {i.qty}</span>
          </span>
          <span className="shrink-0 font-medium text-ink">{inr(i.price * i.qty)}</span>
        </li>
      ))}
    </ul>
  );

  /* ---------- Totals ---------- */
  const Totals = (
    <dl className="space-y-2 text-[13px]">
      <div className="flex justify-between">
        <dt className="text-ink/60">Subtotal</dt>
        <dd>{inr(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-ink/60">Shipping</dt>
        <dd className={shipping === 0 ? "text-green-600 font-medium" : ""}>
          {shipping === 0 ? "Free" : inr(shipping)}
        </dd>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <dt>Discount</dt>
          <dd>−{inr(discount)}</dd>
        </div>
      )}
      <div className="flex justify-between border-t border-ink/10 pt-2.5 text-sm font-semibold text-ink">
        <dt>Total</dt>
        <dd>{inr(total)}</dd>
      </div>
    </dl>
  );

  return (
    <div className="min-h-screen bg-blush-50/40">
      {/* ---------- Mobile App Bar ---------- */}
      <div className="sticky top-0 z-20 border-b border-ink/8 bg-white/95 backdrop-blur md:hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            to="/cart"
            aria-label="Back to cart"
            className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-ink/70 hover:bg-ink/5"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="flex-1 text-sm font-semibold text-ink">Checkout</h1>
          <span className="rounded-full bg-ink/5 px-2 py-1 text-[11px] font-medium text-ink/60">
            {totalQty} item{totalQty > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-32 pt-4 md:px-8 md:pb-10 md:pt-8">
        <h1 className="mb-5 hidden font-serif text-2xl font-semibold text-ink md:mb-6 md:block">
          Checkout
        </h1>

        <form
          onSubmit={submit}
          className="grid items-start gap-4 md:gap-5 lg:grid-cols-[1fr_340px] lg:gap-8"
        >
          <div className="space-y-4">
            {/* ---------- Mobile Collapsible Summary ---------- */}
            <div className="rounded-xl bg-white ring-1 ring-ink/8 md:hidden">
              <button
                type="button"
                onClick={() => setSummaryOpen(!summaryOpen)}
                aria-expanded={summaryOpen}
                className="flex w-full items-center justify-between px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  <FiShoppingBag className="h-4 w-4 text-ink/60" />
                  Order summary
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-ink">{inr(total)}</span>
                  <FiChevronDown
                    className={`h-4 w-4 text-ink/50 transition-transform ${summaryOpen ? "rotate-180" : ""}`}
                  />
                </span>
              </button>
              {summaryOpen && (
                <div className="space-y-3 border-t border-ink/8 px-4 pb-4 pt-3">
                  {LineItems}
                  <div className="border-t border-ink/8 pt-3">{Totals}</div>
                </div>
              )}
            </div>

            {/* ---------- Shipping Address ---------- */}
            <Card title="Shipping address" step="1">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name" name="fullName" icon={FiUser} autoComplete="name" value={form.fullName} onChange={handleChange} />
                <Field label="Phone" name="phone" icon={FiPhone} type="tel" inputMode="tel" autoComplete="tel" value={form.phone} onChange={handleChange} />
                <Field label="Address" name="addressLine" icon={FiMapPin} autoComplete="street-address" className="sm:col-span-2" value={form.addressLine} onChange={handleChange} />
                <Field label="City" name="city" autoComplete="address-level2" value={form.city} onChange={handleChange} />
                <Field label="State" name="state" autoComplete="address-level1" value={form.state} onChange={handleChange} />
                <Field label="Pincode" name="pincode" inputMode="numeric" autoComplete="postal-code" value={form.pincode} onChange={handleChange} />
                <Field label="Country" name="country" autoComplete="country-name" value={form.country} onChange={handleChange} />
              </div>
            </Card>

            {/* ---------- Payment ---------- */}
            <Card title="Payment method" step="2">
              <div role="radiogroup" aria-label="Payment method" className="space-y-2">
                {PAYMENT_OPTIONS.map(({ value, label, hint, Icon }) => {
                  const selected = paymentMethod === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                        selected
                          ? "border-ink bg-blush-50/60 ring-1 ring-ink/10"
                          : "border-ink/12 hover:border-ink/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={value}
                        checked={selected}
                        onChange={() => setPaymentMethod(value)}
                        className="sr-only"
                      />
                      <Icon className={`h-5 w-5 shrink-0 ${selected ? "text-ink" : "text-ink/50"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-ink">{label}</span>
                        <span className="block text-[11px] text-ink/50">{hint}</span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          selected ? "border-ink bg-ink text-white" : "border-ink/20"
                        }`}
                      >
                        {selected && <FiCheck className="h-3 w-3" strokeWidth={3} />}
                      </span>
                    </label>
                  );
                })}
              </div>
            </Card>

            {/* ---------- Coupon ---------- */}
            <Card title="Coupon" action={<FiTag className="h-4 w-4 text-ink/40" />}>
              {appliedCode ? (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheck className="h-4 w-4 text-green-600" strokeWidth={3} />
                    <span className="font-medium text-green-700">{appliedCode}</span>
                    <span className="text-green-600">−{inr(discount)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-green-700 hover:bg-green-100"
                    aria-label="Remove coupon"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      aria-label="Coupon code"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={handleCouponInput}
                      className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-white px-3 py-2.5 text-[15px] uppercase text-ink placeholder:normal-case placeholder:text-ink/30 outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/15 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={applying || !couponCode.trim()}
                      className="shrink-0 rounded-lg bg-ink px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:opacity-40"
                    >
                      {applying ? "…" : "Apply"}
                    </button>
                  </div>
                  {couponMsg && (
                    <p
                      role="status"
                      className={`mt-2 text-xs ${couponMsg.ok ? "text-green-600" : "text-red-500"}`}
                    >
                      {couponMsg.text}
                    </p>
                  )}
                </>
              )}
            </Card>

            {/* ---------- Trust note ---------- */}
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-ink/45">
              <FiLock className="h-3 w-3" /> Secure checkout · Your data is protected
            </p>
          </div>

          {/* ---------- Desktop Summary ---------- */}
          <aside className="hidden rounded-xl bg-white ring-1 ring-ink/8 lg:sticky lg:top-20 lg:block">
            <header className="border-b border-ink/8 px-4 py-3">
              <h2 className="text-sm font-semibold text-ink">Order summary</h2>
            </header>
            <div className="space-y-3 p-4">
              {LineItems}
              <div className="border-t border-ink/8 pt-3">{Totals}</div>
              {error && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-2.5 text-sm disabled:opacity-60"
              >
                {loading
                  ? "Processing…"
                  : paymentMethod === "Razorpay"
                  ? `Pay ${inr(total)}`
                  : `Place order · ${inr(total)}`}
              </button>
            </div>
          </aside>
        </form>
      </div>

      {/* ---------- Mobile Sticky CTA ---------- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink/10 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur md:hidden">
        {error && (
          <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-xs text-ink/60">Total payable</span>
          <span className="text-lg font-semibold text-ink">{inr(total)}</span>
        </div>
        <button
          type="submit"
          onClick={submit}
          disabled={loading}
          className="btn-primary w-full !py-3 text-sm font-semibold disabled:opacity-60"
        >
          {loading
            ? "Processing…"
            : paymentMethod === "Razorpay"
            ? `Pay ${inr(total)}`
            : "Place order"}
        </button>
      </div>
    </div>
  );
};

export default Checkout;