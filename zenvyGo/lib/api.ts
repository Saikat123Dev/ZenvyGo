import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/constants/config';
import { createLogger } from '@/lib/logger';

const log = createLogger('api');

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: unknown;
  meta?: {
    timestamp: string;
    [key: string]: unknown;
  };
}

export interface AuthUser {
  id: string;
  email: string | null;
  emailVerified: boolean;
  name: string | null;
  language: string;
  country: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plateNumber: string;
  plateRegion: string | null;
  make: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface TagSummary {
  id: string;
  vehicleId: string;
  token: string;
  type: 'qr' | 'etag';
  state: 'generated' | 'activated' | 'suspended' | 'retired';
  qrCodeUrl: string;
  activatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AlertItem {
  id: string;
  userId: string;
  sessionId: string | null;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  channel: 'system' | 'in_app';
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSession {
  id: string;
  vehicleId: string;
  ownerId: string;
  tagId: string;
  reasonCode: string;
  requestedChannel: 'call' | 'sms' | 'whatsapp' | 'in_app';
  deliveryStatus: 'logged' | 'queued' | 'failed';
  status: 'initiated' | 'resolved' | 'expired';
  requesterContext: Record<string, unknown> | null;
  message: string | null;
  expiresAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string | null;
}

export interface EmergencyProfile {
  id: string;
  vehicleId: string;
  contacts: EmergencyContact[];
  medicalNotes: string | null;
  roadsideAssistanceNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DriverDocument {
  id: string;
  userId: string;
  vehicleId: string | null;
  documentType: 'driving_license' | 'rc' | 'puc' | 'insurance' | 'other';
  documentName: string;
  documentNumber: string | null;
  fileUrl: string;
  fileType: string;
  originalFilename: string;
  fileSizeBytes: number;
  issuedAt: string | null;
  expiresAt: string | null;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  isVisibleToPassenger: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicDocumentView {
  type: string;
  name: string;
  fileUrl: string;
  expiresAt: string | null;
}

export interface PublicDriverProfile {
  name: string | null;
  profilePhotoUrl: string | null;
  documents: PublicDocumentView[];
}

export interface ResolvedTag {
  tagId: string;
  vehicleId: string;
  ownerId: string;
  plateNumber: string;
  state: 'generated' | 'activated' | 'suspended' | 'retired';
  allowedReasonCodes: string[];
  allowedChannels: string[];
  driverProfile?: PublicDriverProfile;
}

interface VehiclePayload {
  plateNumber: string;
  plateRegion?: string | null;
  make?: string | null;
  model?: string | null;
  color?: string | null;
  year?: number | null;
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

  hasActiveSession() {
    return Boolean(this.accessToken && this.refreshToken);
  }

  private async getStoredTokens() {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (accessToken && refreshToken) {
        return { accessToken, refreshToken };
      }
    } catch (error) {
      log.error('Failed to get stored tokens', { error });
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
      log.error('Failed to store tokens', { error });
    }
  }

  async clearTokens() {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      this.accessToken = null;
      this.refreshToken = null;
    } catch (error) {
      log.error('Failed to clear tokens', { error });
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const incomingHeaders = (options.headers as Record<string, string>) || {};
    const headers: Record<string, string> = {
      ...incomingHeaders,
    };

    if (!isFormDataBody && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });
      const data = await this.parseResponse<T>(response);

      if (!response.ok) {
        if (response.status === 401 && this.refreshToken && endpoint !== '/auth/refresh') {
          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
            const retryResponse = await fetch(`${API_URL}${endpoint}`, {
              ...options,
              headers,
            });
            return this.parseResponse<T>(retryResponse);
          }
        }

        return {
          success: false,
          error: data.error || data.message || 'Request failed',
          errors: data.errors,
          message: data.message,
        };
      }

      return data;
    } catch (error: any) {
      log.error('API request failed', { error, endpoint });
      return {
        success: false,
        error: error.message || 'Network error',
      };
    }
  }

  private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const text = await response.text();

    if (!text) {
      return {
        success: response.ok,
      };
    }

    try {
      const parsed = JSON.parse(text) as ApiResponse<T>;
      if (!response.ok && !parsed.error && parsed.message) {
        return { ...parsed, error: parsed.message };
      }
      return parsed;
    } catch {
      return {
        success: response.ok,
        error: response.ok ? undefined : 'Failed to parse server response',
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

      const data = await this.parseResponse<AuthTokens>(response);

      if (response.ok && data.success && data.data) {
        await this.storeTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      }

      // If refresh fails, clear tokens
      await this.clearTokens();
      return false;
    } catch (error) {
      log.error('Token refresh failed', { error });
      await this.clearTokens();
      return false;
    }
  }

  async logout() {
    await this.clearTokens();
  }

  async getCurrentUser(): Promise<ApiResponse<AuthUser>> {
    return this.get<AuthUser>('/users/me');
  }

  async updateProfile(input: {
    name?: string | null;
    language?: 'en' | 'ar';
  }): Promise<ApiResponse<AuthUser>> {
    return this.patch<AuthUser>('/users/me', input);
  }

  async listVehicles(): Promise<ApiResponse<Vehicle[]>> {
    return this.get<Vehicle[]>('/vehicles');
  }

  async createVehicle(input: VehiclePayload): Promise<ApiResponse<Vehicle>> {
    return this.post<Vehicle>('/vehicles', input);
  }

  async updateVehicle(vehicleId: string, input: Partial<VehiclePayload>): Promise<ApiResponse<Vehicle>> {
    return this.patch<Vehicle>(`/vehicles/${vehicleId}`, input);
  }

  async archiveVehicle(vehicleId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/vehicles/${vehicleId}`);
  }

  async listTags(): Promise<ApiResponse<TagSummary[]>> {
    return this.get<TagSummary[]>('/tags');
  }

  async createTag(input: { vehicleId: string; type?: 'qr' | 'etag' }): Promise<ApiResponse<TagSummary>> {
    return this.post<TagSummary>('/tags', {
      vehicleId: input.vehicleId,
      type: input.type ?? 'qr',
    });
  }

  async activateTag(tagId: string): Promise<ApiResponse<TagSummary>> {
    return this.post<TagSummary>(`/tags/${tagId}/activate`, {});
  }

  async resolveTag(token: string): Promise<ApiResponse<ResolvedTag>> {
    return this.post<ResolvedTag>('/public/tags/resolve', { token });
  }

  async listAlerts(): Promise<ApiResponse<AlertItem[]>> {
    return this.get<AlertItem[]>('/alerts');
  }

  async markAlertRead(alertId: string): Promise<ApiResponse<AlertItem>> {
    return this.patch<AlertItem>(`/alerts/${alertId}/read`, {});
  }

  async markAllAlertsRead(): Promise<ApiResponse<null>> {
    return this.patch<null>('/alerts/read-all', {});
  }

  async listContactSessions(): Promise<ApiResponse<ContactSession[]>> {
    return this.get<ContactSession[]>('/contact-sessions');
  }

  async resolveContactSession(sessionId: string): Promise<ApiResponse<ContactSession>> {
    return this.patch<ContactSession>(`/contact-sessions/${sessionId}/resolve`, {});
  }

  async getEmergencyProfile(vehicleId: string): Promise<ApiResponse<EmergencyProfile | null>> {
    return this.get<EmergencyProfile | null>(`/vehicles/${vehicleId}/emergency-profile`);
  }

  async upsertEmergencyProfile(
    vehicleId: string,
    input: {
      contacts: EmergencyContact[];
      medicalNotes?: string | null;
      roadsideAssistanceNumber?: string | null;
    },
  ): Promise<ApiResponse<EmergencyProfile>> {
    return this.put<EmergencyProfile>(`/vehicles/${vehicleId}/emergency-profile`, input);
  }

  async createPublicContactSession(input: {
    token: string;
    reasonCode: string;
    requestedChannel: string;
    requesterName?: string | null;
    message?: string | null;
  }): Promise<ApiResponse<ContactSession>> {
    return this.post<ContactSession>('/public/contact-sessions', input);
  }

  // Document Management
  async listDocuments(): Promise<ApiResponse<DriverDocument[]>> {
    return this.get<DriverDocument[]>('/documents');
  }

  async uploadDocument(
    documentData: {
      vehicleId?: string;
      documentType: string;
      documentName: string;
      documentNumber?: string;
      issuedAt?: string;
      expiresAt?: string;
      isVisibleToPassenger?: boolean;
    },
    fileUri: string,
    fileName: string,
    mimeType: string,
  ): Promise<ApiResponse<DriverDocument>> {
    const formData = new FormData();

    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    Object.entries(documentData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });

    return this.request<DriverDocument>('/documents', {
      method: 'POST',
      body: formData,
    });
  }

  async updateDocument(
    documentId: string,
    updates: {
      documentName?: string;
      documentNumber?: string;
      expiresAt?: string;
    },
  ): Promise<ApiResponse<DriverDocument>> {
    return this.patch<DriverDocument>(`/documents/${documentId}`, updates);
  }

  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/documents/${documentId}`);
  }

  async toggleDocumentVisibility(
    documentId: string,
    isVisible: boolean,
  ): Promise<ApiResponse<DriverDocument>> {
    return this.patch<DriverDocument>(`/documents/${documentId}/visibility`, {
      isVisibleToPassenger: isVisible,
    });
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

  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  // Generic DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
