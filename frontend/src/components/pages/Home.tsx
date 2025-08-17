import React from 'react';
import { Link } from 'react-router-dom';
import { 
  VideoCameraIcon, 
  SparklesIcon, 
  ChartBarIcon, 
  ClockIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  PlayIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-imdb-black">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden pt-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23e2b616%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-imdb-gold rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-glow">
              <VideoCameraIcon className="w-12 h-12 text-imdb-black" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-shadow-lg">
              Transform Your Videos with
              <span className="text-gradient block mt-2">AI-Powered Annotations</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
              Upload, analyze, and annotate videos with advanced AI technology. 
              Discover insights and patterns you never knew existed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 group flex items-center">
                <VideoCameraIcon className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform duration-200" />
                Start Annotating
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-imdb-gold mb-2">99%</div>
              <div className="text-white/70">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-imdb-gold mb-2">10x</div>
              <div className="text-white/70">Faster Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-imdb-gold mb-2">24/7</div>
              <div className="text-white/70">AI Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-imdb-black to-imdb-black-lighter">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Powerful Features for Video Analysis
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to analyze and annotate videos with precision and speed
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-imdb-black-light p-8 rounded-2xl border border-imdb-gold/20 hover:border-imdb-gold/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-imdb-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <SparklesIcon className="w-8 h-8 text-imdb-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Analysis</h3>
              <p className="text-white/70 leading-relaxed">
                Advanced machine learning algorithms automatically detect patterns, behaviors, and key moments in your videos.
              </p>
            </div>
            
            <div className="bg-imdb-black-light p-8 rounded-2xl border border-imdb-gold/20 hover:border-imdb-gold/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-imdb-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <ChartBarIcon className="w-8 h-8 text-imdb-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Detailed Insights</h3>
              <p className="text-white/70 leading-relaxed">
                Get comprehensive analytics and visualizations to understand your video content better than ever before.
              </p>
            </div>
            
            <div className="bg-imdb-black-light p-8 rounded-2xl border border-imdb-gold/20 hover:border-imdb-gold/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-imdb-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <ClockIcon className="w-8 h-8 text-imdb-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Processing</h3>
              <p className="text-white/70 leading-relaxed">
                Process videos in real-time with our optimized infrastructure and get results instantly.
              </p>
            </div>
            
            <div className="bg-imdb-black-light p-8 rounded-2xl border border-imdb-gold/20 hover:border-imdb-gold/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-imdb-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-imdb-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Secure & Private</h3>
              <p className="text-white/70 leading-relaxed">
                Your videos and data are protected with enterprise-grade security and privacy controls.
              </p>
            </div>
            
            <div className="bg-imdb-black-light p-8 rounded-2xl border border-imdb-gold/20 hover:border-imdb-gold/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-imdb-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <CloudArrowUpIcon className="w-8 h-8 text-imdb-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Easy Upload</h3>
              <p className="text-white/70 leading-relaxed">
                Simple drag-and-drop interface for uploading videos of any size with progress tracking.
              </p>
            </div>
            
            <div className="bg-imdb-black-light p-8 rounded-2xl border border-imdb-gold/20 hover:border-imdb-gold/40 transition-all duration-300 hover:scale-105">
              <div className="w-16 h-16 bg-imdb-gold/20 rounded-2xl flex items-center justify-center mb-6">
                <PlayIcon className="w-8 h-8 text-imdb-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Interactive Player</h3>
              <p className="text-white/70 leading-relaxed">
                Advanced video player with timeline annotations and precise time-based marking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Get started with video annotation in just three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-imdb-gold rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-imdb-black">
                1
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Upload Your Video</h3>
              <p className="text-white/70 leading-relaxed">
                Simply drag and drop your video file or click to browse. We support all major video formats.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-imdb-gold rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-imdb-black">
                2
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">AI Analysis</h3>
              <p className="text-white/70 leading-relaxed">
                Our AI processes your video and generates intelligent annotations based on your requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-imdb-gold rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-imdb-black">
                3
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Review & Export</h3>
              <p className="text-white/70 leading-relaxed">
                Review, edit, and export your annotations in various formats for further analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-imdb-gold/10 to-imdb-gold-light/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Join thousands of researchers, analysts, and content creators who are already using VidAnnotate to unlock insights in their videos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/dashboard" className="btn-primary text-lg px-8 py-4 group flex align-center">
              <VideoCameraIcon className="w-6 h-6 mr-2 group-hover:scale-110 transition-transform duration-200" />
              Start Free Trial
              <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-4">
              Sign In to Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
