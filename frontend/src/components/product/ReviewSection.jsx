import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiX,
  FiMessageSquare,
  FiSend,
  FiStar,
  FiCheckCircle,
} from "react-icons/fi";

import { productAPI } from "../../services/productService";
import Rating from "../common/Rating";

const ReviewSection = ({ productId }) => {
  const { user } = useSelector((s) => s.auth || {});

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [popupOpen, setPopupOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const res = await productAPI.getReviews(productId);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Reviews loading failed:", err);
    }
  };

  useEffect(() => {
    load();
  }, [productId]);

  // Prevent background scrolling
  useEffect(() => {
    document.body.style.overflow = popupOpen ? "hidden" : "";
    const handleEscape = (e) => {
      if (e.key === "Escape") setPopupOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [popupOpen]);

  const submit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setMsg("Please write your experience.");
      return;
    }
    setSubmitting(true);
    setMsg("");
    try {
      await productAPI.createReview({ productId, rating, comment: comment.trim() });
      setMsg("Review submitted successfully — pending approval.");
      setComment("");
      setRating(5);
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not submit review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const closePopup = () => {
    setPopupOpen(false);
    setMsg("");
  };

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : "0.0";

  const displayReviews = reviews.length > 0 ? [...reviews, ...reviews, ...reviews] : [];

  return (
    <section className="mt-14 border-t border-ink/10 pt-9 md:mt-16 md:pt-12 overflow-hidden">
      
      {/* ✅ SECTION HEADER (Button removed from here) */}
      <div className="mb-7 px-4 md:px-0">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
          Customer Experience
        </p>
        <h2 className="font-serif text-2xl font-semibold text-ink md:text-3xl">
          Customer Reviews
        </h2>
        <p className="mt-1 text-sm text-ink/50">
          Real experiences from our customers.
        </p>
      </div>

      {/* ✅ RATING SUMMARY & WRITE REVIEW BUTTON */}
      {reviews.length > 0 && (
        <div className="mx-4 md:mx-0 mb-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl border border-ink/5 bg-[#f5efe6]/60 p-5">
          
          <div className="flex items-center gap-4">
            <div className="text-center shrink-0">
              <p className="font-serif text-4xl font-semibold text-ink">
                {averageRating}
              </p>
              <div className="mt-1">
                <Rating value={Number(averageRating)} size={13} />
              </div>
              <p className="mt-1 text-[10px] text-ink/50">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </p>
            </div>
            
            <div className="hidden h-14 w-px bg-ink/10 sm:block" />
            
            <div>
              <p className="text-sm font-semibold text-ink">
                Customer Satisfaction
              </p>
              <p className="mt-1 text-xs leading-relaxed text-ink/50 max-w-[200px] md:max-w-xs">
                Thank you for sharing your experience with Mehrwan.
              </p>
            </div>
          </div>

          {/* ✅ WRITE A REVIEW BUTTON ADDED HERE */}
          <div className="shrink-0">
            {user ? (
              <button
                type="button"
                onClick={() => setPopupOpen(true)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#33251D] px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <FiMessageSquare size={15} />
                Write a Review
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-[#33251D] px-5 py-3 text-xs font-semibold text-white transition hover:bg-black"
              >
                Login to Review
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Agar 0 reviews hain, toh bhi button dikhe iske liye ek fallback */}
      {reviews.length === 0 && (
         <div className="mx-4 md:mx-0 mb-7">
            {user ? (
              <button
                type="button"
                onClick={() => setPopupOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#33251D] px-5 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-black"
              >
                <FiMessageSquare size={15} />
                Write a Review
              </button>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-[#33251D] px-5 py-3 text-xs font-semibold text-white transition hover:bg-black"
              >
                Login to Review
              </Link>
            )}
         </div>
      )}

      {/* REVIEWS - CONTINUOUS SCROLLING CAROUSEL */}
      {reviews.length === 0 ? (
        <div className="mx-4 md:mx-0 rounded-2xl border border-dashed border-ink/15 bg-[#faf7f2] px-5 py-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink/50 shadow-sm">
            <FiMessageSquare size={21} />
          </div>
          <h3 className="font-serif text-lg font-semibold text-ink">
            No Reviews Yet
          </h3>
          <p className="mt-1 text-sm text-ink/50">
            Be the first to share your experience.
          </p>
        </div>
      ) : (
        <div className="relative w-full overflow-hidden py-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent" />

          <motion.div
            className="flex gap-4 w-max hover:[animation-play-state:paused]"
            animate={{ x: ["0%", "-33.33%"] }}
            transition={{
              ease: "linear",
              duration: reviews.length * 5,
              repeat: Infinity,
            }}
          >
            {displayReviews.map((review, index) => (
              <div
                key={`${review._id}-${index}`}
                className="w-[300px] shrink-0 rounded-2xl border border-ink/5 bg-white p-5 shadow-sm transition hover:shadow-md md:w-[350px]"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f5efe6] font-serif text-lg font-semibold text-ink">
                      {(review.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {review.name || "Customer"}
                      </p>
                      <p className="text-[10px] text-ink/40">
                        Verified Customer
                      </p>
                    </div>
                  </div>
                  <Rating value={review.rating} size={12} />
                </div>
                <p className="text-sm leading-relaxed text-ink/60 line-clamp-4">
                  "{review.comment}"
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      )}

      {/* BOTTOM REVIEW POPUP (Unchanged) */}
      <AnimatePresence>
        {popupOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePopup}
              className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-[110] mx-auto flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-[#f5efe6] shadow-2xl"
            >
              <div className="shrink-0 border-b border-ink/10 px-5 pb-4 pt-3 sm:px-7">
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-ink/20" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/40">
                      Mehrwan Cosmetics
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-semibold text-ink sm:text-2xl">
                      Write Your Review
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closePopup}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition hover:bg-ink hover:text-white"
                    aria-label="Close review form"
                  >
                    <FiX size={19} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 sm:px-7">
                <form onSubmit={submit}>
                  <div className="mb-6 flex items-center gap-3 rounded-xl bg-white/70 p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#33251D] font-semibold text-white">
                      {(user?.name || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{user?.name}</p>
                      <p className="text-xs text-ink/50">Sharing your experience</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="mb-3 block text-sm font-semibold text-ink">
                      How would you rate this product?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition duration-200 hover:scale-110"
                        >
                          <FiStar
                            size={30}
                            className={star <= rating ? "fill-[#C69B42] text-[#C69B42]" : "text-ink/20"}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-semibold text-ink/60">{rating}/5</span>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="review-comment" className="mb-2 block text-sm font-semibold text-ink">
                      Your Experience
                    </label>
                    <textarea
                      id="review-comment"
                      required
                      minLength={3}
                      maxLength={1000}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={5}
                      placeholder="Tell us what you loved about this product..."
                      className="w-full resize-none rounded-xl border border-ink/10 bg-white p-4 text-sm text-ink outline-none transition placeholder:text-ink/30 focus:border-ink/40 focus:ring-2 focus:ring-ink/5"
                    />
                    <p className="mt-1 text-right text-[10px] text-ink/40">{comment.length}/1000 characters</p>
                  </div>

                  {msg && (
                    <div className={`mb-4 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed ${
                      msg.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    }`}>
                      {msg.includes("successfully") && <FiCheckCircle className="mt-0.5 shrink-0" />}
                      {msg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || !comment.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#33251D] py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiSend size={15} />
                    {submitting ? "Submitting..." : "Submit Review"}
                  </button>
                  <p className="mt-3 text-center text-[10px] text-ink/40">
                    Your review may appear after admin approval.
                  </p>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReviewSection;