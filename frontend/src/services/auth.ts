import { apiService } from './api';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/api';
import type { User, AuthResponse, LoginForm, RegisterForm, ApiResponse } from '../types';

class AuthService {
  // Login user
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      this.saveAuthData(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Login failed');
  }

  // Register new user
  async register(userData: RegisterForm): Promise<AuthResponse> {
    const { confirmPassword, ...registrationData } = userData;

    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      registrationData
    );

    if (response.success && response.data) {
      this.saveAuthData(response.data);
      return response.data;
    }

    throw new Error(response.message || 'Registration failed');
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<{ user: User }>(API_ENDPOINTS.AUTH.ME);

    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      return response.data.user;
    }

    throw new Error(response.message || 'Failed to get user profile');
  }

  // Update user profile
  async updateProfile(userData: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const response = await apiService.put<{ user: User }>(
      API_ENDPOINTS.AUTH.PROFILE,
      userData
    );

    if (response.success && response.data) {
      // Update stored user data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.user));
      return response.data.user;
    }

    throw new Error(response.message || 'Failed to update profile');
  }

  // Logout user
  logout(): void {
    apiService.clearAuthToken();
    // Clear all stored data
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }

  // Get stored user data
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Get stored auth token
  getStoredToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // Save authentication data
  private saveAuthData(authData: AuthResponse): void {
    apiService.setAuthToken(authData.token);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(authData.user));
  }

  // Validate token on app startup
  async validateToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await this.getCurrentUser();
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  // Check if user has admin role
  isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'admin';
  }

  // Check if user owns a resource
  canAccess(resourceUserId: string): boolean {
    const user = this.getStoredUser();
    return user?.id === resourceUserId || this.isAdmin();
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;