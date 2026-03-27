import {
  apiService,
  type AlertItem,
  type ContactSession,
  type TagSummary,
  type Vehicle,
} from '@/lib/api';
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

interface AppState {
  // Data
  vehicles: Vehicle[];
  tags: TagSummary[];
  alerts: AlertItem[];
  sessions: ContactSession[];

  // Loading states
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Cache timestamps
  lastFetchedAt: number | null;
  cacheValidityMs: number;

  // Actions
  fetchAll: (mode?: 'initial' | 'refresh' | 'silent') => Promise<void>;
  fetchVehiclesAndTags: (mode?: 'initial' | 'refresh' | 'silent') => Promise<void>;
  fetchAlerts: () => Promise<void>;
  fetchSessions: () => Promise<void>;

  // Mutations
  addVehicle: (vehicle: Vehicle) => void;
  updateVehicle: (vehicle: Vehicle) => void;
  removeVehicle: (vehicleId: string) => void;
  addTag: (tag: TagSummary) => void;
  updateTag: (tag: TagSummary) => void;
  markAlertRead: (alertId: string) => void;
  markAllAlertsRead: () => void;
  addSession: (session: ContactSession) => void;
  updateSession: (session: ContactSession) => void;

  // Cache control
  invalidateCache: () => void;
  clearData: () => void;
  isCacheValid: () => boolean;
}

const CACHE_VALIDITY_MS = 30000; // 30 seconds

const sortByCreatedAt = <T extends { createdAt: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  vehicles: [],
  tags: [],
  alerts: [],
  sessions: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetchedAt: null,
  cacheValidityMs: CACHE_VALIDITY_MS,

  isCacheValid: () => {
    const { lastFetchedAt, cacheValidityMs } = get();
    if (!lastFetchedAt) return false;
    return Date.now() - lastFetchedAt < cacheValidityMs;
  },

  invalidateCache: () => set({ lastFetchedAt: null }),

  clearData: () =>
    set({
      vehicles: [],
      tags: [],
      alerts: [],
      sessions: [],
      error: null,
      isLoading: false,
      isRefreshing: false,
      lastFetchedAt: null,
    }),

  fetchAll: async (mode = 'initial') => {
    const state = get();

    // Skip if cache is valid and not forcing refresh
    if (mode === 'silent' && state.isCacheValid()) {
      return;
    }

    if (mode === 'initial') {
      set({ isLoading: true, error: null });
    } else if (mode === 'refresh') {
      set({ isRefreshing: true, error: null });
    }

    try {
      const [vehiclesResponse, tagsResponse, alertsResponse, sessionsResponse] =
        await Promise.all([
          apiService.listVehicles(),
          apiService.listTags(),
          apiService.listAlerts(),
          apiService.listContactSessions(),
        ]);

      const failure = [vehiclesResponse, tagsResponse, alertsResponse, sessionsResponse].find(
        (r) => !r.success,
      );

      if (failure) {
        throw new Error(failure.error || 'Failed to load data');
      }

      set({
        vehicles: sortByCreatedAt(vehiclesResponse.data ?? []),
        tags: sortByCreatedAt(tagsResponse.data ?? []),
        alerts: sortByCreatedAt(alertsResponse.data ?? []),
        sessions: sortByCreatedAt(sessionsResponse.data ?? []),
        lastFetchedAt: Date.now(),
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load data' });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  fetchVehiclesAndTags: async (mode = 'initial') => {
    const state = get();

    if (mode === 'silent' && state.isCacheValid()) {
      return;
    }

    if (mode === 'initial' && state.vehicles.length === 0) {
      set({ isLoading: true, error: null });
    } else if (mode === 'refresh') {
      set({ isRefreshing: true, error: null });
    }

    try {
      const [vehiclesResponse, tagsResponse] = await Promise.all([
        apiService.listVehicles(),
        apiService.listTags(),
      ]);

      const failure = [vehiclesResponse, tagsResponse].find((r) => !r.success);

      if (failure) {
        throw new Error(failure.error || 'Failed to load vehicles');
      }

      set({
        vehicles: sortByCreatedAt(vehiclesResponse.data ?? []),
        tags: sortByCreatedAt(tagsResponse.data ?? []),
        lastFetchedAt: Date.now(),
        error: null,
      });
    } catch (err: any) {
      set({ error: err.message || 'Failed to load vehicles' });
    } finally {
      set({ isLoading: false, isRefreshing: false });
    }
  },

  fetchAlerts: async () => {
    try {
      const response = await apiService.listAlerts();
      if (response.success && response.data) {
        set({ alerts: sortByCreatedAt(response.data) });
      }
    } catch {
      // Silent fail for background refresh
    }
  },

  fetchSessions: async () => {
    try {
      const response = await apiService.listContactSessions();
      if (response.success && response.data) {
        set({ sessions: sortByCreatedAt(response.data) });
      }
    } catch {
      // Silent fail for background refresh
    }
  },

  // Optimistic updates
  addVehicle: (vehicle) =>
    set((state) => ({
      vehicles: sortByCreatedAt([vehicle, ...state.vehicles]),
    })),

  updateVehicle: (vehicle) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === vehicle.id ? vehicle : v)),
    })),

  removeVehicle: (vehicleId) =>
    set((state) => ({
      vehicles: state.vehicles.filter((v) => v.id !== vehicleId),
    })),

  addTag: (tag) =>
    set((state) => ({
      tags: sortByCreatedAt([tag, ...state.tags]),
    })),

  updateTag: (tag) =>
    set((state) => ({
      tags: state.tags.map((t) => (t.id === tag.id ? tag : t)),
    })),

  markAlertRead: (alertId) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === alertId ? { ...a, isRead: true } : a,
      ),
    })),

  markAllAlertsRead: () =>
    set((state) => ({
      alerts: state.alerts.map((a) => ({ ...a, isRead: true })),
    })),

  addSession: (session) =>
    set((state) => ({
      sessions: sortByCreatedAt([session, ...state.sessions]),
    })),

  updateSession: (session) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === session.id ? session : s)),
    })),
}));

// Selectors for derived state
export const useActiveVehicles = () =>
  useAppStore(useShallow((state) => state.vehicles.filter((v) => v.status === 'active')));

export const useActiveTags = () =>
  useAppStore(useShallow((state) => state.tags.filter((t) => t.state === 'activated')));

export const useUnreadAlerts = () =>
  useAppStore(useShallow((state) => state.alerts.filter((a) => !a.isRead)));

export const useOpenSessions = () =>
  useAppStore(useShallow((state) => state.sessions.filter((s) => s.status === 'initiated')));

export const useVehicleTags = (vehicleId: string) =>
  useAppStore(useShallow((state) => state.tags.filter((t) => t.vehicleId === vehicleId)));
