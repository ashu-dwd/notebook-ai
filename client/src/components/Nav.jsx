import { Brain, Menu, X } from "lucide-react";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Nav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <nav className="border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8" />
              <Link to="/">
                <span className="text-xl font-bold">NotebookAI</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/about"
              className="hover:bg-black hover:text-white px-3 py-2 transition-colors"
            >
              About
            </Link>
            <Link
              to="/login"
              className="hover:bg-black hover:text-white px-3 py-2 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
            >
              Register
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-black">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#about"
                className="block px-3 py-2 hover:bg-black hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#login"
                className="block px-3 py-2 hover:bg-black hover:text-white transition-colors"
              >
                Login
              </a>
              <a
                href="#register"
                className="block px-3 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Register
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Nav;
