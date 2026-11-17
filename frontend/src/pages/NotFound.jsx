import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const NotFound = () => (
  <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center px-4 py-12 text-center md:min-h-[60vh]">
    <p className="font-serif text-6xl font-semibold leading-none text-ink/15 md:text-7xl" aria-hidden="true">
      404
    </p>
    <h1 className="mt-4 font-serif text-2xl font-semibold text-ink md:text-3xl">
      Page not found
    </h1>
    <p className="mt-2 text-sm text-ink/60">
      The page you are looking for may have moved or no longer exists.
    </p>

    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Link to="/" className="btn-primary !px-5 !py-2.5 text-sm">
        Back to home
      </Link>
      <Link to="/products" className="btn-outline !px-5 !py-2.5 text-sm">
        Shop products <FiArrowRight aria-hidden="true" />
      </Link>
    </div>
  </div>
);

export default NotFound;