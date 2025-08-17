import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  VideoCameraIcon, 
  UserCircleIcon, 
  MagnifyingGlassIcon,
  BellIcon,
  Cog6ToothIcon,
  HomeIcon,
  DocumentTextIcon,
  ClockIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const navigationItems = [
    { name: 'Home', href: '/dashboard', icon: HomeIcon },
    { name: 'Annotations', href: '/annotations', icon: DocumentTextIcon },
  ];



  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-hero border-b border-imdb-black-lighter">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2b616%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>

      <div className="relative z-10">
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-imdb-black-lighter/30">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-imdb-gold rounded-2xl flex items-center justify-center shadow-lg shadow-glow ">
                  <VideoCameraIcon className="w-7 h-7 text-imdb-black" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-imdb-gold-light rounded-full animate-pulse"></div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gradient">
                  VidAnnotate
                </h1>
                <p className="text-sm text-white/60 font-medium hidden sm:block">
                  AI-Powered Video Annotation
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-imdb-gold text-imdb-black font-semibold shadow-lg shadow-glow"
                        : "text-white/70 hover:text-white hover:bg-imdb-black-lighter/50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden p-3 rounded-xl transition-all duration-300 border-2 shadow-lg transform hover:scale-105 ${
                isMobileMenuOpen
                  ? "bg-imdb-gold-light text-imdb-black border-imdb-gold shadow-glow"
                  : "bg-imdb-gold text-imdb-black border-white/20 hover:bg-imdb-gold-light hover:border-imdb-gold/50"
              }`}
              title="Open Menu"
            >
              <div
                className={`transition-transform duration-300 ${
                  isMobileMenuOpen ? "rotate-90" : "rotate-0"
                }`}
              >
                <Bars3Icon className="w-6 h-6" />
              </div>
            </button>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 hidden lg:block">
              {/* User Menu */}
              <div className="relative group ">
                <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-imdb-black-lighter/50 transition-all duration-200">
                  <div className="w-10 h-10 bg-imdb-gold rounded-xl flex items-center justify-center shadow-lg">
                    <UserCircleIcon className="w-6 h-6 text-imdb-black" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-white/60">{user?.email}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-56 bg-imdb-black-light rounded-2xl shadow-2xl border border-imdb-black-lighter opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform scale-95 group-hover:scale-100">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-imdb-black-lighter">
                      <p className="text-sm font-semibold text-white">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs text-white/60">{user?.email}</p>
                    </div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors duration-200"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-black/80 z-[9999] lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}>
          <div className={`absolute right-0 top-0 h-full w-80 bg-gradient-to-b from-imdb-black-light to-imdb-black border-l border-imdb-gold/20 shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-imdb-gold/20 bg-gradient-to-r from-imdb-gold/10 to-transparent">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-imdb-gold rounded-lg flex items-center justify-center">
                    <VideoCameraIcon className="w-5 h-5 text-imdb-black" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Menu</h3>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-white/70 hover:text-white hover:bg-imdb-gold/20 rounded-lg transition-all duration-200 hover:scale-110"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
                {/* Navigation Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-imdb-gold uppercase tracking-wider font-semibold">
                    Navigation
                  </h4>
                  {navigationItems.map((item, index) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 transform hover:scale-105 menu-item ${
                          isActive
                            ? "bg-gradient-to-r from-imdb-gold to-imdb-gold-light text-imdb-black font-semibold shadow-lg shadow-glow"
                            : "text-white/80 hover:text-white hover:bg-imdb-gold/10 border border-transparent hover:border-imdb-gold/30"
                        }`}
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(20px)',
                          opacity: isMobileMenuOpen ? 1 : 0,
                          transition: `all 0.3s ease ${index * 100}ms`
                        }}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isActive ? "bg-imdb-black/20" : "bg-imdb-gold/10"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* User Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-imdb-gold uppercase tracking-wider font-semibold">
                    User Profile
                  </h4>
                  <div className="p-4 bg-gradient-to-r from-imdb-black-lighter to-imdb-black-lighter/50 rounded-xl border border-imdb-gold/20">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-imdb-gold rounded-xl flex items-center justify-center">
                        <UserCircleIcon className="w-6 h-6 text-imdb-black" />
                      </div>
                      <div>
                        <p className="text-white font-semibold">
                          {user?.name || "User"}
                        </p>
                        <p className="text-sm text-white/60">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-imdb-gold uppercase tracking-wider font-semibold">
                    Actions
                  </h4>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-4 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/30"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-imdb-gold/20">
                  <p className="text-center text-xs text-white/40">
                    VidAnnotate v1.0
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
  
    </header>
  );
};

export default Header;
