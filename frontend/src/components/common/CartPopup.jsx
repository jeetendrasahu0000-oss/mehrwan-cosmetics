import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";
import { hideCartPopup } from "../../redux/slices/cartSlice";

const CartPopup = () => {
  const dispatch = useDispatch();
  const { showPopup, lastAddedItem } = useSelector((state) => state.cart);

  // 4 second baad popup apne aap band ho jaye
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        dispatch(hideCartPopup());
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, dispatch]);

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* ✅ Background Overlay (Optional: Sirf mobile par click karne par band hone ke liye) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch(hideCartPopup())}
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px] md:hidden"
          />

          <motion.div
            // ✅ Bottom to Top Animation
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            // ✅ Mobile par bottom sheet, Desktop par right corner
            className="fixed bottom-0 left-0 right-0 z-[9999] flex flex-col rounded-t-3xl bg-white p-5 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] 
                       md:bottom-8 md:left-auto md:right-8 md:w-[340px] md:rounded-2xl md:shadow-2xl border border-ink/5"
          >
            {/* Mobile Drag Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200 md:hidden" />

            {/* Close Button */}
            <button
              onClick={() => dispatch(hideCartPopup())}
              className="absolute top-4 right-4 text-ink/40 hover:text-ink transition-colors p-1"
            >
              <FiX size={18} />
            </button>

            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-100">
                <FiCheck size={24} strokeWidth={2.5} />
              </div>
              
              {/* Text */}
              <div className="pr-6">
                <p className="text-[15px] font-bold text-ink">Added to Cart</p>
                <p className="text-xs text-ink/60 line-clamp-1 mt-0.5">
                  {lastAddedItem || "Product added successfully"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => dispatch(hideCartPopup())}
                className="flex-1 rounded-xl border border-ink/15 py-3 text-sm font-semibold text-ink/70 hover:bg-gray-50 transition-colors"
              >
                Continue
              </button>
              <Link
                to="/cart"
                onClick={() => dispatch(hideCartPopup())}
                className="flex flex-1 items-center justify-center rounded-xl bg-ink py-3 text-sm font-semibold text-white hover:bg-ink/90 transition-colors shadow-sm"
              >
                View Cart
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPopup;