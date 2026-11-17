import { useEffect, useState } from "react";
import { FiInstagram } from "react-icons/fi";
import API from "../../services/api";

const InstagramGallery = () => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    // API se 'instagram' type ke banners fetch karo
    API.get("/banners?type=instagram")
      .then((res) => {
        console.log("Instagram Banners:", res.data);
        if (res.data && res.data.length > 0) {
          setBanners(res.data);
        }
      })
      .catch((err) => console.log("Error fetching Instagram banners:", err));
  }, []);

  // Fallback images agar admin panel se koi banner na add kiya ho
  const fallbackImgs = [
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400&q=80",
    "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=80",
    "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=400&q=80",
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80",
    "https://images.unsplash.com/photo-1503236823255-94609f598e71?w=400&q=80",
  ];

  // Agar DB me banners hain to unhe use karo, warna fallback
  const displayImages = banners.length > 0 
    ? banners.map(b => ({ id: b._id, image: b.image, link: b.link }))
    : fallbackImgs.map((img, i) => ({ id: i, image: img, link: "#" }));

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-blush-600 font-semibold mb-2">
          @mehrwan.beauty
        </p>
        <h2 className="section-title font-semibold">Follow Our Glow</h2>
      </div>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
        {displayImages.map((item, i) => (
          <a
            key={item.id}
            href={item.link || "#"}
            target={item.link ? "_blank" : "_self"}
            rel="noreferrer"
            className="group relative aspect-square rounded-xl overflow-hidden"
          >
            <img
              src={item.image}
              alt={`Instagram ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 flex items-center justify-center transition-colors">
              <FiInstagram className="text-cream text-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default InstagramGallery;