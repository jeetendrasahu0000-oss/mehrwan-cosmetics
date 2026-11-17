import HeroBanner from "../components/home/HeroBanner";
import CategorySection from "../components/home/CategorySection";
import BestSellers from "../components/home/BestSellers";
import NewArrivals from "../components/home/NewArrivals";
import TrendingProducts from "../components/home/TrendingProducts";
import FeaturedCollections from "../components/home/FeaturedCollections";
import SpecialOffers from "../components/home/SpecialOffers";
import CustomerReviews from "../components/home/CustomerReviews";
import VideoReels from "../components/home/VideoReels"; // 👈 Import kiya
import InstagramGallery from "../components/home/InstagramGallery";
import Newsletter from "../components/home/Newsletter";

const Home = () => (
  <>
    <HeroBanner />
    <CategorySection />
    <BestSellers />
    <NewArrivals />
    <FeaturedCollections />
    <TrendingProducts />
    <SpecialOffers />
    <CustomerReviews />
    <VideoReels />        
    <InstagramGallery />
    <Newsletter />
  </>
);

export default Home;