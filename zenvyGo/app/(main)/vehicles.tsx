import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Car,
  HeartHandshake,
  PenSquare,
  Plus,
  QrCode,
  Search,
  ShieldPlus,
  Sparkles,
  Tag,
  X,
} from 'lucide-react-native';
import { Badge, Button, Card, EmptyState, Input } from '@/components/ui';
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
import { useVehicles, useCreateVehicle, useUpdateVehicle, useArchiveVehicle } from '@/hooks/use-vehicles';
import { useTags, useCreateTag, useActivateTag } from '@/hooks/use-tags';
import { useTranslation } from 'react-i18next';

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

function createEmptyEmergencyForm(): EmergencyFormState {
  return {
    contacts: [{ ...EMPTY_CONTACT }],
    medicalNotes: '',
    roadsideAssistanceNumber: '',
  };
}

export default function VehiclesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  // TanStack Query hooks
  const { data: vehicles = [], isLoading, isRefetching: isRefreshing, refetch: refetchVehiclesAndTags } = useVehicles();
  const { data: tags = [] } = useTags();
  const createVehicleMutation = useCreateVehicle();
  const updateVehicleMutation = useUpdateVehicle();
  const archiveVehicleMutation = useArchiveVehicle();
  const createTagMutation = useCreateTag();
  const activateTagMutation = useActivateTag();

  const [submittingVehicle, setSubmittingVehicle] = useState(false);
  const [submittingEmergency, setSubmittingEmergency] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleForm, setVehicleForm] = useState<VehicleFormState>(EMPTY_VEHICLE_FORM);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [vehicleFormError, setVehicleFormError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<TagSummary | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [emergencyModalVisible, setEmergencyModalVisible] = useState(false);
  const [selectedVehicleForEmergency, setSelectedVehicleForEmergency] = useState<Vehicle | null>(null);
  const [emergencyProfile, setEmergencyProfile] = useState<EmergencyProfile | null>(null);
  const [emergencyForm, setEmergencyForm] = useState<EmergencyFormState>(createEmptyEmergencyForm);
  const [loadingEmergencyProfile, setLoadingEmergencyProfile] = useState(false);
  const [emergencyProfileError, setEmergencyProfileError] = useState<string | null>(null);
  const emergencyModalRequestId = useRef(0);

  // Memoized filtered vehicles for search
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return vehicles;

    const query = searchQuery.trim().toLowerCase();
    return vehicles.filter((vehicle) => {
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

      return haystack.includes(query);
    });
  }, [vehicles, searchQuery]);

  // Memoized tags lookup by vehicle ID
  const tagsByVehicleId = useMemo(() => {
    const map = new Map<string, TagSummary[]>();
    for (const tag of tags) {
      const existing = map.get(tag.vehicleId) ?? [];
      existing.push(tag);
      map.set(tag.vehicleId, existing);
    }
    return map;
  }, [tags]);

  const openCreateVehicle = useCallback(() => {
    setEditingVehicle(null);
    setVehicleForm(EMPTY_VEHICLE_FORM);
    setVehicleFormError(null);
    setVehicleModalVisible(true);
  }, []);

  const openEditVehicle = useCallback((vehicle: Vehicle) => {
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
  }, []);

  const resetEmergencyEditor = useCallback(() => {
    setEmergencyProfile(null);
    setEmergencyForm(createEmptyEmergencyForm());
    setLoadingEmergencyProfile(false);
    setEmergencyProfileError(null);
    setSubmittingEmergency(false);
  }, []);

  const closeEmergencyModal = useCallback(() => {
    emergencyModalRequestId.current += 1;
    setEmergencyModalVisible(false);
    setSelectedVehicleForEmergency(null);
    resetEmergencyEditor();
  }, [resetEmergencyEditor]);

  const handleSaveVehicle = useCallback(async () => {
    if (!vehicleForm.plateNumber.trim()) {
      setVehicleFormError(t('vehicles.plateRequired'));
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
      setVehicleFormError(t('vehicles.yearRange'));
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
      if (editingVehicle) {
        await updateVehicleMutation.mutateAsync({ vehicleId: editingVehicle.id, ...payload });
      } else {
        await createVehicleMutation.mutateAsync(payload);
      }

      setVehicleModalVisible(false);
      setVehicleForm(EMPTY_VEHICLE_FORM);
      setEditingVehicle(null);
    } catch (error: any) {
      setVehicleFormError(error.message || 'Unable to save vehicle');
    } finally {
      setSubmittingVehicle(false);
    }
  }, [vehicleForm, editingVehicle, createVehicleMutation, updateVehicleMutation]);

  const handleArchiveVehicle = useCallback((vehicle: Vehicle) => {
    Alert.alert(
      t('vehicles.archiveVehicle'),
      t('vehicles.archiveConfirm', { name: formatVehicleName(vehicle) }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.archive'),
          style: 'destructive',
          onPress: () => {
            archiveVehicleMutation.mutate(vehicle.id, {
              onError: (err) => {
                Alert.alert(t('vehicles.archiveError'), err.message || t('common.tryAgain'));
              },
            });
            setVehicleModalVisible(false);
            setEditingVehicle(null);
          },
        },
      ],
    );
  }, [archiveVehicleMutation, t]);

  const handleCreateTag = useCallback((vehicle: Vehicle) => {
    createTagMutation.mutate({ vehicleId: vehicle.id, type: 'qr' }, {
      onSuccess: (newTag) => {
        setSelectedTag(newTag);
        setQrModalVisible(true);
      },
      onError: (err) => {
        Alert.alert(t('vehicles.tagCreateError'), err.message || t('common.tryAgain'));
      },
    });
  }, [createTagMutation]);

  const handleActivateTag = useCallback((tag: TagSummary) => {
    activateTagMutation.mutate(tag.id, {
      onError: (err) => {
        Alert.alert(t('vehicles.tagActivateError'), err.message || t('common.tryAgain'));
      },
    });
  }, [activateTagMutation]);

  const openQrModal = useCallback((tag: TagSummary) => {
    setSelectedTag(tag);
    setQrModalVisible(true);
  }, []);

  const loadEmergencyProfile = useCallback(async (vehicle: Vehicle) => {
    const requestId = emergencyModalRequestId.current + 1;
    emergencyModalRequestId.current = requestId;

    setSelectedVehicleForEmergency(vehicle);
    setEmergencyModalVisible(true);
    setLoadingEmergencyProfile(true);
    setEmergencyProfileError(null);
    setEmergencyProfile(null);
    setEmergencyForm(createEmptyEmergencyForm());

    const response = await apiService.getEmergencyProfile(vehicle.id);

    if (emergencyModalRequestId.current !== requestId) {
      return;
    }

    setLoadingEmergencyProfile(false);

    if (!response.success) {
      setEmergencyProfileError(response.error || t('common.tryAgain'));
      return;
    }

    const profile = response.data ?? null;
    setEmergencyProfile(profile);
    setEmergencyForm(profile ? mapProfileToForm(profile) : createEmptyEmergencyForm());
  }, []);

  const openEmergencyModal = useCallback((vehicle: Vehicle) => {
    void loadEmergencyProfile(vehicle);
  }, [loadEmergencyProfile]);

  const retryEmergencyProfileLoad = useCallback(() => {
    if (!selectedVehicleForEmergency) {
      return;
    }

    void loadEmergencyProfile(selectedVehicleForEmergency);
  }, [loadEmergencyProfile, selectedVehicleForEmergency]);

  const updateEmergencyContact = useCallback(
    (index: number, updates: Partial<EmergencyContactFormState>) => {
      setEmergencyForm((current) => ({
        ...current,
        contacts: current.contacts.map((contact, contactIndex) =>
          contactIndex === index ? { ...contact, ...updates } : contact,
        ),
      }));
    },
    [],
  );

  const addEmergencyContact = useCallback(() => {
    setEmergencyForm((current) => ({
      ...current,
      contacts: [...current.contacts, { ...EMPTY_CONTACT }],
    }));
  }, []);

  const removeEmergencyContact = useCallback((index: number) => {
    setEmergencyForm((current) => {
      const nextContacts = current.contacts.filter((_, contactIndex) => contactIndex !== index);
      return {
        ...current,
        contacts: nextContacts.length > 0 ? nextContacts : [{ ...EMPTY_CONTACT }],
      };
    });
  }, []);

  const handleSaveEmergencyProfile = useCallback(async () => {
    if (!selectedVehicleForEmergency) {
      return;
    }

    const requestId = emergencyModalRequestId.current;

    const contacts = emergencyForm.contacts
      .map((contact) => ({
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        relation: toNullable(contact.relation),
      }))
      .filter((contact) => contact.name || contact.phone || contact.relation);

    if (contacts.some((contact) => !contact.name || !contact.phone)) {
      Alert.alert(
        t('vehicles.incompleteContact'),
        t('vehicles.incompleteContactDesc'),
      );
      return;
    }

    setSubmittingEmergency(true);

    const response = await apiService.upsertEmergencyProfile(selectedVehicleForEmergency.id, {
      contacts: contacts as EmergencyContact[],
      medicalNotes: toNullable(emergencyForm.medicalNotes),
      roadsideAssistanceNumber: toNullable(emergencyForm.roadsideAssistanceNumber),
    });

    if (emergencyModalRequestId.current !== requestId) {
      return;
    }

    setSubmittingEmergency(false);

    if (!response.success || !response.data) {
      Alert.alert(t('vehicles.saveError'), response.error || t('common.tryAgain'));
      return;
    }

    setEmergencyProfile(response.data);
    setEmergencyForm(mapProfileToForm(response.data));
    closeEmergencyModal();
  }, [closeEmergencyModal, selectedVehicleForEmergency, emergencyForm]);

  const renderVehicleCard = useCallback(({ item: vehicle, index }: { item: Vehicle; index: number }) => {
    const vehicleTags = tagsByVehicleId.get(vehicle.id) ?? [];
    const latestTag = vehicleTags[0] ?? null;
    const generatedTag = vehicleTags.find((tag) => tag.state === 'generated') ?? null;

    return (
      <Animated.View entering={FadeInDown.delay(Math.min(index * 50, 200)).springify()}>
        <Card style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <LinearGradient
              colors={colorScheme === 'dark'
                ? ['#00D1FF', '#0070DE']
                : ['#00BAFF', '#0070DE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.vehicleIcon}>
              <Car size={24} color="#FFFFFF" strokeWidth={2} />
            </LinearGradient>
            <View style={styles.vehicleCopy}>
              <Text style={[styles.vehicleName, { color: colors.text }]}>
                {formatVehicleName(vehicle)}
              </Text>
              <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
                {formatPlate(vehicle)}
              </Text>
            </View>
            <View style={styles.statusContainer}>
              {vehicle.status === 'active' ? (
                <View style={[styles.statusBadge, { backgroundColor: colors.successBackground }]}>
                  <Sparkles size={12} color={colors.success} />
                  <Text style={[styles.statusText, { color: colors.success }]}>{t('common.active')}</Text>
                </View>
              ) : (
                <Badge variant="default">{t('vehicles.archived')}</Badge>
              )}
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.metaTag, { backgroundColor: colors.primaryLighter }]}>
              <Tag size={12} color={colors.primary} />
              <Text style={[styles.metaTagText, { color: colors.primary }]}>
                {vehicleTags.length} tag{vehicleTags.length !== 1 ? 's' : ''}
              </Text>
            </View>
            {latestTag && (
              <View style={[
                styles.metaTag,
                { backgroundColor: latestTag.state === 'activated' ? colors.successBackground : colors.warningBackground }
              ]}>
                <Text style={[
                  styles.metaTagText,
                  { color: latestTag.state === 'activated' ? colors.success : colors.warning }
                ]}>
                  {formatTagState(latestTag.state)}
                </Text>
              </View>
            )}
            {vehicle.color && (
              <View style={[styles.metaTag, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.metaTagText, { color: colors.textSecondary }]}>
                  {vehicle.color}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {latestTag
              ? t('vehicles.tagCreated', { time: formatRelativeTime(latestTag.createdAt) })
              : t('vehicles.generateTagHint')}
          </Text>

          <View style={styles.actionWrap}>
            <ActionChip
              label={t('vehicles.edit')}
              icon={<PenSquare size={15} color={colors.textSecondary} />}
              colors={colors}
              onPress={() => openEditVehicle(vehicle)}
            />
            <ActionChip
              label={t('vehicles.emergency')}
              icon={<HeartHandshake size={15} color={colors.danger} />}
              colors={colors}
              onPress={() => openEmergencyModal(vehicle)}
            />
            <ActionChip
              label={t('vehicles.generateQr')}
              icon={<ShieldPlus size={15} color={colors.primary} />}
              colors={colors}
              highlighted
              onPress={() => handleCreateTag(vehicle)}
            />
            {generatedTag ? (
              <ActionChip
                label={t('vehicles.activate')}
                icon={<Tag size={15} color={colors.success} />}
                colors={colors}
                onPress={() => handleActivateTag(generatedTag)}
              />
            ) : null}
            {latestTag ? (
              <ActionChip
                label={t('vehicles.showQr')}
                icon={<QrCode size={15} color={colors.info} />}
                colors={colors}
                onPress={() => openQrModal(latestTag)}
              />
            ) : null}
          </View>
        </Card>
      </Animated.View>
    );
  }, [colorScheme, colors, tagsByVehicleId, openEditVehicle, openEmergencyModal, handleCreateTag, handleActivateTag, openQrModal]);

  const keyExtractor = useCallback((item: Vehicle) => item.id, []);

  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      icon={<Car size={60} color={colors.textMuted} strokeWidth={1.5} />}
      title={vehicles.length === 0 ? t('vehicles.noVehicles') : t('vehicles.noMatches')}
      description={
        vehicles.length === 0
          ? t('vehicles.noVehiclesDesc')
          : t('vehicles.noMatchesDesc')
      }
      action={
        vehicles.length === 0 ? (
          <Button fullWidth={false} onPress={openCreateVehicle}>
            {t('vehicles.addVehicle')}
          </Button>
        ) : undefined
      }
    />
  ), [colors.textMuted, vehicles.length, openCreateVehicle, t]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Gradient Header */}
      <LinearGradient
        colors={colorScheme === 'dark'
          ? ['#0070DE', '#0A2540'] // Deep premium gradient
          : ['#00BAFF', '#0070DE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.component }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>{t('vehicles.title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('vehicles.registered', { count: vehicles.length })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={openCreateVehicle}
            style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        <View style={styles.headerPattern}>
          <View style={[styles.patternCircle, styles.patternCircle1]} />
          <View style={[styles.patternCircle, styles.patternCircle2]} />
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('vehicles.searchPlaceholder')}
            placeholderTextColor={colors.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading && vehicles.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredVehicles}
          renderItem={renderVehicleCard}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={ListEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => refetchVehiclesAndTags()}
              tintColor={colors.primary}
            />
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={7}
          initialNumToRender={5}
        />
      )}

      <VehicleEditorModal
        colors={colors}
        visible={vehicleModalVisible}
        title={editingVehicle ? t('vehicles.editVehicle') : t('vehicles.addVehicle')}
        subtitle={
          editingVehicle
            ? t('vehicles.editVehicleDesc')
            : t('vehicles.addVehicleDesc')
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
                {t('common.archive')}
              </Button>
            ) : null}
            <Button
              fullWidth={false}
              style={styles.modalFooterButton}
              loading={submittingVehicle}
              onPress={handleSaveVehicle}>
              {editingVehicle ? t('vehicles.saveChanges') : t('vehicles.createVehicle')}
            </Button>
          </View>
        }>
        <Input
          label={t('vehicles.plateNumber')}
          value={vehicleForm.plateNumber}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, plateNumber: text }))}
          placeholder="A12345"
        />
        <Input
          label={t('vehicles.region')}
          value={vehicleForm.plateRegion}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, plateRegion: text }))}
          placeholder="Dubai"
        />
        <Input
          label={t('vehicles.make')}
          value={vehicleForm.make}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, make: text }))}
          placeholder="Toyota"
        />
        <Input
          label={t('vehicles.model')}
          value={vehicleForm.model}
          onChangeText={(text) => setVehicleForm((current) => ({ ...current, model: text }))}
          placeholder="Camry"
        />
        <View style={styles.inlineFields}>
          <View style={styles.inlineField}>
            <Input
              label={t('vehicles.color')}
              value={vehicleForm.color}
              onChangeText={(text) => setVehicleForm((current) => ({ ...current, color: text }))}
              placeholder="White"
            />
          </View>
          <View style={styles.inlineField}>
            <Input
              label={t('vehicles.year')}
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
        title={t('vehicles.qrTag')}
        subtitle={t('vehicles.qrTagDesc')}
        onClose={() => setQrModalVisible(false)}
        footer={
          <Button onPress={() => setQrModalVisible(false)} fullWidth={false}>
            {t('common.close')}
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
        title={t('vehicles.emergencyProfile')}
        subtitle={
          selectedVehicleForEmergency
            ? t('vehicles.emergencyProfileFor', { name: formatVehicleName(selectedVehicleForEmergency) })
            : t('vehicles.emergencyProfile')
        }
        onClose={closeEmergencyModal}
        footer={
          loadingEmergencyProfile || emergencyProfileError ? null : (
            <Button loading={submittingEmergency} onPress={handleSaveEmergencyProfile} fullWidth={false}>
              {t('vehicles.saveProfile')}
            </Button>
          )
        }>
        {loadingEmergencyProfile ? (
          <View style={styles.centered}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : emergencyProfileError ? (
          <View style={styles.emergencyState}>
            <Text style={[styles.emergencyStateTitle, { color: colors.text }]}>
              {t('vehicles.loadError')}
            </Text>
            <Text style={[styles.emergencyStateBody, { color: colors.textSecondary }]}>
              {emergencyProfileError}
            </Text>
            <Button variant="outline" fullWidth={false} onPress={retryEmergencyProfileLoad}>
              {t('common.retry')}
            </Button>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              {t('vehicles.emergencyContacts')}
            </Text>
            {emergencyForm.contacts.map((contact, index) => (
              <View
                key={index}
                style={[
                  styles.contactBlock,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}>
                <View style={styles.contactBlockHeader}>
                  <Text style={[styles.contactBlockTitle, { color: colors.text }]}>
                    {t('vehicles.contact', { index: index + 1 })}
                  </Text>
                  {emergencyForm.contacts.length > 1 ? (
                    <TouchableOpacity onPress={() => removeEmergencyContact(index)}>
                      <Text style={[styles.contactRemoveText, { color: colors.danger }]}>
                        {t('vehicles.remove')}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <Input
                  label={t('vehicles.name')}
                  value={contact.name}
                  onChangeText={(text) => updateEmergencyContact(index, { name: text })}
                  placeholder="Aisha Khan"
                />
                <Input
                  label={t('vehicles.phone')}
                  value={contact.phone}
                  onChangeText={(text) => updateEmergencyContact(index, { phone: text })}
                  placeholder="+971501234567"
                  keyboardType="phone-pad"
                />
                <Input
                  label={t('vehicles.relation')}
                  value={contact.relation}
                  onChangeText={(text) => updateEmergencyContact(index, { relation: text })}
                  placeholder="Spouse, sibling, coworker"
                />
              </View>
            ))}
            {emergencyForm.contacts.length < 3 ? (
              <Button
                variant="outline"
                fullWidth={false}
                onPress={addEmergencyContact}>
                {t('vehicles.addContact')}
              </Button>
            ) : null}
            <Input
              label={t('vehicles.roadsideAssistance')}
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
              label={t('vehicles.medicalNotes')}
              value={emergencyForm.medicalNotes}
              onChangeText={(text) =>
                setEmergencyForm((current) => ({
                  ...current,
                  medicalNotes: text,
                }))
              }
              placeholder={t('vehicles.medicalNotesPlaceholder')}
              multiline
              numberOfLines={4}
              inputStyle={styles.multilineInput}
            />
            {emergencyProfile ? (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>
                {t('vehicles.lastUpdated', { time: formatRelativeTime(emergencyProfile.updatedAt) })}
              </Text>
            ) : null}
          </>
        )}
      </VehicleEditorModal>
    </View>
  );
}

const VehicleEditorModal = React.memo(function VehicleEditorModal({
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
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}>
              {children}
            </ScrollView>

            {footer ? <View style={styles.modalFooterContainer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const ActionChip = React.memo(function ActionChip({
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
});

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
    paddingBottom: spacing.large,
    paddingHorizontal: spacing.section,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '50%',
    zIndex: 1,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  patternCircle1: {
    top: -30,
    right: -30,
    width: 120,
    height: 120,
  },
  patternCircle2: {
    bottom: -20,
    right: 50,
    width: 80,
    height: 80,
  },
  searchContainer: {
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.component,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.component,
    minHeight: 48,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: spacing.section,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  listContent: {
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
    width: 52,
    height: 52,
    borderRadius: borderRadius.xl,
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
  statusContainer: {
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.tight,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.default,
    marginTop: spacing.section,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.tight,
    borderRadius: borderRadius.full,
  },
  metaTagText: {
    fontSize: 12,
    fontWeight: '500',
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
    flex: 1,
  },
  inlineFields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    width: '80%',
    aspectRatio: 1,
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
    borderRadius: borderRadius.xl,
    padding: spacing.section,
    marginBottom: spacing.component,
    ...shadows.sm,
  },
  contactBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.component,
  },
  contactBlockTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  contactRemoveText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emergencyState: {
    alignItems: 'flex-start',
    gap: spacing.component,
    paddingVertical: spacing.component,
  },
  emergencyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emergencyStateBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
    paddingTop: spacing.section,
  },
});
