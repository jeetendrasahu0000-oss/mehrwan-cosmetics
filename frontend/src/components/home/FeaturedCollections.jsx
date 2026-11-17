import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const collections = [
  {
    title: "The Glow Ritual",
    desc: "Serums & essences for luminous skin",
    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    link: "/products",
  },
  {
    title: "Velvet Lips",
    desc: "Rich, long-wear lip colour",
    img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80",
    link: "/products",
  },
];

const FeaturedCollections = () => (
  <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-20">
    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
      {collections.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
        >
          <Link to={c.link} className="group block relative rounded-3xl overflow-hidden aspect-[16/10]">
            <img src={c.img} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-ink/20 to-transparent" />
            <div className="absolute inset-y-0 left-6 md:left-10 flex flex-col justify-center max-w-xs">
              <p className="text-[10px] tracking-[0.3em] uppercase text-cream/80 font-semibold mb-3">Featured</p>
              <h3 className="font-serif text-3xl md:text-4xl text-cream font-semibold leading-tight">{c.title}</h3>
              <p className="text-cream/70 text-sm mt-2">{c.desc}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-cream text-sm font-medium border-b border-cream/40 pb-1 w-fit group-hover:gap-3 transition-all">
                Shop now →
              </span>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </section>
);

export default FeaturedCollections;