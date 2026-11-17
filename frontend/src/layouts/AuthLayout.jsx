import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/common/Logo";

const AuthLayout = () => (
  <div className="min-h-screen grid lg:grid-cols-2">
    <div className="hidden lg:block relative bg-gradient-to-br from-blush-200 via-nude-100 to-cream">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-8"><Logo size="lg" /></div>
        <h2 className="font-serif text-4xl font-semibold text-ink leading-tight max-w-sm">
          Beauty, thoughtfully formulated.
        </h2>
        <p className="text-ink/60 mt-4 max-w-xs text-sm">
          Clean, cruelty-free essentials for your most radiant self.
        </p>
      </div>
    </div>
    <div className="flex items-center justify-center p-6 md:p-12 bg-cream">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full flex justify-center">
        <Outlet />
      </motion.div>
    </div>
  </div>
);

export default AuthLayout;