import { Outlet } from "react-router-dom";
import AnnouncementBar from "../components/common/AnnouncementBar";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";

const UserLayout = () => (
  <div className="min-h-screen flex flex-col">
    <AnnouncementBar />
    <Navbar />
    <main className="flex-1"><Outlet /></main>
    <Footer />
  </div>
);

export default UserLayout;