
import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const FALLBACK = [
  "Free shipping on orders above ₹999",
  "Use code MEHRWAN10 for 10% off",
];

const REPEAT = 4;

const AnnouncementBar = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    let active = true;

    API.get("/banners?type=announcement")
      .then((res) => {
        const titles = (res.data || [])
          .map((b) => b.title)
          .filter(Boolean);

        if (active) {
          setMessages(titles.length ? titles : FALLBACK);
        }
      })
      .catch(() => {
        if (active) setMessages(FALLBACK);
      });

    return () => {
      active = false;
    };
  }, []);

  const duration = useMemo(() => {
    const chars = messages.join("").length;
    return Math.max(24, Math.round(chars * 0.5));
  }, [messages]);

  if (messages.length === 0) return null;

  const group = (hidden) =>
    Array.from({ length: REPEAT }).flatMap((_, r) =>
      messages.map((msg, i) => (
        <span
          key={`${r}-${i}`}
          className={`flex shrink-0 items-center ${
            hidden || r > 0 ? "ann-dup" : ""
          }`}
        >
          <span className="px-5 font-semibold">{msg}</span>

          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#8B7563]"
          />
        </span>
      ))
    );

  return (
    <div
      role="region"
      aria-label="Announcements"
      className="ann-bar overflow-hidden bg-[#E8DCCB] text-[#33251D] shadow-sm"
    >
      <style>{`
        @keyframes ann-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .ann-track {
          animation: ann-scroll ${duration}s linear infinite;
        }

        .ann-bar:hover .ann-track,
        .ann-bar:focus-within .ann-track {
          animation-play-state: paused;
        }

        .ann-mask {
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
          mask-image: linear-gradient(
            to right,
            transparent,
            #000 8%,
            #000 92%,
            transparent
          );
        }

        @media (prefers-reduced-motion: reduce) {
          .ann-track {
            animation: none;
            width: 100%;
            justify-content: center;
          }

          .ann-dup {
            display: none;
          }

          .ann-mask {
            -webkit-mask-image: none;
            mask-image: none;
          }
        }
      `}</style>

      <div className="ann-mask">
        <div
          className="ann-track flex h-9 w-max items-center whitespace-nowrap text-[11px] uppercase tracking-widest md:h-10 md:text-xs"
        >
          <div className="flex items-center">
            {group(false)}
          </div>

          <div className="flex items-center" aria-hidden="true">
            {group(true)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBar;
