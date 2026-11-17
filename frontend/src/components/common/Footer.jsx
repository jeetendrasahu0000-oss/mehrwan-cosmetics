import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import Logo from "./Logo";
import Newsletter from "../home/Newsletter";

const Footer = () => {
  return (
    <footer className="bg-ink text-cream mt-24">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="bg-cream inline-block px-3 py-1.5 rounded-xl">
              <Logo size="sm" />
            </div>
            <p className="mt-5 text-sm text-cream/70 leading-relaxed">
              Premium beauty essentials crafted with clean, effective ingredients.
              Radiant skin, every single day.
            </p>
            <div className="flex gap-3 mt-6">
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full border border-cream/20 flex items-center justify-center text-cream/70 hover:bg-cream hover:text-ink transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold tracking-wide mb-4 text-cream">Shop</h4>
            <ul className="space-y-2.5 text-sm text-cream/70">
              <li><Link to="/products" className="hover:text-cream">All Products</Link></li>
              <li><Link to="/products?sort=popular" className="hover:text-cream">Best Sellers</Link></li>
              <li><Link to="/products?sort=newest" className="hover:text-cream">New Arrivals</Link></li>
              <li><Link to="/products" className="hover:text-cream">Skincare</Link></li>
              <li><Link to="/products" className="hover:text-cream">Makeup</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold tracking-wide mb-4 text-cream">Support</h4>
            <ul className="space-y-2.5 text-sm text-cream/70">
              <li><Link to="/orders" className="hover:text-cream">Track Order</Link></li>
              <li><Link to="/profile" className="hover:text-cream">My Account</Link></li>
              <li><a href="#" className="hover:text-cream">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-cream">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-cream">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold tracking-wide mb-4 text-cream">Get in touch</h4>
            <ul className="space-y-3 text-sm text-cream/70">
              <li className="flex items-start gap-2.5"><FiMail className="mt-0.5 shrink-0" /> hello@mehrwan.com</li>
              <li className="flex items-start gap-2.5"><FiPhone className="mt-0.5 shrink-0" /> +91 98765 43210</li>
              <li className="flex items-start gap-2.5"><FiMapPin className="mt-0.5 shrink-0" /> Mumbai, India</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} Mehrwan Cosmetics. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-cream">Privacy</a>
            <a href="#" className="hover:text-cream">Terms</a>
            <a href="#" className="hover:text-cream">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;