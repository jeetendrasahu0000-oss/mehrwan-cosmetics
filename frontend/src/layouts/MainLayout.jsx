import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AnnouncementBar from "../components/common/AnnouncementBar";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
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
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
};

export default MainLayout;