import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import type { LoadingState } from '../../types';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    
    return {
      score,
      checks,
      level: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength.score < 3) {
      newErrors.password = 'Password is too weak. Please include uppercase, lowercase, and numbers.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading({ isLoading: true, message: 'Creating your account...' });

    try {
      await register(formData.name.trim(), formData.email, formData.password);
      // Redirect will be handled by the auth context
    } catch (error) {
      // Error is already handled by the auth context with toast
      console.error('Registration error:', error);
    } finally {
      setLoading({ isLoading: false });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Clear confirm password error if passwords now match
    if (name === 'password' && formData.confirmPassword && errors.confirmPassword) {
      if (value === formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
    if (name === 'confirmPassword' && errors.confirmPassword) {
      if (value === formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const PasswordCheck: React.FC<{ met: boolean; children: React.ReactNode }> = ({ met, children }) => (
    <div className={`flex items-center text-sm ${met ? 'text-success' : 'text-white/50'}`}>
      {met ? (
        <CheckIcon className="h-4 w-4 mr-2" />
      ) : (
        <XMarkIcon className="h-4 w-4 mr-2" />
      )}
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-imdb-black via-imdb-black-light to-imdb-black-lighter py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-imdb-gold shadow-glow">
            <span className="text-3xl font-bold text-imdb-black">V</span>
          </div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-lg text-imdb-gold">
            Join VidAnnotate
          </p>
          <p className="mt-1 text-center text-sm text-white/70">
            Start annotating videos with AI
          </p>
        </div>

        <div className="bg-imdb-black-light rounded-2xl border border-imdb-black-lighter p-8 shadow-soft">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`input-field ${errors.name ? 'input-field-error' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading.isLoading}
                />
                {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading.isLoading}
                />
                {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`input-field pr-10 ${errors.password ? 'input-field-error' : ''}`}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading.isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading.isLoading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-3 p-3 bg-imdb-black-lighter rounded-lg border border-imdb-black-lighter">
                    <div className="flex space-x-1 mb-2">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded ${
                            level <= passwordStrength.score
                              ? passwordStrength.level === 'weak'
                                ? 'bg-error'
                                : passwordStrength.level === 'medium'
                                ? 'bg-warning'
                                : 'bg-success'
                              : 'bg-imdb-black-lighter'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      <PasswordCheck met={passwordStrength.checks.length}>
                        At least 6 characters
                      </PasswordCheck>
                      <PasswordCheck met={passwordStrength.checks.uppercase}>
                        One uppercase letter
                      </PasswordCheck>
                      <PasswordCheck met={passwordStrength.checks.lowercase}>
                        One lowercase letter
                      </PasswordCheck>
                      <PasswordCheck met={passwordStrength.checks.number}>
                        One number
                      </PasswordCheck>
                    </div>
                  </div>
                )}
                
                {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className={`input-field pr-10 ${errors.confirmPassword ? 'input-field-error' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading.isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/60 hover:text-white transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading.isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading.isLoading || passwordStrength.score < 3}
                className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading.isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-imdb-black mr-2"></div>
                    {loading.message}
                  </div>
                ) : (
                  'Create account'
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-white/70">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-imdb-gold hover:text-imdb-gold-light transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </form>

          {/* Terms */}
          <div className="mt-6 text-center">
            <p className="text-xs text-white/60">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-imdb-gold hover:text-imdb-gold-light transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-imdb-gold hover:text-imdb-gold-light transition-colors">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;