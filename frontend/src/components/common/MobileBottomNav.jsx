import { Link, useLocation } from "react-router-dom";
import { FiHome, FiGrid, FiHeart, FiUser, FiShoppingBag } from "react-icons/fi";
import { useSelector } from "react-redux";

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const cartItems = useSelector((s) => s.cart.cart.items || []);
  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);

  const isActive = (path) => pathname === path;

  const NavItem = ({ to, icon: Icon, label, isActive, badge }) => (
    <Link
      to={to}
      className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
        isActive ? "text-blush-600 scale-105" : "text-ink/50 hover:text-ink"
      }`}
    >
      <div className={`relative flex items-center justify-center ${isActive ? "bg-blush-50/80 p-1.5 rounded-xl" : "p-1.5"}`}>
        <Icon size={22} className={isActive ? "stroke-[2.5px]" : "stroke-2"} />
        
        {/* Active Dot Indicator */}
        {isActive && (
          <span className="absolute -bottom-1 w-1 h-1 bg-blush-600 rounded-full" />
        )}

        {/* Cart Badge */}
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-ink px-1 text-[9px] font-bold text-white border-2 border-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>
      <span className={`text-[10px] font-medium ${isActive ? "font-bold" : ""}`}>
        {label}
      </span>
    </Link>
  );

  return (
    // Niche se 10px upar
    <div className="fixed bottom-2.5 left-3 right-3 z-40 lg:hidden">
      
      {/* ✅ Glass Effect with rounded-full (Perfect Half Circles) */}
      <div className="flex items-center justify-around h-[65px] bg-white/75 backdrop-blur-xl border border-white/50 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4">
        <NavItem to="/" icon={FiHome} label="Home" isActive={isActive("/")} />
        <NavItem to="/products" icon={FiGrid} label="Shop" isActive={isActive("/products")} />
        <NavItem to="/wishlist" icon={FiHeart} label="Wishlist" isActive={isActive("/wishlist")} />
        <NavItem to="/cart" icon={FiShoppingBag} label="Cart" isActive={isActive("/cart")} badge={cartCount} />
        <NavItem to="/profile" icon={FiUser} label="Profile" isActive={isActive("/profile")} />
      </div>
      
    </div>
  );
};

export default MobileBottomNav;