import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Get to Know Us",
      links: [
        { name: "About Us", href: "/about" },
        { name: "Careers", href: "/careers" },
        { name: "Press Releases", href: "/press" },
        { name: "Blog", href: "/blog" },
      ]
    },
    {
      title: "Make Money with Us",
      links: [
        { name: "Sell on ModernE", href: "/sell" },
        { name: "Become an Affiliate", href: "/affiliate" },
        { name: "Advertise Your Products", href: "/advertise" },
        { name: "Self-Publish with Us", href: "/publish" },
      ]
    },
    {
      title: "Payment Products",
      links: [
        { name: "Business Card", href: "/business-card" },
        { name: "Shop with Points", href: "/points" },
        { name: "Reload Your Balance", href: "/reload" },
        { name: "Currency Converter", href: "/currency" },
      ]
    },
    {
      title: "Let Us Help You",
      links: [
        { name: "Your Account", href: "/profile" },
        { name: "Your Orders", href: "/orders" },
        { name: "Shipping Rates & Policies", href: "/shipping" },
        { name: "Returns & Replacements", href: "/returns" },
        { name: "Help", href: "/help" },
      ]
    }
  ];

  const socialLinks = [
    { name: "Facebook", icon: "📘", href: "#" },
    { name: "Twitter", icon: "🐦", href: "#" },
    { name: "Instagram", icon: "📷", href: "#" },
    { name: "LinkedIn", icon: "💼", href: "#" },
  ];

  return (
    <footer className="bg-black text-white">
      {/* Back to Top Button */}
      <motion.div 
        className="bg-gray-900 py-4 cursor-pointer hover:bg-gray-800 transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <span className="text-sm font-medium">Back to top</span>
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-orange-400">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-orange-400 transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter Section */}
        <motion.div 
          className="mt-12 pt-8 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h3 className="text-xl font-semibold text-orange-400 mb-2">Stay Updated</h3>
              <p className="text-gray-300 text-sm">Get the latest deals and updates delivered to your inbox.</p>
            </div>
            <div className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-r-lg transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Social Links */}
        <motion.div 
          className="mt-8 pt-8 border-t border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 lg:mb-0">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="text-2xl hover:text-orange-400 transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Download our app:</span>
              <div className="flex space-x-2">
                <motion.button 
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  App Store
                </motion.button>
                <motion.button 
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Google Play
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 lg:mb-0">
              <Link to="/" className="text-2xl font-bold text-orange-400">
                ModernE
              </Link>
              <span className="text-gray-400 text-sm">© {currentYear} ModernE.com, Inc. or its affiliates</span>
            </div>
            <div className="flex flex-wrap items-center space-x-6 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-orange-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-orange-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="hover:text-orange-400 transition-colors duration-200">
                Cookie Preferences
              </Link>
              <Link to="/sitemap" className="hover:text-orange-400 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 