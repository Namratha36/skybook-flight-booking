import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <Plane className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-900 dark:text-white">SkyBook</span>
            </Link>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-sm">
              Your premium choice for booking flights across the world. Experience luxury and comfort at the best prices.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Company</h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium space-y-4">
                <li><Link to="/about" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">About</Link></li>
                <li><Link to="/careers" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Careers</Link></li>
                <li><Link to="#" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Brand Center</Link></li>
                <li><Link to="#" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Help center</h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium space-y-4">
                <li><Link to="#" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Discord Server</Link></li>
                <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Twitter</a></li>
                <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Facebook</a></li>
                <li><Link to="/contact" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase dark:text-white">Legal</h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium space-y-4">
                <li><Link to="/privacy" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:underline hover:text-blue-600 dark:hover:text-blue-500">Terms &amp; Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-800 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © {new Date().getFullYear()} <Link to="/" className="hover:underline text-blue-600 dark:text-blue-500">SkyBook™</Link>. All Rights Reserved.
          </span>
          <div className="flex mt-4 space-x-5 sm:justify-center sm:mt-0 text-gray-500 dark:text-gray-400">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors"><FaFacebook size={20} /></a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors"><FaTwitter size={20} /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors"><FaInstagram size={20} /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors"><FaLinkedin size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
