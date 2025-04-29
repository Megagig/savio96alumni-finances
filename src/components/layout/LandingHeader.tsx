import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-md py-4' 
          : 'bg-primary-900/70 backdrop-blur-sm py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Logo size={isScrolled ? 'small' : 'medium'} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/about" 
              className={`font-medium text-base ${
                isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-300'
              } transition-colors duration-200 px-3 py-2 rounded-md`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium text-base ${
                isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-300'
              } transition-colors duration-200 px-3 py-2 rounded-md`}
            >
              Contact
            </Link>
            <a 
              href="https://savio96alumni.com.ng/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`font-medium text-base ${
                isScrolled ? 'text-gray-700 hover:text-primary-600' : 'text-white hover:text-primary-300'
              } transition-colors duration-200 px-3 py-2 rounded-md`}
            >
              Alumni Portal
            </a>
            <div className="ml-4 flex items-center space-x-4">
              <Link
                to="/login"
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isScrolled 
                    ? 'text-primary-600 bg-white border border-primary-600 hover:bg-primary-50' 
                    : 'text-primary-700 bg-white hover:bg-gray-100 shadow-md'
                } transition-colors duration-200`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 shadow-md"
              >
                Register
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                isScrolled ? 'text-gray-700 hover:text-primary-600 hover:bg-gray-100' : 'text-white hover:text-gray-200 hover:bg-primary-700'
              } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500`}
              aria-expanded="false"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Icon when menu is open */}
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 ${isScrolled ? 'bg-white' : 'bg-primary-800'} shadow-lg`}>
          <Link
            to="/about"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-primary-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-primary-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact
          </Link>
          <a
            href="https://savio96alumni.com.ng/"
            target="_blank"
            rel="noopener noreferrer"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-primary-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Alumni Portal
          </a>
          <Link
            to="/login"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-primary-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-primary-600'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Register
          </Link>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
