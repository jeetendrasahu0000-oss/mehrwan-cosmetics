import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnnouncementBar from "../components/common/AnnouncementBar";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import MobileBottomNav from "../components/common/MobileBottomNav"; // ✅ Import
import { fetchCart } from "../redux/slices/cartSlice";
import { fetchWishlist } from "../redux/slices/wishlistSlice";

const MainLayout = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
      dispatch(fetchWishlist());
    }
  }, [user, dispatch]);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      {/* ✅ pb-16 add kiya taaki mobile bottom bar content ko na dhake */}
      <main className="flex-1 pb-16 lg:pb-0"><Outlet /></main>
      <Footer />
      <MobileBottomNav /> {/* ✅ Mobile Bottom Bar */}
    </div>
  );
};

export default MainLayout;