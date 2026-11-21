import { Link } from "react-router-dom";

const Logo = ({ size = "md", to = "/" }) => {
  const sizes = {
    sm: {
      main: "text-lg md:text-xl",
      sub: "text-[10px] md:text-[11px]",
      divider: "w-6 md:w-8",
      gap: "mt-1 md:mt-1.5",
    },
    md: {
      main: "text-xl md:text-[22px]",
      sub: "text-[11px] md:text-xs",
      divider: "w-8 md:w-10",
      gap: "mt-1.5 md:mt-2",
    },
    lg: {
      main: "text-3xl md:text-4xl",
      sub: "text-sm md:text-base",
      divider: "w-12 md:w-14",
      gap: "mt-2 md:mt-2.5",
    },
  }[size];

  return (
    <Link
      to={to}
      className="inline-flex flex-col items-center justify-center group select-none leading-none mt-1"
    >
      {/* Main wordmark */}
      <span
        className={`${sizes.main} font-serif font-semibold tracking-[0.12em] md:tracking-[0.18em] uppercase text-ink transition-colors duration-300 group-hover:text-ink/80`}
      >
        Mehrwan
      </span>

      {/* Divider line with dot */}
      <span className="flex items-center gap-1.5 mt-1 md:mt-1.5">
        <span className={`${sizes.divider} h-px bg-ink/20 group-hover:bg-ink/40 transition-colors duration-300`} />
        <span className="w-1 h-1 rounded-full bg-ink/40 group-hover:bg-ink/60 transition-colors duration-300" />
        <span className={`${sizes.divider} h-px bg-ink/20 group-hover:bg-ink/40 transition-colors duration-300`} />
      </span>

      {/* Sub wordmark - bigger now */}
      <span
        className={`${sizes.sub} font-sans font-semibold tracking-[0.45em] md:tracking-[0.55em] uppercase text-ink/70 group-hover:text-ink/90 transition-colors duration-300 ${sizes.gap} pl-[0.45em] md:pl-[0.55em]`}
      >
        Beauty
      </span>
    </Link>
  );
};

export default Logo;