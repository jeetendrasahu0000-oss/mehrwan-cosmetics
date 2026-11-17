import { Link } from "react-router-dom";
import { FiArrowRight, FiTruck, FiShield, FiCreditCard } from "react-icons/fi";

const FREE_SHIPPING_MIN = 999;

const PERKS = [
  {
    icon: FiTruck,
    title: "Free delivery",
    text: `On orders above ₹${FREE_SHIPPING_MIN.toLocaleString("en-IN")}`,
  },
  {
    icon: FiShield,
    title: "Clean and cruelty-free",
    text: "Botanical-active formulas",
  },
  {
    icon: FiCreditCard,
    title: "Pay your way",
    text: "Cash on delivery, UPI and cards",
  },
];

const SpecialOffers = () => (
  <section className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blush-200 via-blush-100 to-nude-100 p-5 sm:p-7 lg:p-10">
      {/* Soft decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-blush-300/30 blur-3xl"
      />

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-10">
        {/* Offer */}
        <div className="max-w-lg">
          <span className="inline-block rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-blush-700">
            Special offer
          </span>
          <h2 className="mt-3 font-serif text-2xl font-semibold leading-tight text-ink sm:text-3xl lg:text-4xl">
            Free shipping on orders above{" "}
            <span className="whitespace-nowrap text-blush-700">
              ₹{FREE_SHIPPING_MIN.toLocaleString("en-IN")}
            </span>
          </h2>
          <p className="mt-2 text-sm text-ink/70 md:text-base">
            Stock up on your skincare favourites and we will deliver them to your door at no extra cost.
          </p>
          <Link to="/products" className="btn-primary mt-5 !px-5 !py-2.5 text-sm">
            Shop now <FiArrowRight aria-hidden="true" />
          </Link>
        </div>

        {/* Perks */}
        <ul className="w-full shrink-0 space-y-3 rounded-xl bg-white/60 p-4 backdrop-blur-sm md:w-72">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-base text-blush-700">
                <Icon aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{title}</span>
                <span className="block text-xs text-ink/60">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </section>
);

export default SpecialOffers;