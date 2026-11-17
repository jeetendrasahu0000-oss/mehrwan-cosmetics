import { useEffect, useState } from "react";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import { adminAPI } from "../../services/adminService";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);

  const load = () => adminAPI.getAllReviews().then((r) => setReviews(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await adminAPI.approveReview(id);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete review?")) return;
    await adminAPI.deleteReview(id);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">Reviews</h1>
      <div className="space-y-2">
        {reviews.map((r) => (
          <div key={r._id} className="bg-white rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{r.name} · <span className="text-ink/40">{r.product?.name}</span></p>
              <p className="text-xs text-ink/60 mt-1 line-clamp-2">{r.comment}</p>
              <p className="text-xs text-blush-500 mt-1">{"★".repeat(r.rating)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {!r.isApproved && (
                <button onClick={() => approve(r._id)} className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <FiCheck size={14} />
                </button>
              )}
              <button onClick={() => remove(r._id)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <FiTrash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-ink/40 text-center py-6 bg-white rounded-2xl">No reviews yet.</p>}
      </div>
    </div>
  );
};

export default AdminReviews;