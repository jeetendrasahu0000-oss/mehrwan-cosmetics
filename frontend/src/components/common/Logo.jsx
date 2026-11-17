import { Link } from "react-router-dom";

/**
 * Mehrwan text logo — elegant serif wordmark with
 * a blush-toned "M" seal accent. Semibold weight.
 */
const Logo = ({ size = "md", to = "/" }) => {
  const sizes = {
    sm: { text: "text-xl", seal: "w-7 h-7 text-[10px]" },
    md: { text: "text-2xl md:text-[26px]", seal: "w-9 h-9 text-xs" },
    lg: { text: "text-4xl", seal: "w-12 h-12 text-sm" },
  }[size];

  return (
    <Link to={to} className="flex items-center gap-2.5 group select-none">
      <div
        className={`${sizes.seal} rounded-full bg-ink text-cream flex items-center justify-center font-serif font-semibold tracking-tighter shrink-0 transition-transform duration-300 group-hover:rotate-6`}
      >
        M
      </div>
      <span
        className={`${sizes.text} font-serif font-semibold tracking-[0.18em] uppercase text-ink`}
      >
        Mehrwan
      </span>
    </Link>
  );
};

export default Logo;