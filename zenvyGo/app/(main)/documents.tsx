import React, { useCallback, useState, useMemo, useRef, memo } from 'react';
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
} from 'lucide-react-native';
import { Button, Card, Input, Badge } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type DriverDocument, type Vehicle } from '@/lib/api';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAppStore } from '@/store/app-store';
import {
  compressImage,
  validateImageSize,
  formatFileSize,
  getOptimalCompressionOptions,
} from '@/lib/image-utils';

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

  const { vehicles, tags } = useAppStore();

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
    const personal = documents.filter((d) => d.documentType === 'driving_license' && !d.vehicleId);
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

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : loadError ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Unable to load documents</Text>
          <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>{loadError}</Text>
          <Button onPress={loadData} style={{ marginTop: spacing.section }}>
            Try Again
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} contentContainerStyle={{ paddingBottom: spacing.large }}>
          {/* Personal Documents */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>PERSONAL DOCUMENTS</Text>
          <Card style={{ marginHorizontal: spacing.section, marginBottom: spacing.large }}>
            {groupedDocuments.personal.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={32} color={colors.textMuted} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No driving license uploaded
                </Text>
                <Text style={[styles.emptyHint, { color: colors.textMuted }]}>
                  Upload your driving license to share with passengers
                </Text>
              </View>
            ) : (
              groupedDocuments.personal.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  colors={colors}
                  onToggleVisibility={() => handleToggleVisibility(doc)}
                  onDelete={() => handleDelete(doc)}
                  onPreview={() => handlePreview(doc)}
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
                      backgroundColor="white"
                      color={colors.text}
                    />
                  </View>
                  <Text style={[styles.qrHint, { color: colors.textSecondary }]}>
                    Passengers can scan this QR code to see your visible documents
                  </Text>
                </View>
              </Card>
            </>
          )}

          {/* Vehicle Documents */}
          {activeVehicles.map((vehicle) => {
            const vehicleDocs = groupedDocuments.byVehicle.get(vehicle.id) ?? [];
            return (
              <View key={vehicle.id}>
                <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                  {vehicle.plateNumber} - {vehicle.make || ''} {vehicle.model || ''}
                </Text>
                <Card style={{ marginHorizontal: spacing.section, marginBottom: spacing.large }}>
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
                    vehicleDocs.map((doc) => (
                      <DocumentCard
                        key={doc.id}
                        document={doc}
                        colors={colors}
                        onToggleVisibility={() => handleToggleVisibility(doc)}
                        onDelete={() => handleDelete(doc)}
                        onPreview={() => handlePreview(doc)}
                      />
                    ))
                  )}
                </Card>
              </View>
            );
          })}
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
}: {
  document: DriverDocument;
  colors: any;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onPreview: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPreview} style={[styles.docCard, { borderBottomColor: colors.border }]} activeOpacity={0.7}>
      <View style={styles.docMain}>
        <View style={[styles.docIcon, { backgroundColor: colors.surfaceSecondary }]}>
          <FileText size={22} color={colors.primary} />
        </View>
        <View style={styles.docInfo}>
          <Text style={[styles.docName, { color: colors.text }]}>{document.documentName}</Text>
          <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
            {document.expiresAt ? `Expires: ${new Date(document.expiresAt).toLocaleDateString()}` : 'No expiry date'}
          </Text>
        </View>
        <Badge variant={document.isVisibleToPassenger ? 'success' : 'default'} style={styles.badgePremium}>
          {document.isVisibleToPassenger ? 'Visible' : 'Hidden'}
        </Badge>
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
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: spacing.section,
    lineHeight: 22,
  },
  docCard: {
    paddingVertical: spacing.component,
    paddingHorizontal: spacing.section,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  docMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.component,
  },
  docIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  docInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  docName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  docMeta: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  badgePremium: {
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  docActions: {
    flexDirection: 'row',
    gap: spacing.component,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.default,
    paddingHorizontal: spacing.component,
    borderRadius: 9999,
    gap: 8,
  },
  actionText: {
    fontSize: 15,
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
