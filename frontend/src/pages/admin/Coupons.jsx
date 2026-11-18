import { useEffect, useState } from "react";
import {
  FiPlus,
  FiTrash2,
  FiTag,
  FiCalendar,
  FiPercent,
  FiShoppingBag,
  FiClock,
  FiGift,
  FiCheckCircle,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const INITIAL_FORM = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  expiryDate: "",
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    try {
      const res = await adminAPI.getCoupons();
      setCoupons(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (Number(form.discountValue) <= 0) {
      alert("Please enter a valid discount value.");
      return;
    }

    if (
      form.discountType === "percentage" &&
      Number(form.discountValue) > 100
    ) {
      alert("Percentage discount cannot exceed 100%.");
      return;
    }

    setSaving(true);

    try {
      await adminAPI.createCoupon({
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: Number(form.maxDiscount) || 0,
      });

      setForm(INITIAL_FORM);
      await load();
      alert("Coupon created successfully!");
    } catch (err) {
      console.error("Coupon creation failed:", err);
      alert(
        err.response?.data?.message ||
        "Failed to create coupon. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }

    try {
      setDeleting(id);
      await adminAPI.deleteCoupon(id);
      await load();
    } catch (err) {
      console.error("Coupon deletion failed:", err);
      alert("Failed to delete coupon.");
    } finally {
      setDeleting(null);
    }
  };

  const isExpired = (date) => {
    if (!date) return false;

    const expiry = new Date(date);
    expiry.setHours(23, 59, 59, 999);

    return expiry < new Date();
  };

  const formatDate = (date) => {
    if (!date) return "No expiry";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const activeCoupons = coupons.filter((c) => !isExpired(c.expiryDate));
  const expiredCoupons = coupons.length - activeCoupons.length;

  return (
    <div className="min-h-screen space-y-7 pb-10">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#a1816d]">
            <FiGift size={13} />
            Marketing Management
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#33251D] sm:text-3xl">
            Coupons & Discounts
          </h1>

          <p className="mt-1.5 text-xs text-[#9b897c] sm:text-sm">
            Create promotional offers and manage discount codes for your customers.
          </p>
        </div>

        <div className="flex w-fit items-center gap-3 rounded-xl border border-[#33251D]/10 bg-white px-4 py-3 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5efe6] text-[#8b705e]">
            <FiTag size={19} />
          </div>

          <div>
            <p className="text-xl font-bold text-[#33251D]">
              {coupons.length}
            </p>
            <p className="text-[10px] text-[#9b897c]">
              Total Coupons
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">

        <div className="rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#9b897c] sm:text-xs">
              Total Coupons
            </span>
            <FiTag size={17} className="text-[#947761]" />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#33251D]">
            {coupons.length}
          </p>
          <p className="mt-1 text-[10px] text-[#9b897c]">
            All created coupons
          </p>
        </div>

        <div className="rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#9b897c] sm:text-xs">
              Active Coupons
            </span>
            <FiCheckCircle size={17} className="text-green-600" />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#33251D]">
            {activeCoupons.length}
          </p>
          <p className="mt-1 text-[10px] text-green-600">
            Within expiry date
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#9b897c] sm:text-xs">
              Expired Coupons
            </span>
            <FiClock size={17} className="text-red-500" />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#33251D]">
            {expiredCoupons}
          </p>
          <p className="mt-1 text-[10px] text-red-500">
            Past expiry date
          </p>
        </div>

      </div>

      {/* Main Layout */}
      <div className="grid items-start gap-6 xl:grid-cols-[1fr_360px]">

        {/* Coupon List */}
        <section className="min-w-0">

          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#33251D]">
                Available Coupons
              </h2>
              <p className="mt-1 text-[11px] text-[#9b897c]">
                Manage all your discount codes
              </p>
            </div>

            <span className="rounded-full bg-[#f0e8df] px-3 py-1.5 text-[10px] font-semibold text-[#795e4c]">
              {coupons.length} Offers
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-[#33251D]/10 bg-white">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#33251D]/15 border-t-[#80644f]" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#33251D]/15 bg-white p-8 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5efe6] text-[#947761]">
                <FiTag size={27} />
              </div>

              <h3 className="text-base font-semibold text-[#33251D]">
                No Coupons Yet
              </h3>

              <p className="mt-2 max-w-xs text-xs leading-5 text-[#9b897c]">
                Create your first discount coupon to start offering special deals.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              {coupons.map((coupon) => {
                const expired = isExpired(coupon.expiryDate);

                return (
                  <article
                    key={coupon._id}
                    className="group relative overflow-hidden rounded-2xl border border-[#33251D]/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {/* Coupon Top */}
                    <div className="relative overflow-hidden bg-[#f5efe6] p-5">
                      <div className="absolute -right-5 -top-8 h-28 w-28 rounded-full border-[16px] border-white/30" />
                      <div className="absolute -bottom-12 right-16 h-24 w-24 rounded-full border-[12px] border-white/20" />

                      <div className="relative flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#947761]">
                            <FiTag size={11} />
                            Mehrwan Special Offer
                          </div>

                          <h3 className="break-all text-xl font-bold tracking-wider text-[#33251D]">
                            {coupon.code}
                          </h3>

                          <p className="mt-1 text-[10px] text-[#8e7b6d]">
                            Discount Coupon
                          </p>
                        </div>

                        <div className="shrink-0 rounded-xl bg-[#33251D] px-3 py-2.5 text-center text-white shadow-sm">
                          <p className="text-xl font-bold leading-none">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}%`
                              : `₹${coupon.discountValue}`}
                          </p>
                          <p className="mt-1 text-[8px] font-semibold uppercase tracking-wider text-white/70">
                            OFF
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Dashed Divider */}
                    <div className="relative flex items-center">
                      <div className="-ml-3 h-6 w-6 rounded-full border border-[#33251D]/10 bg-[#faf7f2]" />
                      <div className="mx-1 flex-1 border-t border-dashed border-[#33251D]/20" />
                      <div className="-mr-3 h-6 w-6 rounded-full border border-[#33251D]/10 bg-[#faf7f2]" />
                    </div>

                    {/* Coupon Details */}
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-3">

                        <div className="rounded-xl bg-[#faf7f2] p-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-[#9b897c]">
                            <FiShoppingBag size={11} />
                            Minimum Order
                          </div>
                          <p className="mt-1.5 text-sm font-bold text-[#33251D]">
                            ₹{Number(coupon.minOrderAmount || 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <div className="rounded-xl bg-[#faf7f2] p-3">
                          <div className="flex items-center gap-1.5 text-[9px] text-[#9b897c]">
                            <FiCalendar size={11} />
                            Valid Until
                          </div>
                          <p className="mt-1.5 text-xs font-bold text-[#33251D]">
                            {formatDate(coupon.expiryDate)}
                          </p>
                        </div>

                      </div>

                      {coupon.maxDiscount > 0 && (
                        <p className="mt-3 text-[10px] text-[#8e7b6d]">
                          Maximum discount:{" "}
                          <span className="font-semibold text-[#33251D]">
                            ₹{Number(coupon.maxDiscount).toLocaleString("en-IN")}
                          </span>
                        </p>
                      )}

                      <div className="mt-4 flex items-center justify-between border-t border-[#33251D]/10 pt-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${
                            expired
                              ? "bg-red-50 text-red-600"
                              : "bg-green-50 text-green-700"
                          }`}
                        >
                          {expired ? "Expired" : "Active"}
                        </span>

                        <button
                          type="button"
                          disabled={deleting === coupon._id}
                          onClick={() => remove(coupon._id)}
                          title="Delete Coupon"
                          className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-red-50 px-3 text-[10px] font-semibold text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                        >
                          <FiTrash2 size={13} />
                          {deleting === coupon._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}

            </div>
          )}
        </section>

        {/* Create Coupon Form */}
        <aside className="xl:sticky xl:top-24">
          <form
            onSubmit={submit}
            className="overflow-hidden rounded-2xl border border-[#33251D]/10 bg-white shadow-sm"
          >
            {/* Form Header */}
            <div className="border-b border-[#33251D]/10 bg-[#f8f4ee] px-5 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#a1816d]">
                    Marketing Tools
                  </p>

                  <h2 className="mt-1 text-lg font-semibold text-[#33251D]">
                    Create Coupon
                  </h2>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#80644f] shadow-sm">
                  <FiPlus size={20} />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5">

              {/* Coupon Code */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Coupon Code <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiTag
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#947761]"
                  />

                  <input
                    required
                    placeholder="e.g. WELCOME20"
                    value={form.code}
                    onChange={(e) =>
                      updateField("code", e.target.value.toUpperCase())
                    }
                    className="input-field pl-9 font-semibold uppercase tracking-wider"
                  />
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Discount Type
                </label>

                <select
                  value={form.discountType}
                  onChange={(e) => updateField("discountType", e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="percentage">Percentage Discount (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Discount Value <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  {form.discountType === "percentage" ? (
                    <FiPercent
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-[#947761]"
                    />
                  ) : (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#947761]">
                      ₹
                    </span>
                  )}

                  <input
                    type="number"
                    min="0.01"
                    max={form.discountType === "percentage" ? "100" : undefined}
                    step="any"
                    required
                    placeholder="Enter discount value"
                    value={form.discountValue}
                    onChange={(e) => updateField("discountValue", e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              {/* Minimum Order */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Minimum Order Amount
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 999"
                  value={form.minOrderAmount}
                  onChange={(e) => updateField("minOrderAmount", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Maximum Discount */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Maximum Discount
                  <span className="ml-1 font-normal text-[#9b897c]">
                    (Optional)
                  </span>
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 300"
                  value={form.maxDiscount}
                  onChange={(e) => updateField("maxDiscount", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-[#5c493b]">
                  Expiry Date <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <FiCalendar
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#947761]"
                  />

                  <input
                    type="date"
                    required
                    min={new Date().toLocaleDateString("en-CA")}
                    value={form.expiryDate}
                    onChange={(e) => updateField("expiryDate", e.target.value)}
                    className="input-field pl-9"
                  />
                </div>
              </div>

              {/* Coupon Preview */}
              {form.code && form.discountValue && (
                <div className="rounded-xl border border-dashed border-[#cbb8a7] bg-[#faf7f2] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#9b897c]">
                    Coupon Preview
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="break-all text-sm font-bold tracking-wider text-[#33251D]">
                      {form.code}
                    </span>

                    <span className="shrink-0 rounded-lg bg-[#33251D] px-3 py-1.5 text-xs font-bold text-white">
                      {form.discountType === "percentage"
                        ? `${form.discountValue}% OFF`
                        : `₹${form.discountValue} OFF`}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <div className="border-t border-[#33251D]/10 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    "Creating Coupon..."
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Create Coupon
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </aside>

      </div>
    </div>
  );
};

export default AdminCoupons;