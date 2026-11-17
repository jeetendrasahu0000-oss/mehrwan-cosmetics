import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  const numbers = [...Array(pages).keys()].map((n) => n + 1).slice(
    Math.max(0, page - 2),
    Math.min(pages, page + 1)
  );

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-10 h-10 rounded-full border border-ink/15 flex items-center justify-center disabled:opacity-30 hover:bg-ink hover:text-cream transition-colors"
      >
        <FiChevronLeft />
      </button>
      {numbers.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
            n === page ? "bg-ink text-cream" : "border border-ink/15 hover:bg-blush-100"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="w-10 h-10 rounded-full border border-ink/15 flex items-center justify-center disabled:opacity-30 hover:bg-ink hover:text-cream transition-colors"
      >
        <FiChevronRight />
      </button>
    </div>
  );
};

export default Pagination;