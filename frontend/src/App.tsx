import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/dashboard/Dashboard';
import VideoPlayer from './components/video/VideoPlayer';
import VideoUpload from './components/video/VideoUpload';
import AnnotationHistory from './components/annotations/AnnotationHistory';

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-imdb-gold"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Main Layout Component
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  
  return (
    <div className="min-h-screen bg-imdb-black">
      <Header />
      <main className={isHomePage ? 'pt-96' : 'pt-32'}>
        {children}
      </main>
    </div>
  );
};

// Public Layout Component
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 to-dark-950 flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1a1a1a',
                  color: '#fff',
                  border: '1px solid #e2b616',
                  borderRadius: '12px',
                  boxShadow: '0 4px 25px -5px rgba(0, 0, 0, 0.15)',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#e2b616',
                    secondary: '#1a1a1a',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#1a1a1a',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                <PublicLayout>
                  <div className="min-h-screen bg-imdb-black flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-6xl font-bold text-white mb-6">
                        Welcome to <span className="text-gradient">VidAnnotate</span>
                      </h1>
                      <p className="text-xl text-white/70 mb-8 max-w-2xl">
                        The ultimate AI-powered video annotation platform
                      </p>
                      <div className="flex items-center justify-center space-x-4">
                        <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                          Get Started
                        </Link>
                        <Link to="/login" className="btn-outline text-lg px-8 py-4">
                          Sign In
                        </Link>
                      </div>
                    </div>
                  </div>
                </PublicLayout>
              } />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <MainLayout>
                    <VideoUpload onCancel={() => {}} onUploadComplete={() => {}} />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/videos/:videoId" element={
                <ProtectedRoute>
                  <MainLayout>
                    <VideoPlayer />
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/videos" element={
                <ProtectedRoute>
                  <MainLayout>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold text-white mb-6">Videos</h1>
                      <p className="text-white/70">Video management page coming soon...</p>
                    </div>
                  </MainLayout>
                </ProtectedRoute>
              } />
              <Route path="/annotations" element={
                <ProtectedRoute>
                  <MainLayout>
                    <AnnotationHistory />
                  </MainLayout>
                </ProtectedRoute>
              } />
              
              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;