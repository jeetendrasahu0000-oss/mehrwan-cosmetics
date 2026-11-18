import { Link } from "react-router-dom";

const Logo = ({ size = "md", to = "/" }) => {
  const sizes = {
    sm: { text: "text-lg md:text-xl" },
    md: { text: "text-xl md:text-[22px]" },
    lg: { text: "text-3xl md:text-4xl" },
  }[size];

  return (
    <Link to={to} className="flex flex-col items-center justify-center group select-none leading-none mt-1">
      <span
        className={`${sizes.text} font-serif font-semibold tracking-[0.1em] md:tracking-[0.15em] uppercase text-ink`}
      >
        Mehrwan
      </span>
      <span className="text-[8px] md:text-[9px] font-sans font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-ink/60 mt-0.5 md:mt-1">
        Beauty
      </span>
    </Link>
  );
};

export default Logo;