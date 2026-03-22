import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Plus,
  Search,
  Car,
  Edit2,
  Tag,
  QrCode,
  ChevronRight,
  MapPin,
} from 'lucide-react-native';
import { Colors, spacing, borderRadius, shadows, ThemeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Card, StatusBadge, IconButton, EmptyState, Button } from '@/components/ui';

// Mock vehicles data
const MOCK_VEHICLES = [
  {
    id: '1',
    name: 'Honda Civic 2022',
    plate: 'ABC 1234',
    emirate: 'Dubai',
    status: 'active' as const,
    tagsCount: 3,
    make: 'Honda',
    model: 'Civic',
  },
  {
    id: '2',
    name: 'Toyota Camry 2021',
    plate: 'XYZ 5678',
    emirate: 'Abu Dhabi',
    status: 'active' as const,
    tagsCount: 2,
    make: 'Toyota',
    model: 'Camry',
  },
];

export default function VehiclesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredVehicles = MOCK_VEHICLES.filter(
    (vehicle) =>
      vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.component,
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Vehicles</Text>
        <IconButton
          icon={<Plus size={22} color={colors.primary} strokeWidth={2.5} />}
          onPress={() => {}}
          variant="ghost"
          size="md"
        />
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}>
          <Search size={20} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search vehicles..."
            placeholderTextColor={colors.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }>
        {filteredVehicles.length === 0 ? (
          <EmptyState
            icon={<Car size={64} color={colors.textMuted} strokeWidth={1.5} />}
            title="No Vehicles Yet"
            description="Add your first vehicle to start generating QR tags and receive alerts."
            action={
              <Button onPress={() => {}} fullWidth={false} style={{ paddingHorizontal: 32 }}>
                Add Vehicle
              </Button>
            }
          />
        ) : (
          filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              colors={colors}
              onPress={() => {}}
              onEdit={() => {}}
              onTags={() => {}}
              onQR={() => {}}
            />
          ))
        )}

        <View style={{ height: spacing.xlarge }} />
      </ScrollView>
    </View>
  );
}

interface VehicleCardProps {
  vehicle: (typeof MOCK_VEHICLES)[0];
  colors: ThemeColors;
  onPress: () => void;
  onEdit: () => void;
  onTags: () => void;
  onQR: () => void;
}

function VehicleCard({
  vehicle,
  colors,
  onPress,
  onEdit,
  onTags,
  onQR,
}: VehicleCardProps) {
  return (
    <TouchableOpacity
      style={[styles.vehicleCard, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}>
      {/* Vehicle Info */}
      <View style={styles.vehicleHeader}>
        <View
          style={[styles.vehicleIcon, { backgroundColor: colors.primaryLighter }]}>
          <Car size={28} color={colors.primary} strokeWidth={2} />
        </View>
        <View style={styles.vehicleInfo}>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {vehicle.name}
          </Text>
          <View style={styles.vehicleDetails}>
            <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
              {vehicle.plate}
            </Text>
            <View style={styles.dot} />
            <View style={styles.emirateContainer}>
              <MapPin size={12} color={colors.textMuted} />
              <Text style={[styles.vehicleEmirate, { color: colors.textMuted }]}>
                {vehicle.emirate}
              </Text>
            </View>
          </View>
        </View>
        <ChevronRight size={20} color={colors.textMuted} />
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Status and Actions Row */}
      <View style={styles.vehicleFooter}>
        <View style={styles.statusContainer}>
          <StatusBadge status={vehicle.status} />
          <View style={styles.tagsBadge}>
            <Tag size={14} color={colors.textSecondary} />
            <Text style={[styles.tagsCount, { color: colors.textSecondary }]}>
              {vehicle.tagsCount} Tags
            </Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={onEdit}>
            <Edit2 size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}
            onPress={onTags}>
            <Tag size={16} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>
              Tags
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primaryLighter }]}
            onPress={onQR}>
            <QrCode size={16} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.primary }]}>QR</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.component,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.component,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.component,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.default,
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: spacing.section,
    paddingTop: spacing.default,
  },
  vehicleCard: {
    borderRadius: borderRadius['2xl'],
    padding: spacing.card,
    marginBottom: spacing.component,
    ...shadows.sm,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  vehicleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehiclePlate: {
    fontSize: 14,
    fontWeight: '500',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  emirateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleEmirate: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: spacing.component,
  },
  vehicleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.default,
  },
  tagsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagsCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.default,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.default,
    borderRadius: borderRadius.md,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
