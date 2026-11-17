import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiGrid, FiBox, FiTag, FiShoppingCart, FiUsers, FiPercent, FiStar, FiImage, FiLogOut, FiHome, FiMenu, FiX
} from "react-icons/fi";
import Logo from "../components/common/Logo";
import { logout } from "../redux/slices/authSlice";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: FiGrid, end: true },
  { to: "/admin/products", label: "Products", icon: FiBox },
  { to: "/admin/categories", label: "Categories", icon: FiTag },
  { to: "/admin/orders", label: "Orders", icon: FiShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: FiUsers },
  { to: "/admin/coupons", label: "Coupons", icon: FiPercent },
  { to: "/admin/reviews", label: "Reviews", icon: FiStar },
  { to: "/admin/banners", label: "Banners", icon: FiImage },
];

const AdminLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f5]">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-ink text-cream p-5 fixed inset-y-0 z-40">
        <div className="bg-cream rounded-xl px-3 py-2 inline-block w-fit mb-8">
          <Logo size="sm" />
        </div>
        <nav className="flex-1 space-y-1">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-cream text-ink font-semibold" : "text-cream/60 hover:bg-cream/10 hover:text-cream"
                }`
              }
            >
              <n.icon /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 pt-4 border-t border-cream/10">
          <NavLink to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/60 hover:bg-cream/10">
            <FiHome /> Back to Site
          </NavLink>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-cream/60 hover:bg-red-500/20 hover:text-red-200">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar & Sidebar Drawer */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-ink text-cream sticky top-0 z-30 shadow-md">
          <div className="bg-cream rounded-lg px-2 py-1">
            <Logo size="sm" />
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-2xl p-1">
            <FiMenu />
          </button>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed top-0 left-0 bottom-0 w-[280px] bg-ink text-cream z-50 p-5 lg:hidden flex flex-col shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="bg-cream rounded-lg px-2 py-1">
                    <Logo size="sm" />
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="text-2xl text-cream/70 hover:text-cream">
                    <FiX />
                  </button>
                </div>
                
                <nav className="flex-1 space-y-1 overflow-y-auto">
                  {navItems.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      end={n.end}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                          isActive ? "bg-cream text-ink font-semibold" : "text-cream/60 hover:bg-cream/10 hover:text-cream"
                        }`
                      }
                    >
                      <n.icon /> {n.label}
                    </NavLink>
                  ))}
                </nav>
                
                <div className="space-y-1 pt-4 border-t border-cream/10 mt-auto">
                  <NavLink 
                    to="/" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-cream/60 hover:bg-cream/10"
                  >
                    <FiHome /> Back to Site
                  </NavLink>
                  <button 
                    onClick={handleLogout} 
                    className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-sm text-cream/60 hover:bg-red-500/20 hover:text-red-200"
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="p-4 md:p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;