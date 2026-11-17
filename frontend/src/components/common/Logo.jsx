import { Link } from "react-router-dom";

const Logo = ({ size = "md", to = "/" }) => {
  const sizes = {
    sm: { text: "text-lg md:text-xl" },
    md: { text: "text-xl md:text-[24px]" },
    lg: { text: "text-3xl md:text-4xl" },
  }[size];

  return (
    <Link to={to} className="flex items-center group select-none">
      <span
        // ✅ font-semibold wapas laga diya hai
        className={`${sizes.text} font-serif font-semibold tracking-[0.15em] md:tracking-[0.18em] uppercase text-ink`}
      >
        Mehrwan
      </span>
    </Link>
  );
};

export default Logo;