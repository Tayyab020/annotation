import React from 'react';
import { Link } from 'react-router-dom';
import { 
  VideoCameraIcon, 
  HeartIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-imdb-black-lighter border-t border-imdb-black-lighter/50 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-imdb-gold rounded-xl flex items-center justify-center shadow-lg">
                <VideoCameraIcon className="w-6 h-6 text-imdb-black" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">VidAnnotate</h3>
                <p className="text-sm text-white/60">AI-Powered Video Annotation</p>
              </div>
            </div>
            <p className="text-white/70 mb-6 max-w-md">
              Transform your videos with intelligent AI-powered annotations. 
              Discover insights and patterns you never knew existed in your video content.
            </p>
          
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-white/70 hover:text-imdb-gold transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <DocumentTextIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/annotations" 
                  className="text-white/70 hover:text-imdb-gold transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <SparklesIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Video Library</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/upload" 
                  className="text-white/70 hover:text-imdb-gold transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <VideoCameraIcon className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Upload Video</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Features</h4>
            <ul className="space-y-3">
              <li className="text-white/70 flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4 text-imdb-gold" />
                <span>AI Annotations</span>
              </li>
              <li className="text-white/70 flex items-center space-x-2">
                <VideoCameraIcon className="w-4 h-4 text-imdb-gold" />
                <span>Video Analysis</span>
              </li>
              <li className="text-white/70 flex items-center space-x-2">
                <DocumentTextIcon className="w-4 h-4 text-imdb-gold" />
                <span>Behavior Tracking</span>
              </li>
             
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-imdb-black-lighter/30 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-white/60 text-sm mb-4 md:mb-0">
              © {currentYear} VidAnnotate. All rights reserved.
            </div>
      
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
