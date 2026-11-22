import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingBag,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiChevronDown,
  FiClock,
  FiTrash2,
} from "react-icons/fi";

import Logo from "./Logo";
import { logout } from "../../redux/slices/authSlice";
import API from "../../services/api";

const links = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Shop" },
  { to: "/products?sort=popular", label: "Best Sellers" },
];

const iconBtn =
  "relative inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30";

const menuItem =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-blush-50 hover:text-ink";

const Badge = ({ count, dark }) =>
  count > 0 ? (
    <span
      className={`absolute right-0 top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#f5efe6] px-1 text-[10px] font-bold leading-none text-white shadow-sm ${
       dark ? "bg-[#33251D]" : "bg-[#000000]"
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

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  const [suggestions, setSuggestions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // ✅ Recent Searches State
  const [recentSearches, setRecentSearches] = useState([]);

  const userRef = useRef(null);
  const categoryRef = useRef(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname, search } = useLocation();
  const [searchParams] = useSearchParams();

  const { user } = useSelector((s) => s.auth || {});
  const cartItems = useSelector((s) => s.cart?.cart?.items || []);
  const wishlistCount = useSelector(
    (s) => s.wishlist?.wishlist?.products?.length || 0
  );

  const cartCount = cartItems.reduce((a, i) => a + i.qty, 0);

  // ✅ Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mehrwan_recent_searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      }
    } catch (e) {
      console.error("Failed to parse recent searches");
    }
  }, []);

  // ✅ Save search term
  const saveSearchTerm = (term) => {
    if (!term.trim()) return;
    const cleanTerm = term.trim();
    const updated = [cleanTerm, ...recentSearches.filter((t) => t !== cleanTerm)].slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem("mehrwan_recent_searches", JSON.stringify(updated));
  };

  // ✅ Remove one recent search
  const removeRecentSearch = (term, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((t) => t !== term);
    setRecentSearches(updated);
    localStorage.setItem("mehrwan_recent_searches", JSON.stringify(updated));
  };

  // ✅ Clear all
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("mehrwan_recent_searches");
  };

  const closeAll = () => {
    setMobileOpen(false);
    setSearchOpen(false);
    setUserMenu(false);
    setCategoryOpen(false);
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
    const fetchCategories = async () => {
      setCatLoading(true);
      try {
        const res = await API.get("/categories");
        setCategories(Array.isArray(res.data) ? res.data : res.data?.categories || []);
      } catch (err) {
        console.error("Navbar categories fetch error:", err);
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeAll();
    };

    const onClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserMenu(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  // Debounced search suggestions
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await API.get("/products", {
          params: { keyword: searchTerm, limit: 5 },
        });
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
      return [...new URLSearchParams(query)].every(
        ([k, v]) => have.get(k) === v
      );
    }
    return !have.has("category") && !have.has("sort");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    saveSearchTerm(term);
    navigate(`/products?keyword=${encodeURIComponent(term)}`);
    closeAll();
  };

  const handleRecentClick = (term) => {
    saveSearchTerm(term);
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
        className={`sticky top-0 z-50 border-b bg-[#f5efe6] transition-shadow duration-200 ${
          scrolled ? "border-ink/10 shadow-sm" : "border-transparent"
        }`}
      >
        <div className="relative mx-auto grid h-[68px] max-w-7xl grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-1 px-3 sm:px-4 md:h-20 md:px-8">
          
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={`${iconBtn} lg:hidden`}
              aria-label="Open menu"
            >
              <FiMenu size={23} />
            </button>

            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
              <Link
                to="/"
                className={`relative whitespace-nowrap py-1 text-sm font-medium transition-colors ${
                  isActive("/") ? "text-ink" : "text-ink/60 hover:text-ink"
                }`}
              >
                Home
                <span className={`absolute -bottom-0.5 left-0 h-px bg-ink transition-all duration-300 ${isActive("/") ? "w-full" : "w-0"}`} />
              </Link>

              <Link
                to="/products"
                className={`relative whitespace-nowrap py-1 text-sm font-medium transition-colors ${
                  isActive("/products") ? "text-ink" : "text-ink/60 hover:text-ink"
                }`}
              >
                Shop
                <span className={`absolute -bottom-0.5 left-0 h-px bg-ink transition-all duration-300 ${isActive("/products") ? "w-full" : "w-0"}`} />
              </Link>

              <div ref={categoryRef} className="relative flex items-center">
                <button
                  onClick={() => setCategoryOpen((v) => !v)}
                  className={`relative flex items-center gap-1 whitespace-nowrap py-1 text-sm font-medium transition-colors ${
                    categoryOpen || searchParams.get("category") ? "text-ink" : "text-ink/60 hover:text-ink"
                  }`}
                >
                  Category
                  <FiChevronDown className={`text-xs transition-transform duration-200 ${categoryOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {categoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute left-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-xl border border-ink/5 bg-white shadow-xl"
                    >
                      <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
                        {catLoading ? (
                          <div className="space-y-2 p-2">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="h-5 w-full animate-pulse rounded bg-gray-100" />
                            ))}
                          </div>
                        ) : categories.length > 0 ? (
                          categories.map((cat) => (
                            <Link
                              key={cat._id}
                              to={`/products?category=${cat._id}`}
                              onClick={() => setCategoryOpen(false)}
                              className="block rounded-lg px-3 py-2 text-sm text-ink/80 transition-colors hover:bg-blush-50 hover:text-ink"
                            >
                              {cat.name}
                            </Link>
                          ))
                        ) : (
                          <div className="p-3 text-center text-sm text-ink/50">
                            No categories found
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                to="/products?sort=popular"
                className={`relative whitespace-nowrap py-1 text-sm font-medium transition-colors ${
                  isActive("/products?sort=popular") ? "text-ink" : "text-ink/60 hover:text-ink"
                }`}
              >
                Best Sellers
                <span className={`absolute -bottom-0.5 left-0 h-px bg-ink transition-all duration-300 ${isActive("/products?sort=popular") ? "w-full" : "w-0"}`} />
              </Link>
            </nav>
          </div>

          <div className="flex min-w-0 items-center justify-center overflow-hidden px-1 lg:justify-center">
            <div className="max-w-full [&_img]:mx-auto [&_img]:max-w-full">
              <Logo />
            </div>
          </div>

          <div className="flex items-center justify-end gap-0 sm:gap-1">
            <button
              type="button"
              onClick={() => {
                setUserMenu(false);
                setCategoryOpen(false);
                setSearchOpen((v) => !v);
              }}
              className={iconBtn}
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <FiSearch size={21} />
            </button>

            <div ref={userRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen(false);
                  setCategoryOpen(false);
                  setUserMenu((v) => !v);
                }}
                className={`${iconBtn} ${
                  user ? "lg:w-auto lg:gap-1.5 lg:px-3 lg:text-sm lg:font-medium" : ""
                }`}
                aria-label="Account"
              >
                <FiUser size={20} />
                {user && <span className="hidden lg:block">{user.name?.split(" ")[0]}</span>}
              </button>

              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-ink/5 bg-white shadow-lg"
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
                          <button onClick={handleLogout} className={`${menuItem} text-red-600 hover:bg-red-50`}>
                            <FiLogOut /> Logout
                          </button>
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

            <Link to="/wishlist" className={iconBtn} aria-label={`Wishlist, ${wishlistCount} items`}>
              <FiHeart size={21} />
              <Badge count={wishlistCount} />
            </Link>

            <Link to="/cart" className={iconBtn} aria-label={`Cart, ${cartCount} items`}>
              <FiShoppingBag size={21} />
              <Badge count={cartCount} dark />
            </Link>
          </div>
        </div>

        {/* ✅ TOP SEARCH DROPDOWN (With Recent Searches) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full z-40 w-full overflow-visible border-b border-ink/5 bg-white shadow-md"
            >
              <div className="relative mx-auto max-w-3xl px-4 py-4 md:py-5">
                <form onSubmit={handleSearch} className="relative flex items-center gap-3">
                  <FiSearch className="shrink-0 text-lg text-ink/40" />
                  <input
                    autoFocus
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search serums, lipsticks, fragrances..."
                    className="w-full border-none bg-transparent font-serif text-base text-ink placeholder:text-ink/30 focus:outline-none focus:ring-0 md:text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchTerm("");
                      setSuggestions([]);
                    }}
                    className={iconBtn}
                    aria-label="Close search"
                  >
                    <FiX />
                  </button>
                </form>

                {/* ✅ RECENT SEARCHES & SUGGESTIONS DROPDOWN */}
                <div className="absolute left-0 top-full mt-1 w-full overflow-hidden rounded-b-xl bg-white shadow-xl">
                  
                  {/* Recent Searches (Only show if no active search text) */}
                  {!searchTerm && recentSearches.length > 0 && (
                    <div className="p-4 border-b border-ink/5">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-ink/70">Recent Searches</h3>
                        <button
                          onClick={clearRecentSearches}
                          className="flex items-center gap-1 text-xs font-medium text-[#A64D5A] hover:text-[#8b3f4b]"
                        >
                          <FiTrash2 size={12} /> Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, idx) => (
                          <div
                            key={idx}
                            className="group flex items-center gap-2 rounded-full bg-[#f5efe6] px-3 py-1.5 text-sm text-ink shadow-sm transition-all hover:bg-white cursor-pointer"
                            onClick={() => handleRecentClick(term)}
                          >
                            <FiClock className="text-ink/40 group-hover:text-ink/60" size={13} />
                            <span className="max-w-[120px] truncate">{term}</span>
                            <button
                              onClick={(e) => removeRecentSearch(term, e)}
                              className="ml-0.5 text-ink/30 hover:text-red-500"
                            >
                              <FiX size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Right Now (Only show if no active search text) */}
                  {!searchTerm && recentSearches.length === 0 && (
                    <div className="p-4 border-b border-ink/5">
                      <h3 className="mb-3 text-xs font-semibold text-ink/70">Popular Right Now</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Vitamin C Serum", "Matte Lipstick", "Face Wash", "Sunscreen"].map((term) => (
                           <button
                             key={term}
                             onClick={() => handleRecentClick(term)}
                             className="rounded-full border border-ink/10 bg-transparent px-3 py-1.5 text-xs text-ink/70 hover:bg-[#f5efe6] hover:text-ink transition-all"
                           >
                             {term}
                           </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Live Suggestions */}
                  {searchTerm.trim().length > 1 && (
                    <div>
                      {searchLoading ? (
                        <div className="p-6 text-center text-sm text-ink/50">Searching...</div>
                      ) : suggestions.length > 0 ? (
                        <>
                          <div className="p-2">
                            {suggestions.map((p) => (
                              <Link
                                key={p._id}
                                to={`/product/${p._id}`}
                                onClick={closeAll}
                                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-blush-50"
                              >
                                <img src={p.images?.[0]} alt={p.name} className="h-10 w-10 rounded bg-gray-100 object-cover" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-ink">{p.name}</p>
                                  <p className="text-xs text-ink/50">{p.brand} · ₹{p.discountPrice || p.price}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                          <button 
                            onClick={handleSearch} 
                            className="w-full bg-blush-50/50 py-2.5 text-center text-sm font-semibold text-blush-700 transition-colors hover:bg-blush-50"
                          >
                            View all results for "{searchTerm}"
                          </button>
                        </>
                      ) : (
                        <div className="p-6 text-center text-sm text-ink/50">No products found for "{searchTerm}"</div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[85vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-[#f5efe6] px-6 pb-8 pt-4 shadow-2xl lg:hidden"
              >
                <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-black/10" />
                <div className="mb-4 flex items-center justify-between">
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
                        className={`rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                          active ? "bg-white/60 text-ink" : "text-ink/80 hover:bg-black/5"
                        }`}
                      >
                        {l.label}
                      </Link>
                    );
                  })}

                  <div className="mt-2 mb-2">
                     <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wider text-ink/40">Categories</p>
                     <div className="max-h-[200px] overflow-y-auto pl-4 pr-2 custom-scrollbar">
                       {categories.map((cat) => (
                         <Link
                           key={cat._id}
                           to={`/products?category=${cat._id}`}
                           onClick={() => setMobileOpen(false)}
                           className="block rounded-lg px-4 py-2.5 text-sm font-medium text-ink/70 hover:bg-black/5"
                         >
                           {cat.name}
                         </Link>
                       ))}
                     </div>
                  </div>

                  <Link
                    to="/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-base font-semibold text-ink/80 hover:bg-black/5"
                  >
                    Wishlist
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-[#A64D5A] px-2.5 py-0.5 font-sans text-xs text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </nav>

                <div className="mt-6 flex flex-col gap-3 border-t border-black/10 pt-6">
                  {user ? (
                    <>
                      <div className="mb-2 flex items-center justify-between rounded-xl bg-white/40 px-4 py-3 backdrop-blur-sm">
                        <div>
                          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                          <p className="truncate text-xs text-ink/60">{user.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow-sm">
                          Edit
                        </Link>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link to="/orders" onClick={() => setMobileOpen(false)} className="btn-outline justify-center !py-2.5 text-sm border-ink/10 bg-white/50">
                          My Orders
                        </Link>
                        {user.isAdmin ? (
                          <Link to="/admin" onClick={() => setMobileOpen(false)} className="btn-outline justify-center !py-2.5 text-sm border-ink/10 bg-white/50">
                            Admin Panel
                          </Link>
                        ) : (
                          <Link to="/profile" onClick={() => setMobileOpen(false)} className="btn-outline justify-center !py-2.5 text-sm border-ink/10 bg-white/50">
                            My Profile
                          </Link>
                        )}
                      </div>

                      <button onClick={handleLogout} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white/40 py-2.5 text-sm font-medium text-red-700 transition-colors hover:bg-white/60">
                        <FiLogOut /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary justify-center !bg-ink !py-3 text-sm text-white">
                        Login
                      </Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-outline justify-center border-ink/10 bg-white/50 !py-3 text-sm">
                        Create Account
                      </Link>
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