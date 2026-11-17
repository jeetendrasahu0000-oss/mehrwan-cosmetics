import { Link } from "react-router-dom";

const Logo = ({ size = "md", to = "/" }) => {
  const sizes = {
    
    sm: { text: "text-xl", img: "w-10 h-10" },
    md: { text: "text-2xl md:text-[26px]", img: "w-12 h-12" },
    lg: { text: "text-4xl", img: "w-16 h-16" },
  }[size];

  return (
    <Link to={to} className="flex items-center gap-3 group select-none">
     
      <img
        src="/favicon.png" 
        alt="Mehrwan Logo"
        className={`${sizes.img} object-contain shrink-0 transition-transform duration-300 group-hover:scale-105`}
      />
      
      <span
        className={`${sizes.text} font-serif font-semibold tracking-[0.18em] uppercase text-ink`}
      >
        Mehrwan
      </span>
    </Link>
  );
};

export default Logo;