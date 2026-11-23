import { Outlet } from "react-router-dom";
import AnnouncementBar from "../components/common/AnnouncementBar";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import MobileBottomNav from "../components/common/MobileBottomNav";
import CartPopup from "../components/common/CartPopup"; // ✅ Import

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 pb-16 lg:pb-0"><Outlet /></main>
      <Footer />
      <MobileBottomNav />
      <CartPopup /> {/* ✅ Popup yahan render hoga */}
    </div>
  );
};

export default MainLayout;