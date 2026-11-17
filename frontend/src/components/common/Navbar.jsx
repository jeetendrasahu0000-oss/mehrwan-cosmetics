import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  FiSearch, FiUser, FiHeart, FiShoppingBag, FiMenu, FiX, FiLogOut, FiPackage,
} from "react-icons/fi";
import Logo from "./Logo";
import { logout } from "../../redux/slices/authSlice";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/products?category=skincare", label: "Skincare" },
  { to: "/products?sort=popular", label: "Best Sellers" },
];

const iconBtn =
  "relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[19px] text-ink " +
  "transition-colors hover:bg-ink/5 hover:text-blush-600 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";

const menuItem =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/80 " +
  "transition-colors hover:bg-blush-50 hover:text-ink";

const Badge = ({ count, dark }) =>
  count > 0 ? (
    <span
      className={`absolute right-0 top-0 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold leading-none ${
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
  };

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route badalte hi sab menus band
  useEffect(() => {
    closeAll();
  }, [pathname, search]);

  // Escape se band + bahar click par user menu band
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

  // Mobile drawer khula ho to page scroll lock
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Query wale links ke liye sahi active state (NavLink sirf pathname dekhta hai)
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
    setSearchTerm("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    closeAll();
    navigate("/");
  };

  return (
    <MotionConfig reducedMotion="user">
      <header
        className={`sticky top-0 z-50 border-b bg-[#faf7f2] transition-shadow duration-200 ${
          scrolled ? "border-ink/5 shadow-sm" : "border-transparent"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 md:h-16 md:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className={`${iconBtn} -ml-1 lg:hidden`}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <FiMenu />
          </button>

          <Logo />

          {/* Desktop navigation */}
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
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-ink transition-all duration-300 ${
                      active ? "w-full" : "w-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-0.5 md:gap-1">
            <button
              onClick={() => {
                setUserMenu(false);
                setSearchOpen((v) => !v);
              }}
              className={iconBtn}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <FiSearch />
            </button>

            {/* Account (sm+) */}
            <div ref={userRef} className="relative hidden sm:block">
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setUserMenu((v) => !v);
                }}
                className={`${iconBtn} ${user ? "lg:w-auto lg:gap-1.5 lg:px-3 lg:text-sm lg:font-medium" : ""}`}
                aria-label="Account"
                aria-expanded={userMenu}
              >
                <FiUser />
                {user && <span className="hidden lg:block">{user.name.split(" ")[0]}</span>}
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-ink/5 bg-white shadow-lg"
                  >
                    {user ? (
                      <>
                        <div className="border-b border-ink/5 bg-blush-50/50 px-4 py-3">
                          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                          <p className="truncate text-xs text-ink/50">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link to="/profile" className={menuItem}>
                            <FiUser className="text-ink/50" /> My Profile
                          </Link>
                          <Link to="/orders" className={menuItem}>
                            <FiPackage className="text-ink/50" /> My Orders
                          </Link>
                          {user.isAdmin && (
                            <Link to="/admin" className={`${menuItem} font-medium text-blush-700`}>
                              Admin Dashboard
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-ink/5 p-1.5">
                          <button
                            onClick={handleLogout}
                            className={`${menuItem} text-red-600 hover:bg-red-50 hover:text-red-700`}
                          >
                            <FiLogOut /> Logout
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 p-3">
                        <Link to="/login" className="btn-primary w-full !py-2 text-sm">
                          Login
                        </Link>
                        <Link to="/register" className="btn-outline w-full !py-2 text-sm">
                          Create Account
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist (sm+) */}
            <Link to="/wishlist" className={`${iconBtn} hidden sm:inline-flex`} aria-label="Wishlist">
              <FiHeart />
              <Badge count={wishlistCount} />
            </Link>

            {/* Cart */}
            <Link to="/cart" className={iconBtn} aria-label={`Cart, ${cartCount} items`}>
              <FiShoppingBag />
              <Badge count={cartCount} dark />
            </Link>
          </div>
        </div>

        {/* Search drawer */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full w-full overflow-hidden border-b border-ink/5 bg-white shadow-md"
            >
              <form
                onSubmit={handleSearch}
                role="search"
                className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3"
              >
                <FiSearch className="shrink-0 text-lg text-ink/40" />
                <input
                  autoFocus
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search serums, lipsticks, fragrances"
                  aria-label="Search products"
                  className="w-full border-none bg-transparent font-serif text-base text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0 md:text-lg"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className={iconBtn}
                  aria-label="Close search"
                >
                  <FiX />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-[60] bg-black/50 lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
                className="fixed bottom-0 left-0 top-0 z-[70] flex w-[85%] max-w-[300px] flex-col bg-white p-5 shadow-2xl lg:hidden"
              >
                <div className="mb-5 flex items-center justify-between">
                  <Logo size="sm" />
                  <button
                    onClick={() => setMobileOpen(false)}
                    className={`${iconBtn} -mr-1`}
                    aria-label="Close menu"
                  >
                    <FiX />
                  </button>
                </div>

                <nav className="flex flex-col" aria-label="Mobile">
                  {links.map((l) => {
                    const active = isActive(l.to);
                    return (
                      <Link
                        key={l.label}
                        to={l.to}
                        aria-current={active ? "page" : undefined}
                        className={`border-b border-ink/5 py-3 font-serif text-base font-semibold transition-colors ${
                          active ? "text-blush-700" : "text-ink"
                        }`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}
                  <Link
                    to="/wishlist"
                    className="flex items-center justify-between border-b border-ink/5 py-3 font-serif text-base font-semibold text-ink"
                  >
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-blush-50 px-2 py-0.5 font-sans text-xs text-blush-700">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </nav>

                <div className="mt-auto flex flex-col gap-2 pt-6">
                  {user ? (
                    <>
                      <div className="mb-1 rounded-xl border border-blush-100 bg-blush-50 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                        <p className="truncate text-xs text-ink/50">{user.email}</p>
                      </div>
                      <Link to="/profile" className="btn-outline w-full justify-center !py-2 text-sm">
                        My Profile
                      </Link>
                      <Link to="/orders" className="btn-outline w-full justify-center !py-2 text-sm">
                        My Orders
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="btn-outline w-full justify-center border-blush-200 !py-2 text-sm text-blush-700"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        <FiLogOut /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="btn-primary w-full justify-center !py-2 text-sm">
                        Login
                      </Link>
                      <Link to="/register" className="btn-outline w-full justify-center !py-2 text-sm">
                        Create Account
                      </Link>
                    </>
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