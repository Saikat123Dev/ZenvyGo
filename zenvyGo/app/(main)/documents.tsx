import React, { useCallback, useState, useMemo } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
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
  Image as ImageIcon,
  File,
} from 'lucide-react-native';
import { Button, Card, Input, Badge } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type DriverDocument, type Vehicle } from '@/lib/api';
import { useRouter } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { useAppStore } from '@/store/app-store';

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

  const loadData = useCallback(async () => {
    setLoading(true);
    const res = await apiService.listDocuments();

    if (res.success && res.data) {
      setDocuments(res.data);
    } else if (res.error) {
      Alert.alert('Error', res.error);
    }
    setLoading(false);
  }, []);

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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera roll permissions are required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colorScheme === 'dark' ? ['#1E3A8A', '#0F172A'] : ['#1E3A8A', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.component }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>My Documents</Text>
            <Text style={styles.headerSubtitle}>Upload and manage driver documents</Text>
          </View>
          <TouchableOpacity onPress={() => setUploadModalVisible(true)} style={styles.addButton}>
            <Plus size={20} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
          {firstActiveTag && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MY DRIVER QR CODE</Text>
              <Card style={{ marginHorizontal: spacing.section, marginBottom: spacing.large }}>
                <View style={styles.qrSection}>
                  <View style={styles.qrCodeContainer}>
                    <QRCode
                      value={firstActiveTag.token}
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
      <Modal visible={uploadModalVisible} animationType="slide" transparent onRequestClose={() => setUploadModalVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Upload Document</Text>
                <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
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
                  onPress={() => {
                    setUploadModalVisible(false);
                    resetUploadForm();
                  }}
                  style={{ flex: 1, marginRight: spacing.default }}>
                  Cancel
                </Button>
                <Button
                  onPress={handleUpload}
                  loading={uploading}
                  disabled={!selectedFile || !documentName.trim() || uploading}
                  style={{ flex: 1 }}>
                  <Upload size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
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
                {previewDocument.fileType.startsWith('image') ? (
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

function DocumentCard({
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
        <View style={[styles.docIcon, { backgroundColor: colors.primaryLighter }]}>
          <FileText size={20} color={colors.primary} />
        </View>
        <View style={styles.docInfo}>
          <Text style={[styles.docName, { color: colors.text }]}>{document.documentName}</Text>
          <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
            {document.expiresAt ? `Expires: ${new Date(document.expiresAt).toLocaleDateString()}` : 'No expiry date'}
          </Text>
        </View>
        <Badge variant={document.isVisibleToPassenger ? 'success' : 'default'}>
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
            <Eye size={16} color={colors.textSecondary} />
          )}
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>
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
}

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
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  headerCopy: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.large,
    marginBottom: spacing.default,
    marginHorizontal: spacing.section,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.large * 2,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.component,
  },
  emptyHint: {
    fontSize: 14,
    marginTop: spacing.tight,
    textAlign: 'center',
  },
  qrSection: {
    alignItems: 'center',
    paddingVertical: spacing.large,
  },
  qrCodeContainer: {
    padding: spacing.section,
    backgroundColor: 'white',
    borderRadius: borderRadius.lg,
    marginBottom: spacing.section,
  },
  qrHint: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing.section,
  },
  docCard: {
    paddingVertical: spacing.component,
    paddingHorizontal: spacing.card,
    borderBottomWidth: 1,
  },
  docMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.default,
  },
  docIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.component,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  docMeta: {
    fontSize: 14,
  },
  docActions: {
    flexDirection: 'row',
    gap: spacing.default,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.default,
    paddingHorizontal: spacing.component,
    borderRadius: borderRadius.default,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.card,
    paddingVertical: spacing.section,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  modalBody: {
    padding: spacing.card,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: spacing.card,
    paddingVertical: spacing.section,
    borderTopWidth: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.default,
    marginTop: spacing.section,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.component,
    borderRadius: borderRadius.default,
    borderWidth: 1,
  },
  pickerText: {
    fontSize: 16,
    flex: 1,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.section,
    marginTop: spacing.section,
    borderTopWidth: 1,
  },
  visibilityInfo: {
    flex: 1,
    marginRight: spacing.component,
  },
  visibilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  visibilityHint: {
    fontSize: 14,
  },
  fileSection: {
    marginTop: spacing.section,
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
    borderRadius: borderRadius.default,
    borderWidth: 1,
    gap: spacing.default,
  },
  fileButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.component,
    paddingHorizontal: spacing.section,
    borderRadius: borderRadius.default,
    borderWidth: 1,
    gap: spacing.default,
  },
  selectedFileName: {
    flex: 1,
    fontSize: 14,
  },
  pickerModal: {
    margin: spacing.card,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    padding: spacing.card,
  },
  pickerOption: {
    paddingVertical: spacing.section,
    paddingHorizontal: spacing.card,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
  },
  previewCard: {
    flex: 1,
    marginTop: spacing.large * 2,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
  },
  previewBody: {
    flex: 1,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pdfPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.large,
  },
  pdfName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: spacing.section,
    textAlign: 'center',
  },
});
