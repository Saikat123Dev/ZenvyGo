import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/config';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string | null;
    emailVerified: boolean;
    name: string | null;
    language: string;
    country: string;
    status: string;
  };
}

class ApiService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  async initialize() {
    const tokens = await this.getStoredTokens();
    if (tokens) {
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
    }
  }

  private async getStoredTokens() {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
    } catch (error) {
      console.error('Failed to get stored tokens:', error);
    }
    return null;
  }

  private async storeTokens(accessToken: string, refreshToken: string) {
    try {
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    } catch (error) {
      console.error('Failed to store tokens:', error);
    }
  }

  async clearTokens() {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && this.refreshToken) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            // Retry the original request with new token
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
            });
            return await retryResponse.json();
          }
        }

        return {
          success: false,
          error: data.message || 'Request failed',
        };
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  // Auth endpoints - Email/Password authentication
  async signup(
    name: string,
    email: string,
    password: string,
    country: string = 'US',
    language: string = 'en'
  ): Promise<ApiResponse<{ expiresIn: number; debugOtp?: string }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, country, language }),
    });
  }

  async verifyEmail(email: string, otp: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    if (response.success && response.data) {
      await this.storeTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
      await this.storeTokens(response.data.accessToken, response.data.refreshToken);
    }

    return response;
  }

  async forgotPasswordRequest(email: string): Promise<ApiResponse<{ expiresIn: number; debugOtp?: string }>> {
    return this.request('/auth/forgot-password/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPasswordReset(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/forgot-password/reset', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  }

  async resendOtp(email: string, type: 'signup' | 'password-reset' = 'signup'): Promise<ApiResponse<{ expiresIn: number; debugOtp?: string }>> {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        await this.storeTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }

      // If refresh fails, clear tokens
      await this.clearTokens();
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.clearTokens();
      return false;
    }
  }

  async logout() {
    await this.clearTokens();
  }

  // Generic GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // Generic POST request
  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Generic PUT request
  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
export type { AuthTokens, ApiResponse };
