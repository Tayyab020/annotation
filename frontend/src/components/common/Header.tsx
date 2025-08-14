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
  ClockIcon
} from '@heroicons/react/24/outline';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log('Searching for:', searchQuery);
    }
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Annotations', href: '/annotations', icon: DocumentTextIcon },
  ];

  // Only show hero section on home page
  const isHomePage = location.pathname === '/';

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
                <p className="text-sm text-white/60 font-medium">
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
                        ? 'bg-imdb-gold text-imdb-black font-semibold shadow-lg shadow-glow' 
                        : 'text-white/70 hover:text-white hover:bg-imdb-black-lighter/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar */}
            {/* <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search videos, annotations, or behaviors..."
                    className="block w-full pl-12 pr-4 py-3 border-2 border-imdb-black-lighter/50 rounded-2xl bg-imdb-black-light/50 text-white placeholder-white/40 focus:outline-none focus:ring-4 focus:ring-imdb-gold/30 focus:border-imdb-gold transition-all duration-300 backdrop-blur-sm"
                  />
                </div>
              </form>
            </div> */}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="relative p-3 text-white/70 hover:text-white hover:bg-imdb-black-lighter/50 rounded-xl transition-all duration-200 group">
                <BellIcon className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-3 h-3 bg-imdb-gold rounded-full animate-pulse"></span>
              </button>

              {/* Settings */}
              <button className="p-3 text-white/70 hover:text-white hover:bg-imdb-black-lighter/50 rounded-xl transition-all duration-200 group">
                <Cog6ToothIcon className="w-6 h-6" />
              </button>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-xl hover:bg-imdb-black-lighter/50 transition-all duration-200">
                  <div className="w-10 h-10 bg-imdb-gold rounded-xl flex items-center justify-center shadow-lg">
                    <UserCircleIcon className="w-6 h-6 text-imdb-black" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                    <p className="text-xs text-white/60">{user?.email}</p>
                  </div>
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-3 w-56 bg-imdb-black-light rounded-2xl shadow-2xl border border-imdb-black-lighter opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform scale-95 group-hover:scale-100">
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-imdb-black-lighter">
                      <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-white/60">{user?.email}</p>
                    </div>
                    
                    <div className="py-2">
                      <button className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-imdb-black-lighter rounded-lg transition-colors duration-200">
                        Profile Settings
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-imdb-black-lighter rounded-lg transition-colors duration-200">
                        Account Preferences
                      </button>
                    </div>
                    
                    <hr className="my-2 border-imdb-black-lighter" />
                    
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

        {/* Hero Section - Only on Home Page */}
        {isHomePage && (
          <div className="px-6 py-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-shadow-lg">
                Transform Your Videos with
                <span className="text-gradient block mt-2">AI-Powered Annotations</span>
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Upload, analyze, and annotate videos with advanced AI technology. 
                Discover insights and patterns you never knew existed.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                  <VideoCameraIcon className="w-6 h-6 mr-2" />
                  Start Annotating
                </Link>
                <button className="btn-outline text-lg px-8 py-4">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
