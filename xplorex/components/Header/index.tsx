"use client";
import { useEffect, useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-black backdrop-blur-md border-b border-white/10 shadow-lg shadow-cyan-500/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-2xl font-extrabold tracking-tight cursor-pointer hover:scale-105 transition-transform duration-300">
            XploreX
          </span>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#" className="text-white/80 hover:text-white transition-colors duration-300">
                Home
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors duration-300">
                About
              </a>
              <a href="#" className="text-white/80 hover:text-white transition-colors duration-300">
                Contact
              </a>
            </div>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-md text-gray-400 hover:text-white transition-all duration-300">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-neutral-900/95 backdrop-blur-md border-t border-white/10 p-4">
          <a href="#" className="block text-white/80 py-2">Home</a>
          <a href="#" className="block text-white/80 py-2">About</a>
          <a href="#" className="block text-white/80 py-2">Contact</a>
        </div>
      )}
    </nav>
  );
};

export default Header;
