import React, { useCallback, useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Linking,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import {
  FileText,
  Plus,
  ChevronLeft,
  Eye,
  EyeOff,
  Trash2,
  Upload,
  X,
  ChevronDown,
  Settings2,
  Image as ImageIcon,
  File,
  AlertCircle,
  Briefcase,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { Button, Card, Input, Badge } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type DriverDocument, type Vehicle } from '@/lib/api';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useVehicles } from '@/hooks/use-vehicles';
import { useTags } from '@/hooks/use-tags';


type DocumentTypeOption = {
  value: 'driving_license' | 'rc' | 'puc' | 'insurance' | 'other';
  label: string;
  requiresVehicle: boolean;
};

const documentTypes: DocumentTypeOption[] = [
  { value: 'driving_license', label: 'Driving License', requiresVehicle: false },
  { value: 'rc', label: 'Vehicle Registration (RC)', requiresVehicle: true },
  { value: 'puc', label: 'PUC Certificate', requiresVehicle: true },
  { value: 'insurance', label: 'Insurance', requiresVehicle: true },
  { value: 'other', label: 'Other Document', requiresVehicle: false },
];

export default function DocumentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  const { data: vehicles = [] } = useVehicles();
  const { data: tags = [] } = useTags();

  const [documents, setDocuments] = useState<DriverDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<DriverDocument | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const lastFetchedAtRef = useRef<number>(0);
  const CACHE_VALIDITY_MS = 30000;

  // Upload form state
  const [selectedDocType, setSelectedDocType] = useState<DocumentTypeOption>(documentTypes[0]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    type: string;
  } | null>(null);
  const [docTypePickerVisible, setDocTypePickerVisible] = useState(false);
  const [vehiclePickerVisible, setVehiclePickerVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'vehicles'>('personal');

  const loadData = useCallback(async (force = false) => {
    // Skip fetch if cache is still valid
    if (!force && Date.now() - lastFetchedAtRef.current < CACHE_VALIDITY_MS && documents.length > 0) {
      return;
    }

    setLoading(true);
    setLoadError(null);

    try {
      const res = await apiService.listDocuments();

      if (res.success && res.data) {
        setDocuments(res.data);
        lastFetchedAtRef.current = Date.now();
      } else {
        const message = res.error || 'Failed to load documents';
        setLoadError(message);
        Alert.alert('Error', message);
      }
    } catch (error: any) {
      const message = error?.message || 'Something went wrong while loading documents';
      setLoadError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [documents.length]);

  const onRefresh = useCallback(() => {
    setLoading(true);
    // Force refresh bypassing the 30-second cache
    loadData(true).finally(() => setLoading(false));
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const groupedDocuments = useMemo(() => {
    const personal = documents.filter((d) => !d.vehicleId);
    const byVehicle = new Map<string, DriverDocument[]>();

    documents.forEach((doc) => {
      if (doc.vehicleId) {
        const existing = byVehicle.get(doc.vehicleId) ?? [];
        existing.push(doc);
        byVehicle.set(doc.vehicleId, existing);
      }
    });

    return { personal, byVehicle };
  }, [documents]);

  const resetUploadForm = () => {
    setSelectedDocType(documentTypes[0]);
    setSelectedVehicle(null);
    setDocumentName('');
    setDocumentNumber('');
    setExpiryDate('');
    setIsVisible(true);
    setSelectedFile(null);
  };

  const handlePickImage = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera roll permissions are required to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          name: asset.fileName || 'image.jpg',
          type: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
        });
      }
    } catch {
      Alert.alert(
        'Image Picker Unavailable',
        'Image upload is unavailable in this build. Please rebuild the app after installing native modules, or use the PDF option.',
      );
    }
  };

  const handlePickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setSelectedFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType || 'application/pdf',
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    if (!documentName.trim()) {
      Alert.alert('Error', 'Please enter a document name');
      return;
    }

    if (selectedDocType.requiresVehicle && !selectedVehicle) {
      Alert.alert('Error', 'Please select a vehicle');
      return;
    }

    setUploading(true);

    const res = await apiService.uploadDocument(
      {
        vehicleId: selectedVehicle?.id,
        documentType: selectedDocType.value,
        documentName: documentName.trim(),
        documentNumber: documentNumber.trim() || undefined,
        expiresAt: expiryDate || undefined,
        isVisibleToPassenger: isVisible,
      },
      selectedFile.uri,
      selectedFile.name,
      selectedFile.type,
    );

    setUploading(false);

    if (res.success && res.data) {
      Alert.alert('Success', 'Document uploaded successfully');
      setDocuments((prev) => [res.data!, ...prev]);
      setUploadModalVisible(false);
      resetUploadForm();
    } else {
      Alert.alert('Error', res.error || 'Failed to upload document');
    }
  };

  const handleToggleVisibility = async (doc: DriverDocument) => {
    const res = await apiService.toggleDocumentVisibility(doc.id, !doc.isVisibleToPassenger);
    if (res.success && res.data) {
      setDocuments((prev) => prev.map((d) => (d.id === doc.id ? res.data! : d)));
    } else {
      Alert.alert('Error', res.error || 'Failed to update visibility');
    }
  };

  const handleDelete = (doc: DriverDocument) => {
    Alert.alert('Delete Document', `Are you sure you want to delete "${doc.documentName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await apiService.deleteDocument(doc.id);
          if (res.success) {
            setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
            Alert.alert('Success', 'Document deleted');
          } else {
            Alert.alert('Error', res.error || 'Failed to delete document');
          }
        },
      },
    ]);
  };

  const handlePreview = (doc: DriverDocument) => {
    setPreviewDocument(doc);
    setPreviewModalVisible(true);
  };

  const activeVehicles = vehicles.filter((v) => v.status === 'active');
  const firstActiveTag = tags.find((t) => t.state === 'activated');
  const qrToken = typeof firstActiveTag?.token === 'string' ? firstActiveTag.token.trim() : '';

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/(main)/settings' as any);
  };

  const closeUploadModal = () => {
    setUploadModalVisible(false);
    resetUploadForm();
  };

  if (user?.role === 'normal') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={colorScheme === 'dark' ? ['#1E3A8A', '#0F172A'] : ['#1E3A8A', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + spacing.component }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.headerTitle}>{t('documents.title') || 'My Documents'}</Text>
              <Text style={styles.headerSubtitle}>{t('documents.subtitle') || 'Upload and manage driver documents'}</Text>
            </View>
          </View>
        </LinearGradient>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.section }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.large }}>
            <Briefcase size={48} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.tight, textAlign: 'center', letterSpacing: -0.5 }}>
            {t('settings.taxiModeRequired') || 'Taxi Mode Required'}
          </Text>
          <Text style={{ fontSize: 16, lineHeight: 24, color: colors.textSecondary, textAlign: 'center', marginBottom: 32, paddingHorizontal: spacing.section }}>
            {t('settings.taxiModeRequiredDesc') || 'Switch to Taxi mode to upload and manage your driving documents.'}
          </Text>
          <Button 
            onPress={() => router.push('/(main)/settings' as any)} 
            leftIcon={<Settings2 size={18} color="#FFFFFF" />}
            style={{ minWidth: 200 }}
          >
            {t('settings.enableTaxiMode') || 'Enable Taxi Mode'}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#1E3A8A', '#0F172A'] : ['#1E3A8A', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.component }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>My Documents</Text>
            <Text style={styles.headerSubtitle}>Upload and manage driver documents</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/(main)/settings' as any)} style={styles.actionButtonHeader}>
              <Settings2 size={18} color="#FFFFFF" strokeWidth={2.2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setUploadModalVisible(true)} style={styles.actionButtonHeader}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {!firstActiveTag && (
        <Card
          style={{
            marginHorizontal: spacing.section,
            marginTop: spacing.section,
            marginBottom: spacing.tight,
          }}>
          <View style={styles.infoBanner}>
            <Text style={[styles.infoBannerTitle, { color: colors.text }]}>QR is not active yet</Text>
            <Text style={[styles.infoBannerText, { color: colors.textSecondary }]}>Activate a tag from settings so passengers can scan and view visible documents.</Text>
            <TouchableOpacity
              onPress={() => router.push('/(main)/settings' as any)}
              style={[styles.infoBannerCta, { backgroundColor: colors.primaryLighter }]}
              activeOpacity={0.8}>
              <Settings2 size={16} color={colors.primary} />
              <Text style={[styles.infoBannerCtaText, { color: colors.primary }]}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Tab Switcher */}
      {!loading && !loadError && (
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'personal' && styles.activeTab]}
            onPress={() => setActiveTab('personal')}>
            <Text style={[styles.tabText, activeTab === 'personal' && styles.activeTabText, { color: activeTab === 'personal' ? '#FFFFFF' : colors.textSecondary }]}>
              Personal/Driver
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'vehicles' && styles.activeTab]}
            onPress={() => setActiveTab('vehicles')}>
            <Text style={[styles.tabText, activeTab === 'vehicles' && styles.activeTabText, { color: activeTab === 'vehicles' ? '#FFFFFF' : colors.textSecondary }]}>
              Vehicle-wise
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {loading && documents.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : loadError && documents.length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Unable to load documents</Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>{loadError}</Text>
          <Button onPress={() => loadData(true)} style={{ marginTop: spacing.section }}>
            Try Again
          </Button>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollContent} 
          contentContainerStyle={{ paddingBottom: spacing.large }}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} />
          }>
          {activeTab === 'personal' ? (
            <>
              {/* Personal Documents */}
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PERSONAL DOCUMENTS</Text>
              <Card style={{ marginHorizontal: spacing.section, marginBottom: spacing.large, padding: 0, overflow: 'hidden' }}>
                {groupedDocuments.personal.length === 0 ? (
                  <View style={styles.emptyState}>
                    <FileText size={32} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                      No personal documents uploaded
                    </Text>
                    <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                      Upload your driving license or other identity documents
                    </Text>
                  </View>
                ) : (
                  groupedDocuments.personal.map((doc, index) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      colors={colors}
                      onToggleVisibility={() => handleToggleVisibility(doc)}
                      onDelete={() => handleDelete(doc)}
                      onPreview={() => handlePreview(doc)}
                      isLast={index === groupedDocuments.personal.length - 1}
                    />
                  ))
                )}
              </Card>

              {/* QR Code Section */}
              {firstActiveTag && qrToken.length > 0 && (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MY DRIVER QR CODE</Text>
                  <Card style={{ marginHorizontal: spacing.section, marginBottom: spacing.large }}>
                    <View style={styles.qrSection}>
                      <View style={styles.qrCodeContainer}>
                        <QRCode
                          value={qrToken}
                          size={180}
                          backgroundColor="#FFFFFF"
                          color="#000000"
                        />
                      </View>
                      <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
                        Passengers can scan this QR code to see your visible documents
                      </Text>
                    </View>
                  </Card>
                </>
              )}
            </>
          ) : (
            <>
              {/* Vehicle Documents */}
              {activeVehicles.length === 0 ? (
                <View style={styles.emptyState}>
                  <AlertCircle size={32} color={colors.textMuted} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No active vehicles found</Text>
                  <Button
                    variant="ghost"
                    onPress={() => router.push('/(main)/vehicles' as any)}
                    style={{ marginTop: spacing.default }}>
                    Manage Vehicles
                  </Button>
                </View>
              ) : (
                activeVehicles.map((vehicle) => {
                  const vehicleDocs = groupedDocuments.byVehicle.get(vehicle.id) ?? [];
                  return (
                    <View key={vehicle.id}>
                      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                        {vehicle.plateNumber} - {vehicle.make || ''} {vehicle.model || ''}
                      </Text>
                      <Card style={{ marginHorizontal: spacing.section, marginBottom: spacing.large, padding: 0, overflow: 'hidden' }}>
                        {vehicleDocs.length === 0 ? (
                          <View style={styles.emptyState}>
                            <FileText size={32} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                              No documents for this vehicle
                            </Text>
                            <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                              Upload RC, PUC, or Insurance documents
                            </Text>
                          </View>
                        ) : (
                          vehicleDocs.map((doc, index) => (
                            <DocumentCard
                              key={doc.id}
                              document={doc}
                              colors={colors}
                              onToggleVisibility={() => handleToggleVisibility(doc)}
                              onDelete={() => handleDelete(doc)}
                              onPreview={() => handlePreview(doc)}
                              isLast={index === vehicleDocs.length - 1}
                            />
                          ))
                        )}
                      </Card>
                    </View>
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Upload Modal */}
      <Modal visible={uploadModalVisible} animationType="slide" transparent onRequestClose={closeUploadModal}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Document</Text>
                <TouchableOpacity onPress={closeUploadModal}>
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView style={styles.modalBody}>
                {/* Document Type Picker */}
                <Text style={[styles.inputLabel, { color: colors.text }]}>Document Type</Text>
                <TouchableOpacity
                  onPress={() => setDocTypePickerVisible(true)}
                  style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.pickerText, { color: colors.text }]}>{selectedDocType.label}</Text>
                  <ChevronDown size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                {/* Vehicle Picker (if needed) */}
                {selectedDocType.requiresVehicle && (
                  <>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Select Vehicle</Text>
                    <TouchableOpacity
                      onPress={() => setVehiclePickerVisible(true)}
                      style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                      <Text style={[styles.pickerText, { color: selectedVehicle ? colors.text : colors.textMuted }]}>
                        {selectedVehicle ? `${selectedVehicle.plateNumber} - ${selectedVehicle.make} ${selectedVehicle.model}` : 'Select a vehicle'}
                      </Text>
                      <ChevronDown size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </>
                )}

                {/* Document Name */}
                <Text style={[styles.inputLabel, { color: colors.text }]}>Document Name</Text>
                <Input
                  value={documentName}
                  onChangeText={setDocumentName}
                  placeholder="e.g., My Driving License"
                />

                {/* Document Number (Optional) */}
                <Text style={[styles.inputLabel, { color: colors.text }]}>Document Number (Optional)</Text>
                <Input
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                  placeholder="e.g., DL-1234567890"
                />

                {/* Expiry Date (Optional) */}
                <Text style={[styles.inputLabel, { color: colors.text }]}>Expiry Date (Optional)</Text>
                <Input
                  value={expiryDate}
                  onChangeText={setExpiryDate}
                  placeholder="YYYY-MM-DD"
                />

                {/* Visibility Toggle */}
                <View style={[styles.visibilityRow, { borderTopColor: colors.border }]}>
                  <View style={styles.visibilityInfo}>
                    <Text style={[styles.visibilityLabel, { color: colors.text }]}>Visible to Passengers</Text>
                    <Text style={[styles.visibilityHint, { color: colors.textSecondary }]}>
                      Show this document when passengers scan your QR code
                    </Text>
                  </View>
                  <Switch
                    value={isVisible}
                    onValueChange={setIsVisible}
                    trackColor={{ false: colors.border, true: colors.primaryLight }}
                    thumbColor={isVisible ? colors.primary : colors.textMuted}
                  />
                </View>

                {/* File Selection */}
                <View style={styles.fileSection}>
                  <Text style={[styles.inputLabel, { color: colors.text }]}>Select File</Text>
                  {selectedFile ? (
                    <View style={[styles.selectedFile, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                      {selectedFile.type.startsWith('image') ? (
                        <ImageIcon size={20} color={colors.primary} />
                      ) : (
                        <File size={20} color={colors.primary} />
                      )}
                      <Text style={[styles.selectedFileName, { color: colors.text }]} numberOfLines={1}>
                        {selectedFile.name}
                      </Text>
                      <TouchableOpacity onPress={() => setSelectedFile(null)}>
                        <X size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.fileButtons}>
                      <TouchableOpacity
                        onPress={handlePickImage}
                        style={[styles.fileButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <ImageIcon size={20} color={colors.primary} />
                        <Text style={[styles.fileButtonText, { color: colors.text }]}>Choose Image</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handlePickDocument}
                        style={[styles.fileButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                        <File size={20} color={colors.primary} />
                        <Text style={[styles.fileButtonText, { color: colors.text }]}>Choose PDF</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
                <Button
                  variant="outline"
                  onPress={closeUploadModal}
                  style={{ flex: 1, marginRight: spacing.default }}>
                  Cancel
                </Button>
                <Button
                  onPress={handleUpload}
                  loading={uploading}
                  disabled={!selectedFile || !documentName.trim() || uploading}
                  leftIcon={<Upload size={16} color="#FFFFFF" />}
                  style={{ flex: 1 }}>
                  Upload
                </Button>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Document Type Picker Modal */}
      <Modal visible={docTypePickerVisible} animationType="fade" transparent onRequestClose={() => setDocTypePickerVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Document Type</Text>
            {documentTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => {
                  setSelectedDocType(type);
                  if (type.requiresVehicle && !selectedVehicle && activeVehicles.length > 0) {
                    setSelectedVehicle(activeVehicles[0]);
                  }
                  setDocTypePickerVisible(false);
                }}
                style={[styles.pickerOption, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerOptionText, { color: colors.text }]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Vehicle Picker Modal */}
      <Modal visible={vehiclePickerVisible} animationType="fade" transparent onRequestClose={() => setVehiclePickerVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.pickerModal, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pickerTitle, { color: colors.text }]}>Select Vehicle</Text>
            {activeVehicles.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                onPress={() => {
                  setSelectedVehicle(vehicle);
                  setVehiclePickerVisible(false);
                }}
                style={[styles.pickerOption, { borderBottomColor: colors.border }]}>
                <Text style={[styles.pickerOptionText, { color: colors.text }]}>
                  {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={previewModalVisible} animationType="slide" transparent onRequestClose={() => setPreviewModalVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                {previewDocument?.documentName}
              </Text>
              <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {previewDocument && (
              <ScrollView style={styles.previewBody}>
                {(previewDocument.fileType || '').startsWith('image') ? (
                  <Image source={{ uri: previewDocument.fileUrl }} style={styles.previewImage} resizeMode="contain" />
                ) : (
                  <View style={styles.pdfPreview}>
                    <File size={64} color={colors.primary} />
                    <Text style={[styles.pdfName, { color: colors.text }]}>{previewDocument.documentName}</Text>
                    <Button onPress={() => Linking.openURL(previewDocument.fileUrl)} style={{ marginTop: spacing.section }}>
                      Open PDF
                    </Button>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const DocumentCard = React.memo(function DocumentCard({
  document,
  colors,
  onToggleVisibility,
  onDelete,
  onPreview,
  isLast,
}: {
  document: DriverDocument;
  colors: any;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onPreview: () => void;
  isLast?: boolean;
}) {
  const getStatusInfo = (doc: DriverDocument) => {
    if (doc.status === 'rejected') return { label: 'Rejected', variant: 'danger' as const };
    if (doc.status === 'pending') return { label: 'Pending', variant: 'warning' as const };
    
    if (doc.expiresAt) {
      const expiryDate = new Date(doc.expiresAt);
      const now = new Date();
      const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return { label: 'Expired', variant: 'danger' as const };
      if (diffDays <= 30) return { label: 'Expiring Soon', variant: 'warning' as const };
    }
    
    return { label: 'Verified', variant: 'success' as const };
  };

  const status = getStatusInfo(document);

  return (
    <TouchableOpacity 
      onPress={onPreview} 
      style={[
        styles.docCard, 
        !isLast && { borderBottomColor: colors.border, borderBottomWidth: 1 }
      ]} 
      activeOpacity={0.7}>
      <View style={styles.docMain}>
        <View style={[styles.docIcon, { backgroundColor: colors.surfaceSecondary }]}>
          <FileText size={22} color={colors.primary} />
        </View>
        <View style={styles.docInfo}>
          <Text style={[styles.docName, { color: colors.text }]}>{document.documentName}</Text>
          <View style={styles.docMetaRow}>
            <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
              {document.documentNumber ? `${document.documentNumber}` : 'No number'}
            </Text>
            <View style={[styles.dot, { backgroundColor: colors.textMuted }]} />
            <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
              {document.expiresAt ? `Exp: ${new Date(document.expiresAt).toLocaleDateString()}` : 'No expiry'}
            </Text>
          </View>
        </View>
        <View style={styles.badgeColumn}>
          <Badge variant={status.variant}>
            {status.label}
          </Badge>
          <Badge variant={document.isVisibleToPassenger ? 'success' : 'default'}>
            {document.isVisibleToPassenger ? 'Public' : 'Private'}
          </Badge>
        </View>
      </View>
      <View style={styles.docActions}>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          style={[styles.actionButton, { backgroundColor: colors.surfaceSecondary }]}>
          {document.isVisibleToPassenger ? (
            <EyeOff size={16} color={colors.textSecondary} />
          ) : (
            <Eye size={16} color={colors.primary} />
          )}
          <Text style={[styles.actionText, { color: document.isVisibleToPassenger ? colors.textSecondary : colors.primary }]}>
            {document.isVisibleToPassenger ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={[styles.actionButton, { backgroundColor: colors.dangerLighter }]}>
          <Trash2 size={16} color={colors.danger} />
          <Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: spacing.large,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.section,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.tight,
  },
  actionButtonHeader: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoBanner: {
    gap: spacing.default,
  },
  infoBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  infoBannerText: {
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.85,
  },
  infoBannerCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.component,
    paddingVertical: spacing.default,
    borderRadius: borderRadius.lg,
    gap: spacing.tight,
  },
  infoBannerCtaText: {
    fontSize: 15,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.large,
    marginBottom: spacing.default,
    marginHorizontal: spacing.section,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.large * 2,
    paddingHorizontal: spacing.large,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: spacing.component,
    letterSpacing: -0.3,
  },
  emptyHint: {
    fontSize: 15,
    marginTop: spacing.tight,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  qrCodeContainer: {
    padding: spacing.section,
    backgroundColor: 'white',
    borderRadius: borderRadius.xl,
    marginBottom: spacing.section,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  qrHint: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.large,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 58, 138, 0.05)',
    marginHorizontal: spacing.section,
    padding: 4,
    borderRadius: borderRadius.lg,
    marginTop: spacing.section,
    marginBottom: spacing.tight,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: '#1E3A8A',
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    fontWeight: '700',
  },
  docCard: {
    padding: spacing.default,
  },
  docMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.default,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docMeta: {
    fontSize: 13,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 10,
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusBadge: {
    // handled by Badge component variants
  },
  visibilityBadge: {
    // handled by Badge component variants
  },
  docActions: {
    flexDirection: 'row',
    marginTop: spacing.default,
    gap: spacing.default,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
    letterSpacing: -0.5,
  },
  modalBody: {
    padding: spacing.large,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.section,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingBottom: Platform.OS === 'ios' ? spacing.large * 2 : spacing.section,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.tight,
    marginTop: spacing.component,
    letterSpacing: -0.3,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.component,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.component,
    marginTop: spacing.component,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  visibilityInfo: {
    flex: 1,
    marginRight: spacing.component,
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  visibilityHint: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  fileSection: {
    marginTop: spacing.component,
  },
  fileButtons: {
    flexDirection: 'row',
    gap: spacing.component,
  },
  fileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.section,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: spacing.default,
  },
  fileButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.component,
    paddingHorizontal: spacing.section,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    gap: spacing.default,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  pickerModal: {
    margin: spacing.large,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    padding: spacing.large,
    letterSpacing: -0.4,
  },
  pickerOption: {
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.large,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pickerOptionText: {
    fontSize: 17,
    fontWeight: '500',
  },
  previewCard: {
    flex: 1,
    marginTop: spacing.large * 3,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  previewBody: {
    flex: 1,
    padding: spacing.large,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  pdfPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: borderRadius.lg,
  },
  pdfName: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.section,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
});
