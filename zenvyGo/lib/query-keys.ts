/**
 * Type-safe query key factory
 *
 * Structured keys enable granular cache invalidation:
 *   queryKeys.vehicles.all   → invalidates all vehicle queries
 *   queryKeys.vehicles.list()→ invalidates the vehicle list
 *   queryKeys.vehicles.detail(id) → invalidates a single vehicle
 */
export const queryKeys = {
  vehicles: {
    all: ['vehicles'] as const,
    list: () => [...queryKeys.vehicles.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.vehicles.all, 'detail', id] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: () => [...queryKeys.tags.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.tags.all, 'detail', id] as const,
  },
  alerts: {
    all: ['alerts'] as const,
    list: () => [...queryKeys.alerts.all, 'list'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
    list: () => [...queryKeys.sessions.all, 'list'] as const,
  },
  user: {
    current: () => ['user', 'me'] as const,
  },
  emergencyProfiles: {
    byVehicle: (vehicleId: string) => ['emergencyProfiles', vehicleId] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: () => [...queryKeys.documents.all, 'list'] as const,
  },
};
