import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";
import Rating from "../common/Rating";

const reviews = [
  { name: "Aarohi S.", text: "The Hydra Glow Serum completely transformed my skin — it's dewy without being greasy. Obsessed.", rating: 5 },
  { name: "Priya M.", text: "Elegant packaging, luxurious feel, and the velvet lipstick lasts all day. Mehrwan is my new go-to.", rating: 5 },
  { name: "Sana K.", text: "Finally a clean beauty brand that actually delivers visible results. My skin has never looked brighter.", rating: 5 },
];

const CustomerReviews = () => (
  <section className="bg-ink text-cream py-16 md:py-24">
    <div className="max-w-7xl mx-auto px-4 md:px-8">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-blush-300 font-semibold mb-2">Real reviews</p>
        <h2 className="font-serif text-3xl md:text-4xl font-semibold">Loved by Thousands</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-cream/5 backdrop-blur border border-cream/10 rounded-2xl p-7"
          >
            <FaQuoteLeft className="text-blush-300/60 mb-4" />
            <p className="text-cream/80 leading-relaxed text-sm">"{r.text}"</p>
            <div className="mt-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-cream text-sm">{r.name}</p>
                <p className="text-[11px] text-cream/40 mt-0.5">Verified buyer</p>
              </div>
              <Rating value={r.rating} size={12} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default CustomerReviews;