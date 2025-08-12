import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  VideoCameraIcon, 
  DocumentTextIcon, 
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, description: 'Overview & Analytics' },
    { name: 'Videos', href: '/videos', icon: VideoCameraIcon, description: 'Manage Your Videos' },
    { name: 'Annotations', href: '/annotations', icon: DocumentTextIcon, description: 'View & Edit Annotations' },
    { name: 'History', href: '/history', icon: ClockIcon, description: 'Activity Timeline' },
  ];

  const quickActions = [
    { name: 'Upload Video', icon: CloudArrowUpIcon, action: '/upload', color: 'from-imdb-gold to-imdb-gold-light' },
    { name: 'AI Analysis', icon: SparklesIcon, action: '/ai-analysis', color: 'from-imdb-gold-light to-imdb-gold' },
    { name: 'Analytics', icon: ChartBarIcon, action: '/analytics', color: 'from-imdb-gold to-imdb-gold-light' },
  ];

  return (
    <aside className="w-72 bg-imdb-black-light border-r border-imdb-black-lighter h-screen overflow-y-auto">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="mb-8 p-4 bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-2xl border border-imdb-black-lighter">
          <div className="text-center">
            <div className="w-16 h-16 bg-imdb-gold rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-glow">
              <VideoCameraIcon className="w-8 h-8 text-imdb-black" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Welcome Back!</h3>
            <p className="text-sm text-white/60">Ready to annotate?</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mb-8">
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
            Navigation
          </h3>
          
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item group ${isActive ? 'active' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-imdb-gold text-imdb-black shadow-lg shadow-glow' 
                        : 'bg-imdb-black-lighter text-white/60 group-hover:bg-imdb-gold group-hover:text-imdb-black'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-white/40">{item.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
            Quick Actions
          </h3>
          
          <div className="space-y-3">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.action}
                className="block p-3 bg-gradient-to-r from-imdb-black-lighter to-imdb-black-light rounded-xl border border-imdb-black-lighter hover:border-imdb-gold/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-glow transition-all duration-300`}>
                    <action.icon className="w-5 h-5 text-imdb-black" />
                  </div>
                  <span className="font-medium text-white group-hover:text-imdb-gold transition-colors duration-300">
                    {action.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-white/60 mb-4 uppercase tracking-wider">
            Quick Stats
          </h3>
          
          <div className="space-y-3">
            <div className="bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-xl p-4 border border-imdb-black-lighter hover:border-imdb-gold/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 font-medium">Total Videos</p>
                  <p className="text-2xl font-bold text-white">24</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-xl flex items-center justify-center shadow-lg">
                  <VideoCameraIcon className="w-6 h-6 text-imdb-black" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-imdb-black-lighter to-imdb-black-light rounded-xl p-4 border border-imdb-black-lighter hover:border-imdb-gold/50 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/60 font-medium">Annotations</p>
                  <p className="text-2xl font-bold text-white">156</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-imdb-gold to-imdb-gold-light rounded-xl flex items-center justify-center shadow-lg">
                  <DocumentTextIcon className="w-6 h-6 text-imdb-black" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="p-4 bg-gradient-to-r from-imdb-gold/10 to-imdb-gold-light/10 rounded-2xl border border-imdb-gold/20">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-imdb-gold rounded-xl flex items-center justify-center flex-shrink-0">
              <SparklesIcon className="w-4 h-4 text-imdb-black" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-imdb-gold mb-1">Pro Tip</h4>
              <p className="text-xs text-white/70">
                Use AI annotations to quickly analyze behavioral patterns in your videos
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

