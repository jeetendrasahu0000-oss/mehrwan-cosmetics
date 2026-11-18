import { useEffect, useState } from "react";
import {
  FiCheck,
  FiTrash2,
  FiStar,
  FiMessageSquare,
  FiUser,
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    try {
      const res = await adminAPI.getAllReviews();
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      setProcessing(id);
      await adminAPI.approveReview(id);
      await load();
    } catch (err) {
      console.error("Review approval failed:", err);
      alert("Failed to approve review.");
    } finally {
      setProcessing(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      setProcessing(id);
      await adminAPI.deleteReview(id);
      await load();
    } catch (err) {
      console.error("Review deletion failed:", err);
      alert("Failed to delete review.");
    } finally {
      setProcessing(null);
    }
  };

  const approvedCount = reviews.filter((r) => r.isApproved).length;
  const pendingCount = reviews.length - approvedCount;

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  const formatDate = (date) => {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen space-y-7 pb-10">

      {/* Header */}
      <div>
        <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#a1816d]">
          <FiMessageSquare size={13} />
          Customer Feedback
        </div>

        <h1 className="text-2xl font-semibold tracking-tight text-[#33251D] sm:text-3xl">
          Reviews Management
        </h1>

        <p className="mt-1.5 text-xs text-[#9b897c] sm:text-sm">
          Manage customer feedback, approve reviews and maintain your store reputation.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        <div className="rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#9b897c] sm:text-xs">
              Total Reviews
            </span>
            <FiMessageSquare className="text-[#947761]" size={17} />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#33251D]">
            {reviews.length}
          </p>
          <p className="mt-1 text-[10px] text-[#9b897c]">
            All customer reviews
          </p>
        </div>

        <div className="rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#9b897c] sm:text-xs">
              Approved
            </span>
            <FiCheckCircle className="text-green-600" size={17} />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#33251D]">
            {approvedCount}
          </p>
          <p className="mt-1 text-[10px] text-green-600">
            Published reviews
          </p>
        </div>

        <div className="rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#9b897c] sm:text-xs">
              Pending
            </span>
            <FiClock className="text-amber-600" size={17} />
          </div>
          <p className="mt-3 text-2xl font-bold text-[#33251D]">
            {pendingCount}
          </p>
          <p className="mt-1 text-[10px] text-amber-600">
            Awaiting approval
          </p>
        </div>

        <div className="rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#9b897c] sm:text-xs">
              Average Rating
            </span>
            <FiStar className="fill-amber-400 text-amber-400" size={17} />
          </div>
          <p className="mt-3 flex items-center gap-1.5 text-2xl font-bold text-[#33251D]">
            {averageRating}
            <span className="text-sm text-amber-500">★</span>
          </p>
          <p className="mt-1 text-[10px] text-[#9b897c]">
            Overall customer rating
          </p>
        </div>

      </div>

      {/* Reviews Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#33251D]">
            Customer Reviews
          </h2>
          <p className="mt-1 text-[11px] text-[#9b897c]">
            Review and manage customer submissions
          </p>
        </div>

        <span className="rounded-full bg-[#f0e8df] px-3 py-1.5 text-[10px] font-semibold text-[#795e4c]">
          {reviews.length} Reviews
        </span>
      </div>

      {/* Review List */}
      <div className="space-y-3">

        {loading ? (
          <div className="rounded-2xl border border-[#33251D]/10 bg-white py-16 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#33251D]/15 border-t-[#80644f]" />
            <p className="mt-3 text-xs text-[#9b897c]">
              Loading reviews...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#33251D]/15 bg-white px-5 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5efe6] text-[#947761]">
              <FiMessageSquare size={24} />
            </div>

            <h3 className="mt-4 text-base font-semibold text-[#33251D]">
              No Reviews Yet
            </h3>

            <p className="mt-1.5 text-xs text-[#9b897c]">
              Customer reviews will appear here when submitted.
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <article
              key={review._id}
              className="rounded-2xl border border-[#33251D]/10 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                {/* Review Details */}
                <div className="min-w-0 flex-1">

                  {/* Customer */}
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f3e9df] text-sm font-bold uppercase text-[#80644f]">
                      {review.name?.charAt(0) || "U"}
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#33251D]">
                        {review.name || "Anonymous"}
                      </h3>

                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#9b897c]">
                        <FiClock size={11} />
                        {formatDate(review.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FiStar
                          key={star}
                          size={13}
                          className={
                            star <= Number(review.rating)
                              ? "fill-current"
                              : "text-[#e4ddd5]"
                          }
                        />
                      ))}
                    </div>

                    <span className="text-[10px] font-semibold text-[#80644f]">
                      {review.rating}/5
                    </span>
                  </div>

                  {/* Comment */}
                  <p className="mt-3 whitespace-pre-wrap break-words text-xs leading-6 text-[#6f5b4d]">
                    {review.comment || "No comment provided."}
                  </p>

                  {/* Product */}
                  <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg bg-[#faf7f2] px-3 py-2">
                    <FiPackage
                      size={13}
                      className="shrink-0 text-[#947761]"
                    />

                    <span className="truncate text-[10px] font-medium text-[#80644f]">
                      {review.product?.name || "Product unavailable"}
                    </span>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#33251D]/10 pt-3 sm:flex-col sm:items-end sm:border-0 sm:pt-0">

                  <span
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider ${
                      review.isApproved
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {review.isApproved ? (
                      <FiCheckCircle size={12} />
                    ) : (
                      <FiAlertCircle size={12} />
                    )}

                    {review.isApproved ? "Approved" : "Pending"}
                  </span>

                  <div className="flex items-center gap-2">

                    {!review.isApproved && (
                      <button
                        type="button"
                        disabled={processing === review._id}
                        onClick={() => approve(review._id)}
                        title="Approve Review"
                        className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-green-50 px-3 text-[10px] font-semibold text-green-700 transition-colors hover:bg-green-600 hover:text-white disabled:opacity-50"
                      >
                        <FiCheck size={14} />
                        Approve
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={processing === review._id}
                      onClick={() => remove(review._id)}
                      title="Delete Review"
                      className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
                    >
                      <FiTrash2 size={14} />
                    </button>

                  </div>
                </div>

              </div>
            </article>
          ))
        )}

      </div>
    </div>
  );
};

export default AdminReviews;