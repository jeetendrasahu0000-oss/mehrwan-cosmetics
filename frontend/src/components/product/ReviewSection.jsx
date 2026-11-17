import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { productAPI } from "../../services/productService";
import Rating from "../common/Rating";

const ReviewSection = ({ productId }) => {
  const { user } = useSelector((s) => s.auth);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");

  const load = () =>
    productAPI.getReviews(productId).then((res) => setReviews(res.data)).catch(() => {});

  useEffect(() => {
    load();
  }, [productId]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await productAPI.createReview({ productId, rating, comment });
      setMsg("Review submitted — pending approval.");
      setComment("");
    } catch (err) {
      setMsg(err.response?.data?.message || "Could not submit review");
    }
  };

  return (
    <section className="mt-16 border-t border-ink/10 pt-10">
      <h2 className="section-title font-semibold mb-6">Customer Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-sm text-ink/50 mb-6">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="space-y-4 mb-8">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{r.name}</p>
                <Rating value={r.rating} size={12} />
              </div>
              <p className="text-sm text-ink/60 leading-relaxed">{r.comment}</p>
            </div>
          ))}
        </div>
      )}

      {user ? (
        <form onSubmit={submit} className="bg-blush-50 rounded-2xl p-6 max-w-lg">
          <p className="font-semibold mb-3">Write a review</p>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-ink/60">Rating:</span>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="border border-ink/15 rounded-lg px-3 py-1.5 text-sm outline-none"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} ★</option>
              ))}
            </select>
          </div>
          <textarea
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Share your experience…"
            className="input-field mb-3"
          />
          <button className="btn-primary">Submit Review</button>
          {msg && <p className="text-xs mt-2 text-ink/60">{msg}</p>}
        </form>
      ) : (
        <p className="text-sm text-ink/60">
          Please <Link to="/login" className="text-blush-700 underline">login</Link> to write a review.
        </p>
      )}
    </section>
  );
};

export default ReviewSection;