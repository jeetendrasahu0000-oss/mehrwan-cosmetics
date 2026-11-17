import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

const Rating = ({ value = 0, size = 14 }) => {
  return (
    <div className="flex text-blush-500">
      {[1, 2, 3, 4, 5].map((i) => {
        const icon =
          value >= i ? <FaStar size={size} /> : value >= i - 0.5 ? <FaStarHalfAlt size={size} /> : <FaRegStar size={size} />;
        return <span key={i}>{icon}</span>;
      })}
    </div>
  );
};

export default Rating;