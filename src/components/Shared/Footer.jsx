import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-display font-bold text-primary-400">SmartAgro</span>
              <span className="ml-1 text-xl font-display font-bold text-white">Connect</span>
            </Link>
            <p className="mt-2 text-sm text-gray-300">
              Connecting farmers and buyers across Bangladesh with our efficient crop trading platform. 
              We make bulk agricultural trade simpler and more accessible.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-400">
                <FaLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-primary-400">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-primary-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-300 hover:text-primary-400">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-primary-400">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400">
                  Delivery Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-primary-400">
                  Crop Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Contact
            </h3>
            <ul className="mt-4 space-y-2">
              <li className="text-gray-300">
                123 Agro Street, Dhaka
              </li>
              <li className="text-gray-300">
                Bangladesh
              </li>
              <li>
                <a href="mailto:info@smartagroconnect.com" className="text-gray-300 hover:text-primary-400">
                  info@smartagroconnect.com
                </a>
              </li>
              <li>
                <a href="tel:+8801700000000" className="text-gray-300 hover:text-primary-400">
                  +880 1700 000000
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SmartAgro Connect. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="/privacy" className="text-sm text-gray-400 hover:text-primary-400">
              Privacy Policy
            </a>
            <a href="/terms" className="text-sm text-gray-400 hover:text-primary-400">
              Terms of Service
            </a>
            <a href="/cookie" className="text-sm text-gray-400 hover:text-primary-400">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
} 
