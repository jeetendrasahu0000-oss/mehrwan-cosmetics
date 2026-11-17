
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowUpRight } from "react-icons/fi";

const collections = [
  {
    number: "01",
    title: "The Glow Ritual",
    subtitle: "SKINCARE COLLECTION",
    desc: "Serums & essences for luminous, naturally radiant skin.",
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&q=85",
    link: "/products",
  },
  {
    number: "02",
    title: "Velvet Lips",
    subtitle: "LIP CARE COLLECTION",
    desc: "Discover rich shades and luxurious long-wear lip colour.",
    img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=1200&q=85",
    link: "/products",
  },
];

const FeaturedCollections = () => {
  return (
    <section className="overflow-hidden bg-[#F5EFE6] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8">

        {/* Section Heading */}
        <div className="mb-7 flex items-end justify-between gap-4 md:mb-9">
          <div>
            <span className="mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.3em] text-blush-600">
              Explore our world
            </span>

            <h2 className="font-serif text-2xl font-semibold text-ink md:text-3xl">
              Featured Collections
              <span className="text-blush-500">.</span>
            </h2>
          </div>

          <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-ink/40 sm:block">
            Curated beauty essentials
          </span>
        </div>

        {/* Collection Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.65,
                delay: index * 0.12,
                ease: "easeOut",
              }}
            >
              <Link
                to={collection.link}
                className="group relative block aspect-[5/4] overflow-hidden rounded-2xl bg-[#D8C9B8] md:aspect-[4/3]"
              >
                {/* Background Image */}
                <img
                  src={collection.img}
                  alt={collection.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#211711]/75 via-[#211711]/30 to-transparent transition-opacity duration-500 group-hover:from-[#211711]/80" />

                {/* Bottom Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

                {/* Collection Number */}
                <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-[10px] font-medium tracking-wider text-white backdrop-blur-sm md:right-7 md:top-7">
                  {collection.number}
                </div>

                {/* Content */}
                <div className="absolute inset-y-0 left-0 flex max-w-[85%] flex-col justify-center px-6 py-7 sm:max-w-[75%] md:px-9 lg:px-11">

                  <span className="mb-3 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#E9D4BF] md:text-[10px]">
                    {collection.subtitle}
                  </span>

                  <h3 className="font-serif text-3xl font-medium leading-tight text-white sm:text-4xl lg:text-[42px]">
                    {collection.title}
                  </h3>

                  <p className="mt-3 max-w-[260px] text-xs leading-relaxed text-white/75 md:text-sm">
                    {collection.desc}
                  </p>

                  {/* Shop Button */}
                  <div className="mt-6 inline-flex w-fit items-center gap-3 border-b border-white/50 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition-all duration-300 group-hover:gap-5 group-hover:border-white md:mt-8">
                    Explore Collection

                    <FiArrowUpRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    />
                  </div>
                </div>

                {/* Hover Border */}
                <div className="pointer-events-none absolute inset-3 rounded-xl border border-white/0 transition-all duration-500 group-hover:border-white/30 md:inset-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCollections;
