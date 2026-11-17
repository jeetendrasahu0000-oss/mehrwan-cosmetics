import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  FiSearch, FiUser, FiHeart, FiShoppingBag, FiMenu, FiX, FiLogOut, FiPackage,
} from "react-icons/fi";
import Logo from "./Logo";
import { logout } from "../../redux/slices/authSlice";
import API from "../../services/api";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/products?category=skincare", label: "Skincare" },
  { to: "/products?sort=popular", label: "Best Sellers" },
];

const iconBtn =
  "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[20px] text-ink " +
  "transition-colors hover:bg-black/5 hover:text-ink/80 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";

const menuItem =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/80 " +
  "transition-colors hover:bg-blush-50 hover:text-ink";

const Badge = ({ count, dark }) =>
  count > 0 ? (
    <span
      // ✅ Badge border updated to #f5efe6
      className={`absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none border-2 border-[#f5efe6] ${
        dark ? "bg-ink text-cream" : "bg-blush-500 text-white"
      }`}
    >
      {count > 9 ? "9+" : count}
    </span>
  ) : null;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userMenu, setUserMenu] = useState(false);
  
  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const userRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  
  const { user } = useSelector((s) => s.auth);
  const cartItems = useSelector((s) => s.cart.cart.items || []);
  const wishlistCount = useSelector((s) => s.wishlist.wishlist.products?.length || 0);
  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);

  const closeAll = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenu(false);
    setSuggestions([]);
    setSearchTerm("");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeAll();
  }, [pathname, search]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeAll();
    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenu(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await API.get("/products", { params: { keyword: searchTerm, limit: 5 } });
        setSuggestions(res.data.products || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const isActive = (to) => {
    const [path, query] = to.split("?");
    if (path === "/") return pathname === "/";
    if (pathname !== path) return false;
    const have = new URLSearchParams(search);
    if (query) {
      return [...new URLSearchParams(query)].every(([k, v]) => have.get(k) === v);
    }
    return !have.has("category") && !have.has("sort");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    navigate(`/products?keyword=${encodeURIComponent(term)}`);
    closeAll();
  };

  const handleLogout = () => {
    dispatch(logout());
    closeAll();
    navigate("/");
  };

  return (
    <MotionConfig reducedMotion="user">
      <header
        // ✅ Navbar color changed to #f5efe6
        className={`sticky top-0 z-50 border-b bg-[#f5efe6] transition-shadow duration-200 ${
          scrolled ? "border-ink/10 shadow-sm" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8 relative">
          
          <div className="flex items-center flex-1 justify-start">
            <button
              onClick={() => setMobileOpen(true)}
              className={`${iconBtn} -ml-2 lg:hidden`}
              aria-label="Open menu"
            >
              <FiMenu size={24} />
            </button>

            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
              {links.map((l) => {
                const active = isActive(l.to);
                return (
                  <Link
                    key={l.label}
                    to={l.to}
                    aria-current={active ? "page" : undefined}
                    className={`relative py-1 text-sm font-medium transition-colors ${
                      active ? "text-ink" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    {l.label}
                    <span className={`absolute -bottom-0.5 left-0 h-px bg-ink transition-all duration-300 ${active ? "w-full" : "w-0"}`} />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0 shrink-0">
            <Logo />
          </div>

          <div className="flex items-center justify-end flex-1 gap-0.5 md:gap-1">
            <button
              onClick={() => {
                setUserMenu(false);
                setSearchOpen((v) => !v);
              }}
              className={iconBtn}
              aria-label="Search"
            >
              <FiSearch size={20} />
            </button>

            <div ref={userRef} className="relative hidden sm:block">
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setUserMenu((v) => !v);
                }}
                className={`${iconBtn} ${user ? "lg:w-auto lg:gap-1.5 lg:px-3 lg:text-sm lg:font-medium" : ""}`}
                aria-label="Account"
              >
                <FiUser size={20} />
                {user && <span className="hidden lg:block">{user.name.split(" ")[0]}</span>}
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-ink/5 bg-white shadow-lg z-50"
                  >
                    {user ? (
                      <>
                        <div className="border-b border-ink/5 bg-blush-50/50 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                          <p className="truncate text-xs text-ink/50">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/profile" className={menuItem}><FiUser className="text-ink/50" /> My Profile</Link>
                          <Link to="/orders" className={menuItem}><FiPackage className="text-ink/50" /> My Orders</Link>
                          {user.isAdmin && <Link to="/admin" className={`${menuItem} font-medium text-blush-700`}>Admin Dashboard</Link>}
                        </div>
                        <div className="border-t border-ink/5 p-1.5">
                          <button onClick={handleLogout} className={`${menuItem} text-red-600 hover:bg-red-50`}><FiLogOut /> Logout</button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 p-3">
                        <Link to="/login" className="btn-primary w-full !py-2 text-sm">Login</Link>
                        <Link to="/register" className="btn-outline w-full !py-2 text-sm">Create Account</Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/wishlist" className={iconBtn} aria-label="Wishlist">
              <FiHeart size={20} />
              <Badge count={wishlistCount} />
            </Link>

            <Link to="/cart" className={iconBtn} aria-label={`Cart, ${cartCount} items`}>
              <FiShoppingBag size={20} />
              <Badge count={cartCount} dark />
            </Link>
          </div>
        </div>

        {/* Search Drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="absolute left-0 top-full w-full border-b border-ink/5 bg-white shadow-md"
            >
              <div className="mx-auto max-w-3xl px-4 py-3 relative">
                <form onSubmit={handleSearch} className="flex items-center gap-3">
                  <FiSearch className="shrink-0 text-lg text-ink/40" />
                  <input
                    autoFocus
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search serums, lipsticks, fragrances"
                    className="w-full border-none bg-transparent font-serif text-base text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0 md:text-lg"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className={iconBtn} aria-label="Close search">
                    <FiX />
                  </button>
                </form>

                {searchTerm.trim().length > 1 && (
                  <div className="absolute top-full left-0 w-full bg-white mt-1 rounded-xl shadow-xl border border-ink/5 overflow-hidden z-50">
                    {searchLoading ? (
                      <div className="p-4 text-center text-sm text-ink/50">Searching...</div>
                    ) : suggestions.length > 0 ? (
                      <>
                        {suggestions.map((p) => (
                          <Link
                            key={p._id}
                            to={`/product/${p._id}`}
                            onClick={closeAll}
                            className="flex items-center gap-3 p-3 hover:bg-blush-50 transition-colors border-b border-ink/5 last:border-none"
                          >
                            <img src={p.images?.[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-ink truncate">{p.name}</p>
                              <p className="text-xs text-ink/50">{p.brand} · ₹{p.discountPrice || p.price}</p>
                            </div>
                          </Link>
                        ))}
                        <button 
                          onClick={handleSearch}
                          className="w-full text-center text-sm font-semibold text-blush-700 py-2.5 bg-blush-50/50 hover:bg-blush-50 transition-colors"
                        >
                          View all results for "{searchTerm}"
                        </button>
                      </>
                    ) : (
                      <div className="p-4 text-center text-sm text-ink/50">
                        No products found for "{searchTerm}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-[70] flex w-full flex-col bg-[#f5efe6] px-6 pt-4 pb-8 rounded-t-3xl shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
              >
                <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6" />

                <div className="flex items-center justify-between mb-4">
                  <Logo size="sm" />
                  <button onClick={() => setMobileOpen(false)} className={`${iconBtn} bg-black/5`} aria-label="Close menu">
                    <FiX size={20} />
                  </button>
                </div>

                <nav className="flex flex-col gap-1">
                  {links.map((l) => {
                    const active = isActive(l.to);
                    return (
                      <Link
                        key={l.label}
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className={`py-3 px-4 rounded-xl text-base font-semibold transition-colors ${
                          active ? "bg-white/60 text-ink" : "text-ink/80 hover:bg-black/5"
                        }`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                  <Link 
                    to="/wishlist" 
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold text-ink/80 hover:bg-black/5"
                  >
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-white/80 px-2.5 py-0.5 font-sans text-xs text-ink">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </nav>

                <div className="mt-6 pt-6 border-t border-black/10 flex flex-col gap-3">
                  {user ? (
                    <>
                      <div className="mb-2 rounded-xl bg-white/40 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                          <p className="truncate text-xs text-ink/60">{user.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-xs font-semibold text-ink bg-white px-3 py-1.5 rounded-lg shadow-sm">Edit</Link>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Link to="/orders" onClick={() => setMobileOpen(false)} className="btn-outline justify-center !py-2.5 text-sm bg-white/50 border-ink/10">My Orders</Link>
                        {user.isAdmin ? (
                          <Link to="/admin" onClick={() => setMobileOpen(false)} className="btn-outline justify-center !py-2.5 text-sm text-ink border-ink/10 bg-white/50">Admin Panel</Link>
                        ) : (
                          <Link to="/profile" onClick={() => setMobileOpen(false)} className="btn-outline justify-center !py-2.5 text-sm bg-white/50 border-ink/10">My Profile</Link>
                        )}
                      </div>
                      <button onClick={handleLogout} className="mt-2 flex w-full items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-700 bg-white/40 hover:bg-white/60 transition-colors">
                        <FiLogOut /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary justify-center !py-3 text-sm bg-ink text-white">Login</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-outline justify-center !py-3 text-sm bg-white/50 border-ink/10">Create Account</Link>
                    </div>
                  )}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </header>
    </MotionConfig>
  );
};

export default Navbar;