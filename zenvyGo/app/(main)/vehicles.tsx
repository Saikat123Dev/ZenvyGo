import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import {
  Car,
  HeartHandshake,
  PenSquare,
  Plus,
  QrCode,
  ShieldPlus,
  Tag,
  X,
} from 'lucide-react-native';
import { Badge, Button, Card, EmptyState, IconButton, Input } from '@/components/ui';
import { Colors, ThemeColors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  apiService,
  type EmergencyContact,
  type EmergencyProfile,
  type TagSummary,
  type Vehicle,
} from '@/lib/api';
import {
  formatPlate,
  formatRelativeTime,
  formatTagState,
  formatVehicleName,
} from '@/lib/format';

interface VehicleFormState {
  plateNumber: string;
  plateRegion: string;
  make: string;
  model: string;
  color: string;
  year: string;
}

interface EmergencyContactFormState {
  name: string;
  phone: string;
  relation: string;
}

interface EmergencyFormState {
  contacts: EmergencyContactFormState[];
  medicalNotes: string;
  roadsideAssistanceNumber: string;
}

const EMPTY_VEHICLE_FORM: VehicleFormState = {
  plateNumber: '',
  plateRegion: '',
  make: '',
  model: '',
  color: '',
  year: '',
};

const EMPTY_CONTACT: EmergencyContactFormState = {
  name: '',
  phone: '',
  relation: '',
};

const EMPTY_EMERGENCY_FORM: EmergencyFormState = {
  contacts: [{ ...EMPTY_CONTACT }],
  medicalNotes: '',
  roadsideAssistanceNumber: '',
};

export default function VehiclesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [submittingEmergency, setSubmittingEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [tags, setTags] = useState<TagSummary[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(EMPTY_VEHICLE_FORM);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [vehicleFormError, setVehicleFormError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagSummary | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [selectedVehicleForEmergency, setSelectedVehicleForEmergency] = useState<Vehicle | null>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile | null>(null);
  const [emergencyForm, setEmergencyForm] = useState<EmergencyFormState>(EMPTY_EMERGENCY_FORM);
  const [loadingEmergencyProfile, setLoadingEmergencyProfile] = useState(false);

  const loadData = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [vehiclesResponse, tagsResponse] = await Promise.all([
        apiService.listVehicles(),
        apiService.listTags(),
      ]);

      const failure =
        [vehiclesResponse, tagsResponse].find((response) => !response.success) ?? null;

      if (failure) {
        throw new Error(failure.error || 'Failed to load vehicles');
      }

      setVehicles(
        [...(vehiclesResponse.data ?? [])].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
      );
      setTags(
        [...(tagsResponse.data ?? [])].sort((left, right) =>
          right.createdAt.localeCompare(left.createdAt),
        ),
      );
    } catch (error: any) {
      Alert.alert('Unable to load vehicles', error.message || 'Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredVehicles = vehicles.filter((vehicle) => {
    const haystack = [
      vehicle.plateNumber,
      vehicle.plateRegion,
      vehicle.make,
      vehicle.model,
      vehicle.color,
      vehicle.year ? String(vehicle.year) : null,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(searchQuery.trim().toLowerCase());
  });

  const openCreateVehicle = () => {
    setEditingVehicle(null);
    setVehicleForm(EMPTY_VEHICLE_FORM);
    setVehicleFormError(null);
    setVehicleModalVisible(true);
  };

  const openEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setVehicleForm({
      plateNumber: vehicle.plateNumber,
      plateRegion: vehicle.plateRegion ?? '',
      make: vehicle.make ?? '',
      model: vehicle.model ?? '',
      color: vehicle.color ?? '',
      year: vehicle.year ? String(vehicle.year) : '',
    });
    setVehicleFormError(null);
    setVehicleModalVisible(true);
  };

  const handleSaveVehicle = async () => {
    if (!vehicleForm.plateNumber.trim()) {
      setVehicleFormError('Plate number is required.');
      return;
    }

    const yearValue = vehicleForm.year.trim();
    const parsedYear = yearValue ? Number(yearValue) : null;
    if (
      yearValue &&
      (parsedYear === null ||
        !Number.isInteger(parsedYear) ||
        parsedYear < 1950 ||
        parsedYear > 2100)
    ) {
      setVehicleFormError('Year must be between 1950 and 2100.');
      return;
    }

    setSubmittingVehicle(true);
    setVehicleFormError(null);

    const payload = {
      plateNumber: vehicleForm.plateNumber.trim(),
      plateRegion: toNullable(vehicleForm.plateRegion),
      make: toNullable(vehicleForm.make),
      model: toNullable(vehicleForm.model),
      color: toNullable(vehicleForm.color),
      year: parsedYear,
    };

    try {
      const response = editingVehicle
        ? await apiService.updateVehicle(editingVehicle.id, payload)
        : await apiService.createVehicle(payload);

      if (!response.success) {
        throw new Error(response.error || 'Unable to save vehicle');
      }

      setVehicleModalVisible(false);
      setVehicleForm(EMPTY_VEHICLE_FORM);
      setEditingVehicle(null);
      loadData('refresh');
    } catch (error: any) {
      setVehicleFormError(error.message || 'Unable to save vehicle');
    } finally {
      setSubmittingVehicle(false);
    }
  };

  const handleArchiveVehicle = (vehicle: Vehicle) => {
    Alert.alert(
      'Archive vehicle',
      `Archive ${formatVehicleName(vehicle)}? You can keep existing tags for history, but the vehicle will no longer be active.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            const response = await apiService.archiveVehicle(vehicle.id);
            if (!response.success) {
              Alert.alert('Unable to archive vehicle', response.error || 'Please try again.');
              return;
            }

            setVehicleModalVisible(false);
            setEditingVehicle(null);
            loadData('refresh');
          },
        },
      ],
    );
  };

  const handleCreateTag = async (vehicle: Vehicle) => {
    const response = await apiService.createTag({ vehicleId: vehicle.id, type: 'qr' });
    if (!response.success || !response.data) {
      Alert.alert('Unable to create QR tag', response.error || 'Please try again.');
      return;
    }

    setSelectedTag(response.data);
    setQrModalVisible(true);
    loadData('refresh');
  };

  const handleActivateTag = async (tag: TagSummary) => {
    const response = await apiService.activateTag(tag.id);
    if (!response.success) {
      Alert.alert('Unable to activate tag', response.error || 'Please try again.');
      return;
    }

    loadData('refresh');
  };

  const openQrModal = (tag: TagSummary) => {
    setSelectedTag(tag);
    setQrModalVisible(true);
  };

  const openEmergencyModal = async (vehicle: Vehicle) => {
    setSelectedVehicleForEmergency(vehicle);
    setEmergencyModalVisible(true);
    setLoadingEmergencyProfile(true);
    setEmergencyProfile(null);

    const response = await apiService.getEmergencyProfile(vehicle.id);
    if (!response.success) {
      setLoadingEmergencyProfile(false);
      Alert.alert('Unable to load emergency profile', response.error || 'Please try again.');
      return;
    }

    const profile = response.data ?? null;
    setEmergencyProfile(profile);
    setEmergencyForm(profile ? mapProfileToForm(profile) : EMPTY_EMERGENCY_FORM);
    setLoadingEmergencyProfile(false);
  };

  const handleSaveEmergencyProfile = async () => {
    if (!selectedVehicleForEmergency) {
      return;
    }

    const contacts = emergencyForm.contacts
      .map((contact) => ({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        relation: toNullable(contact.relation),
      }))
      .filter((contact) => contact.name || contact.phone || contact.relation);

    if (contacts.some((contact) => !contact.name || !contact.phone)) {
      Alert.alert(
        'Incomplete emergency contact',
        'Each emergency contact must include both a name and phone number.',
      );
      return;
    }

    setSubmittingEmergency(true);

    const response = await apiService.upsertEmergencyProfile(selectedVehicleForEmergency.id, {
      contacts: contacts as EmergencyContact[],
      medicalNotes: toNullable(emergencyForm.medicalNotes),
      roadsideAssistanceNumber: toNullable(emergencyForm.roadsideAssistanceNumber),
    });

    setSubmittingEmergency(false);

    if (!response.success || !response.data) {
      Alert.alert('Unable to save emergency profile', response.error || 'Please try again.');
      return;
    }

    setEmergencyProfile(response.data);
    setEmergencyModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.component,
            backgroundColor: colors.headerBackground,
            borderBottomColor: colors.border,
          },
        ]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Vehicles</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Manage registration, QR tags, and emergency details.
          </Text>
        </View>
        <IconButton
          icon={<Plus size={20} color={colors.primary} strokeWidth={2.5} />}
          onPress={openCreateVehicle}
          variant="ghost"
          size="md"
        />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surfaceSecondary,
              borderColor: colors.border,
            },
          ]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by plate, make, model, or region"
            placeholderTextColor={colors.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData('refresh')}
              tintColor={colors.primary}
            />
          }>
          {filteredVehicles.length === 0 ? (
            <EmptyState
              icon={<Car size={60} color={colors.textMuted} strokeWidth={1.5} />}
              title={vehicles.length === 0 ? 'No vehicles yet' : 'No matches found'}
              description={
                vehicles.length === 0
                  ? 'Add your first vehicle to generate QR tags and store emergency contacts.'
                  : 'Try a different search term or clear the filter.'
              }
              action={
                vehicles.length === 0 ? (
                  <Button fullWidth={false} onPress={openCreateVehicle}>
                    Add Vehicle
                  </Button>
                ) : undefined
              }
            />
          ) : (
            filteredVehicles.map((vehicle) => {
              const vehicleTags = tags.filter((tag) => tag.vehicleId === vehicle.id);
              const latestTag = vehicleTags[0] ?? null;
              const generatedTag = vehicleTags.find((tag) => tag.state === 'generated') ?? null;

              return (
                <Card key={vehicle.id} style={styles.vehicleCard}>
                  <View style={styles.vehicleHeader}>
                    <View
                      style={[
                        styles.vehicleIcon,
                        { backgroundColor: colors.primaryLighter },
                      ]}>
                      <Car size={26} color={colors.primary} strokeWidth={2} />
                    </View>
                    <View style={styles.vehicleCopy}>
                      <Text style={[styles.vehicleName, { color: colors.text }]}>
                        {formatVehicleName(vehicle)}
                      </Text>
                      <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
                        {formatPlate(vehicle)}
                      </Text>
                    </View>
                    <Badge variant={vehicle.status === 'active' ? 'success' : 'default'}>
                      {vehicle.status === 'active' ? 'Active' : 'Archived'}
                    </Badge>
                  </View>

                  <View style={styles.metaRow}>
                    <Badge variant="primary">{vehicleTags.length} tags</Badge>
                    <Badge variant={latestTag?.state === 'activated' ? 'success' : 'default'}>
                      {latestTag ? formatTagState(latestTag.state) : 'No tag yet'}
                    </Badge>
                    {vehicle.color ? <Badge variant="info">{vehicle.color}</Badge> : null}
                  </View>

                  {latestTag ? (
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Latest tag created {formatRelativeTime(latestTag.createdAt)}
                    </Text>
                  ) : (
                    <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                      Generate a QR tag to start accepting privacy-safe requests.
                    </Text>
                  )}

                  <View style={styles.actionWrap}>
                    <ActionChip
                      label="Edit"
                      icon={<PenSquare size={15} color={colors.textSecondary} />}
                      colors={colors}
                      onPress={() => openEditVehicle(vehicle)}
                    />
                    <ActionChip
                      label="Emergency"
                      icon={<HeartHandshake size={15} color={colors.textSecondary} />}
                      colors={colors}
                      onPress={() => openEmergencyModal(vehicle)}
                    />
                    <ActionChip
                      label="Generate QR"
                      icon={<ShieldPlus size={15} color={colors.primary} />}
                      colors={colors}
                      highlighted
                      onPress={() => handleCreateTag(vehicle)}
                    />
                    {generatedTag ? (
                      <ActionChip
                        label="Activate"
                        icon={<Tag size={15} color={colors.success} />}
                        colors={colors}
                        onPress={() => handleActivateTag(generatedTag)}
                      />
                    ) : null}
                    {latestTag ? (
                      <ActionChip
                        label="Show QR"
                        icon={<QrCode size={15} color={colors.textSecondary} />}
                        colors={colors}
                        onPress={() => openQrModal(latestTag)}
                      />
                    ) : null}
                  </View>
                </Card>
              );
            })
          )}
        </ScrollView>
      )}

      <VehicleEditorModal
        colors={colors}
        visible={vehicleModalVisible}
        title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}
        subtitle={
          editingVehicle
            ? 'Update the saved vehicle details.'
            : 'Add a vehicle before generating any QR tags.'
        }
        onClose={() => {
          setVehicleModalVisible(false);
          setEditingVehicle(null);
          setVehicleFormError(null);
        }}
        footer={
          <View style={styles.modalFooter}>
            {editingVehicle ? (
              <Button
                variant="outline"
                fullWidth={false}
                style={styles.modalFooterButton}
                onPress={() => handleArchiveVehicle(editingVehicle)}>
                Archive
              </Button>
            ) : null}
            <Button
              fullWidth={false}
              style={styles.modalFooterButton}
              loading={submittingVehicle}
              onPress={handleSaveVehicle}>
              {editingVehicle ? 'Save Changes' : 'Create Vehicle'}
            </Button>
          </View>
        }>
        <Input
          label="Plate Number"
          value={vehicleForm.plateNumber}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, plateNumber: text }))}
          placeholder="A12345"
        />
        <Input
          label="Region"
          value={vehicleForm.plateRegion}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, plateRegion: text }))}
          placeholder="Dubai"
        />
        <Input
          label="Make"
          value={vehicleForm.make}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, make: text }))}
          placeholder="Toyota"
        />
        <Input
          label="Model"
          value={vehicleForm.model}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, model: text }))}
          placeholder="Camry"
        />
        <View style={styles.inlineFields}>
          <View style={styles.inlineField}>
            <Input
              label="Color"
              value={vehicleForm.color}
              onChangeText={(text) => setVehicleForm((current) => ({ ...current, color: text }))}
              placeholder="White"
            />
          </View>
          <View style={styles.inlineField}>
            <Input
              label="Year"
              value={vehicleForm.year}
              onChangeText={(text) => setVehicleForm((current) => ({ ...current, year: text }))}
              placeholder="2025"
              keyboardType="number-pad"
            />
          </View>
        </View>
        {vehicleFormError ? (
          <Text style={[styles.formError, { color: colors.danger }]}>{vehicleFormError}</Text>
        ) : null}
      </VehicleEditorModal>

      <VehicleEditorModal
        colors={colors}
        visible={qrModalVisible}
        title="QR Tag"
        subtitle="Share this code on the vehicle so others can contact you without seeing your real number."
        onClose={() => setQrModalVisible(false)}
        footer={
          <Button onPress={() => setQrModalVisible(false)} fullWidth={false}>
            Close
          </Button>
        }>
        {selectedTag ? (
          <View style={styles.qrContent}>
            <View style={[styles.qrFrame, { borderColor: colors.border }]}>
              <Image source={{ uri: selectedTag.qrCodeUrl }} style={styles.qrImage} />
            </View>
            <View style={styles.metaRow}>
              <Badge variant={selectedTag.state === 'activated' ? 'success' : 'warning'}>
                {formatTagState(selectedTag.state)}
              </Badge>
              <Badge variant="primary">{selectedTag.type.toUpperCase()}</Badge>
            </View>
            <Text style={[styles.qrToken, { color: colors.textSecondary }]}>
              Token: {selectedTag.token}
            </Text>
          </View>
        ) : null}
      </VehicleEditorModal>

      <VehicleEditorModal
        colors={colors}
        visible={emergencyModalVisible}
        title="Emergency Profile"
        subtitle={
          selectedVehicleForEmergency
            ? `Emergency contacts for ${formatVehicleName(selectedVehicleForEmergency)}`
            : 'Emergency profile'
        }
        onClose={() => setEmergencyModalVisible(false)}
        footer={
          loadingEmergencyProfile ? null : (
            <Button loading={submittingEmergency} onPress={handleSaveEmergencyProfile} fullWidth={false}>
              Save Profile
            </Button>
          )
        }>
        {loadingEmergencyProfile ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              EMERGENCY CONTACTS
            </Text>
            {emergencyForm.contacts.map((contact, index) => (
              <View key={index} style={styles.contactBlock}>
                <Input
                  label={`Contact ${index + 1} Name`}
                  value={contact.name}
                  onChangeText={(text) =>
                    setEmergencyForm((current) => ({
                      ...current,
                      contacts: current.contacts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, name: text } : item,
                      ),
                    }))
                  }
                  placeholder="Aisha Khan"
                />
                <Input
                  label="Phone"
                  value={contact.phone}
                  onChangeText={(text) =>
                    setEmergencyForm((current) => ({
                      ...current,
                      contacts: current.contacts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, phone: text } : item,
                      ),
                    }))
                  }
                  placeholder="+971501234567"
                  keyboardType="phone-pad"
                />
                <Input
                  label="Relation"
                  value={contact.relation}
                  onChangeText={(text) =>
                    setEmergencyForm((current) => ({
                      ...current,
                      contacts: current.contacts.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, relation: text } : item,
                      ),
                    }))
                  }
                  placeholder="Spouse, sibling, coworker"
                />
              </View>
            ))}
            {emergencyForm.contacts.length < 3 ? (
              <Button
                variant="outline"
                fullWidth={false}
                onPress={() =>
                  setEmergencyForm((current) => ({
                    ...current,
                    contacts: [...current.contacts, { ...EMPTY_CONTACT }],
                  }))
                }>
                Add Contact
              </Button>
            ) : null}
            <Input
              label="Roadside Assistance Number"
              value={emergencyForm.roadsideAssistanceNumber}
              onChangeText={(text) =>
                setEmergencyForm((current) => ({
                  ...current,
                  roadsideAssistanceNumber: text,
                }))
              }
              placeholder="+971800000000"
              keyboardType="phone-pad"
            />
            <Input
              label="Medical Notes"
              value={emergencyForm.medicalNotes}
              onChangeText={(text) =>
                setEmergencyForm((current) => ({
                  ...current,
                  medicalNotes: text,
                }))
              }
              placeholder="Allergies, blood group, or anything helpful"
              multiline
              numberOfLines={4}
              inputStyle={styles.multilineInput}
            />
            {emergencyProfile ? (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                Last updated {formatRelativeTime(emergencyProfile.updatedAt)}
              </Text>
            ) : null}
          </>
        )}
      </VehicleEditorModal>
    </View>
  );
}

function VehicleEditorModal({
  children,
  colors,
  footer,
  onClose,
  subtitle,
  title,
  visible,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  footer?: React.ReactNode;
  onClose: () => void;
  subtitle: string;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
        <KeyboardAvoidingView
          style={styles.modalWrapper}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                  {subtitle}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: colors.surfaceSecondary }]}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={styles.modalBodyContent}
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>

            {footer ? <View style={styles.modalFooterContainer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function ActionChip({
  colors,
  highlighted = false,
  icon,
  label,
  onPress,
}: {
  colors: ThemeColors;
  highlighted?: boolean;
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.actionChip,
        {
          backgroundColor: highlighted ? colors.primaryLighter : colors.surfaceSecondary,
          borderColor: highlighted ? colors.primaryLight : colors.border,
        },
      ]}>
      {icon}
      <Text
        style={[
          styles.actionChipText,
          { color: highlighted ? colors.primary : colors.textSecondary },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function mapProfileToForm(profile: EmergencyProfile): EmergencyFormState {
  return {
    contacts:
      profile.contacts.length > 0
        ? profile.contacts.map((contact) => ({
            name: contact.name,
            phone: contact.phone,
            relation: contact.relation ?? '',
          }))
        : [{ ...EMPTY_CONTACT }],
    medicalNotes: profile.medicalNotes ?? '',
    roadsideAssistanceNumber: profile.roadsideAssistanceNumber ?? '',
  };
}

function toNullable(value: string): string | null {
  return value.trim() ? value.trim() : null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.component,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.component,
  },
  searchBar: {
    minHeight: 46,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.section,
  },
  searchInput: {
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.screen,
  },
  vehicleCard: {
    marginBottom: spacing.component,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.component,
  },
  vehicleIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleCopy: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 17,
    fontWeight: '600',
  },
  vehiclePlate: {
    fontSize: 13,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.default,
    marginTop: spacing.section,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.component,
  },
  actionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.default,
    marginTop: spacing.section,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.default,
  },
  actionChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '88%',
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.component,
    paddingHorizontal: spacing.card,
    paddingTop: spacing.card,
    paddingBottom: spacing.section,
  },
  modalHeaderCopy: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.default,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flexGrow: 0,
  },
  modalBodyContent: {
    paddingHorizontal: spacing.card,
    paddingBottom: spacing.section,
  },
  modalFooterContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.2)',
    paddingHorizontal: spacing.card,
    paddingVertical: spacing.section,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.component,
  },
  modalFooterButton: {
    minWidth: 132,
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.component,
  },
  inlineField: {
    flex: 1,
  },
  formError: {
    fontSize: 13,
    lineHeight: 18,
  },
  qrContent: {
    alignItems: 'center',
  },
  qrFrame: {
    width: 240,
    height: 240,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.component,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrImage: {
    width: '100%',
    height: '100%',
  },
  qrToken: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: spacing.section,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: spacing.component,
  },
  contactBlock: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    borderRadius: borderRadius.xl,
    padding: spacing.section,
    marginBottom: spacing.component,
    ...shadows.sm,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.section,
  },
});
