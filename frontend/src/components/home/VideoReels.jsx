import { useEffect, useState } from "react";
import { FiPlay } from "react-icons/fi";
import API from "../../services/api";

const VideoReels = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // DB se 'video' type ke banners fetch karo
    API.get("/banners?type=video")
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setVideos(res.data);
        }
      })
      .catch((err) => console.log("Error fetching videos:", err));
  }, []);

  if (videos.length === 0) return null; // Agar video nahi hai to section hide rahega

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
      <div className="text-center mb-10">
        <p className="text-[11px] tracking-[0.3em] uppercase text-blush-600 font-semibold mb-2">Watch & Shop</p>
        <h2 className="section-title font-semibold">Mehrwan Reels</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videos.map((vid) => (
          <a
            key={vid._id}
            href={vid.link || "#"}
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-ink block cursor-pointer"
          >
            {/* Thumbnail Image */}
            <img
              src={vid.image}
              alt={vid.title || "Reel"}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white border border-white/50 group-hover:scale-110 transition-transform duration-300">
                <FiPlay className="ml-1" size={24} />
              </div>
            </div>
            
            {/* Text Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-ink/90 to-transparent">
              <p className="text-white text-sm font-semibold truncate">{vid.title}</p>
              <p className="text-white/70 text-xs truncate">{vid.subtitle}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};

export default VideoReels;