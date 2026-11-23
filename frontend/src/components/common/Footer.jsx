import { Link } from "react-router-dom";
import { FiInstagram, FiFacebook, FiTwitter, FiMail, FiMapPin, FiPhone, FiArrowRight } from "react-icons/fi";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-[#2A2422] text-[#F5EFE6] mt-16 md:mt-24">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
          
          {/* 1. Brand Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="bg-[#F5EFE6] inline-block px-3 py-2 rounded-xl mb-6">
              <Logo size="sm" />
            </div>
            <p className="text-sm text-[#F5EFE6]/60 leading-relaxed max-w-xs">
              Premium beauty essentials crafted with clean, effective ingredients. Radiant skin, every single day.
            </p>
            <div className="flex gap-3 mt-6">
              {[FiInstagram, FiFacebook, FiTwitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/70 hover:bg-white hover:text-[#2A2422] transition-all duration-300 hover:-translate-y-1"
                  aria-label="Social Media"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Shop Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-[#F5EFE6] mb-5 tracking-wide">Shop</h4>
            <ul className="space-y-3 text-sm text-[#F5EFE6]/60">
              {[
                { label: "All Products", link: "/products" },
                { label: "Best Sellers", link: "/products?sort=popular" },
                { label: "New Arrivals", link: "/products?sort=newest" },
                { label: "Skincare", link: "/products?category=skincare" },
                { label: "Makeup", link: "/products?category=makeup" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.link} className="hover:text-[#F5EFE6] transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-px bg-[#F5EFE6] transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Support Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-[#F5EFE6] mb-5 tracking-wide">Support</h4>
            <ul className="space-y-3 text-sm text-[#F5EFE6]/60">
              {[
                { label: "Track Order", link: "/orders" },
                { label: "My Account", link: "/profile" },
                { label: "Returns & Refunds", link: "#" },
                { label: "Shipping Policy", link: "#" },
                { label: "Contact Us", link: "#" },
              ].map((item, i) => (
                <li key={i}>
                  <Link to={item.link} className="hover:text-[#F5EFE6] transition-colors flex items-center gap-2 group">
                    <span className="w-0 h-px bg-[#F5EFE6] transition-all duration-300 group-hover:w-3" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Contact Info */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-[#F5EFE6] mb-5 tracking-wide">Get in touch</h4>
            <ul className="space-y-4 text-sm text-[#F5EFE6]/60">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <FiMail size={14} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#F5EFE6]/40 mb-0.5">Email</p>
                  <a href="mailto:hello@mehrwan.com" className="hover:text-[#F5EFE6] transition-colors">hello@mehrwan.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <FiPhone size={14} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#F5EFE6]/40 mb-0.5">Phone</p>
                  <a href="tel:+919876543210" className="hover:text-[#F5EFE6] transition-colors">+91 98765 43210</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <FiMapPin size={14} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#F5EFE6]/40 mb-0.5">Location</p>
                  <p>Mumbai, India</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#211C1A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F5EFE6]/40">
          <p>© {new Date().getFullYear()} Mehrwan Beauty. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#F5EFE6] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#F5EFE6] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#F5EFE6] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;