import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  InteractionManager,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Flashlight, QrCode, ScanLine, ShieldCheck, FileText, X, ChevronRight, File } from 'lucide-react-native';
import { Badge, Button, Input, Card } from '@/components/ui';
import { Colors, borderRadius, shadows, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type ContactSession, type ResolvedTag } from '@/lib/api';
import { CONTACT_CHANNEL_OPTIONS, CONTACT_REASON_OPTIONS } from '@/lib/domain';
import { extractTagToken, formatChannel, formatReasonCode } from '@/lib/format';
import { useTranslation } from 'react-i18next';

// Debounce interval to prevent rapid duplicate scans
const SCAN_DEBOUNCE_MS = 1500;
// Cooldown after a failed scan attempt
const SCAN_COOLDOWN_MS = 2000;

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();

  const [flashOn, setFlashOn] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [resolvedTag, setResolvedTag] = useState<ResolvedTag | null>(null);
  const [createdSession, setCreatedSession] = useState<ContactSession | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>(CONTACT_REASON_OPTIONS[0].value);
  const [selectedChannel, setSelectedChannel] = useState<string>(CONTACT_CHANNEL_OPTIONS[0].value);
  const [requesterName, setRequesterName] = useState('');
  const [message, setMessage] = useState('');
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<{ name: string; fileUrl: string; type: string; expiresAt: string | null } | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let task: ReturnType<typeof InteractionManager.runAfterInteractions>;
      
      // When the screen comes into focus, wait for the JS thread/animations to idle
      task = InteractionManager.runAfterInteractions(() => {
        // A slight timeout guarantees the navigation slide animation completes fully before the heavy camera initialization
        setTimeout(() => {
          setIsCameraReady(true);
        }, 100);
      });

      return () => {
        // Clean up when screen loses focus to save battery and memory
        setIsCameraReady(false);
        if (task) task.cancel();
      };
    }, [])
  );

  // Refs for debouncing - using refs to avoid state update delays
  const lastScannedTokenRef = useRef<string | null>(null);
  const lastScanTimeRef = useRef<number>(0);
  const isProcessingRef = useRef(false);

  const handleResolve = useCallback(async (rawValue: string) => {
    const token = extractTagToken(rawValue);
    if (!token) {
      setError(t('scan.scanError'));
      return;
    }

    setResolving(true);
    setError(null);
    setCreatedSession(null);

    try {
      const response = await apiService.resolveTag(token);

      if (!response.success || !response.data) {
        setResolvedTag(null);
        setActiveToken(null);
        setError(response.error || t('scan.tagResolveError'));
        return;
      }

      setResolvedTag(response.data);
      setActiveToken(token);
      setSelectedReason(response.data.allowedReasonCodes[0] ?? CONTACT_REASON_OPTIONS[0].value);
      setSelectedChannel(response.data.allowedChannels[0] ?? CONTACT_CHANNEL_OPTIONS[0].value);
    } finally {
      setResolving(false);
    }
  }, []);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      const now = Date.now();
      const token = extractTagToken(data);

      // Quick ref-based checks to prevent unnecessary processing
      if (isProcessingRef.current) return;
      if (resolvedTag || createdSession) return;

      // Debounce: skip if same token scanned recently
      if (token && token === lastScannedTokenRef.current) {
        if (now - lastScanTimeRef.current < SCAN_DEBOUNCE_MS) {
          return;
        }
      }

      // Cooldown: skip if any scan happened too recently
      if (now - lastScanTimeRef.current < SCAN_COOLDOWN_MS && lastScannedTokenRef.current) {
        return;
      }

      // Update refs immediately (synchronous, no state delay)
      lastScannedTokenRef.current = token;
      lastScanTimeRef.current = now;
      isProcessingRef.current = true;

      // Process the scan
      handleResolve(data).finally(() => {
        isProcessingRef.current = false;
      });
    },
    [handleResolve, resolvedTag, createdSession],
  );

  const handleSubmitRequest = useCallback(async () => {
    if (!activeToken || !resolvedTag) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.createPublicContactSession({
        token: activeToken,
        reasonCode: selectedReason,
        requestedChannel: selectedChannel,
        requesterName: requesterName.trim() || null,
        message: message.trim() || null,
      });

      if (!response.success || !response.data) {
        Alert.alert(t('scan.sendError'), response.error || t('common.tryAgain'));
        return;
      }

      setCreatedSession(response.data);
      setRequesterName('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  }, [activeToken, resolvedTag, selectedReason, selectedChannel, requesterName, message]);

  const resetFlow = useCallback(() => {
    setError(null);
    setResolvedTag(null);
    setCreatedSession(null);
    setManualValue('');
    setActiveToken(null);
    setSelectedReason(CONTACT_REASON_OPTIONS[0].value);
    setSelectedChannel(CONTACT_CHANNEL_OPTIONS[0].value);
    setRequesterName('');
    setMessage('');
    // Reset debounce refs
    lastScannedTokenRef.current = null;
    lastScanTimeRef.current = 0;
    isProcessingRef.current = false;
  }, []);

  const hasCameraPermission = permission?.granted ?? false;
  const shouldShowCamera = hasCameraPermission && isCameraReady && !resolvedTag && !createdSession;

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Background Layer: Camera or Placeholders */}
      {permission === null ? (
        <View style={styles.placeholderBg}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : shouldShowCamera ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          enableTorch={flashOn}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      ) : hasCameraPermission ? (
        <Animated.View entering={FadeIn.duration(300)} style={styles.placeholderBg}>
          <ShieldCheck size={72} color="rgba(255,255,255,0.2)" strokeWidth={1.5} />
          <Text style={styles.resolvedPlaceholderText}>
            {createdSession ? t('scan.requestSubmitted') : t('scan.tagResolved')}
          </Text>
        </Animated.View>
      ) : (
        <View style={styles.placeholderBg}>
          <QrCode size={72} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
          <Text style={styles.permissionTitle}>{t('scan.cameraRequired')}</Text>
          <Text style={styles.permissionCopy}>{t('scan.cameraDesc')}</Text>
          <Button fullWidth={false} onPress={() => requestPermission()}>
            {t('scan.grantAccess')}
          </Button>
        </View>
      )}

      {/* Fullscreen Overlay for Scanner Lines */}
      {shouldShowCamera && (
        <View style={styles.scannerOverlay} pointerEvents="none">
          <View style={styles.scannerBox}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            <View style={styles.scanLine}>
              <ScanLine size={200} color="rgba(59, 130, 246, 0.9)" />
            </View>
          </View>
          <Text style={styles.scanningInstructionText}>{t('scan.readyToScan')}</Text>
          {resolving && (
            <View style={styles.scanningIndicator}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.scanningText}>{t('scan.resolving')}</Text>
            </View>
          )}
        </View>
      )}

      {/* Header Overlay */}
      <LinearGradient
        colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.4)', 'transparent']}
        style={[styles.headerGradient, { paddingTop: insets.top + spacing.section }]}
        pointerEvents="box-none">
        <View style={styles.headerContent} pointerEvents="box-none">
          <View pointerEvents="none">
            <Text style={styles.headerTitle}>{t('scan.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('scan.subtitle')}</Text>
          </View>
          {shouldShowCamera && (
            <TouchableOpacity
              onPress={() => setFlashOn((current) => !current)}
              style={[
                styles.flashButton,
                { backgroundColor: flashOn ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.2)' },
              ]}>
              <Flashlight size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Bottom Sheet */}
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.sheetContent, 
            { paddingBottom: 68 + Math.max(insets.bottom, 16) + 32 }
          ]}>
          {createdSession ? (
            <Animated.View entering={FadeInDown.duration(300)}>
              <View style={styles.successIcon}>
                <ShieldCheck size={28} color={colors.success} />
              </View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('scan.requestLogged')}</Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                {t('scan.requestLoggedDesc')}
              </Text>
              <View style={styles.metaChips}>
                <Badge variant="warning">{formatReasonCode(createdSession!.reasonCode)}</Badge>
                <Badge variant="primary">{formatChannel(createdSession!.requestedChannel)}</Badge>
              </View>
              <Button onPress={resetFlow}>{t('scan.scanAnother')}</Button>
            </Animated.View>
          ) : resolvedTag ? (
            <Animated.View entering={FadeInDown.duration(300)}>
              {/* Driver Profile Section */}
              {resolvedTag?.driverProfile && (
                <View style={styles.driverProfileSection}>
                  {resolvedTag.driverProfile.profilePhotoUrl && (
                    <Image
                      source={{ uri: resolvedTag.driverProfile.profilePhotoUrl }}
                      style={styles.driverPhoto}
                    />
                  )}
                  <Text style={[styles.driverName, { color: colors.text }]}>
                    {resolvedTag.driverProfile.name || t('scan.driver')}
                  </Text>
                  <Text style={[styles.vehicleInfo, { color: colors.textSecondary }]}>
                    {resolvedTag!.plateNumber}
                  </Text>

                  {/* Driver Documents */}
                  {resolvedTag.driverProfile.documents.length > 0 && (
                    <View style={styles.documentsSection}>
                      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
                        {t('scan.verifiedDocuments')}
                      </Text>
                      <Card padding="none" style={{ marginTop: spacing.default }}>
                        {resolvedTag.driverProfile.documents.map((doc, idx) => (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => {
                              setPreviewDocument(doc);
                              setPreviewModalVisible(true);
                            }}
                            style={[
                              styles.docRow,
                              idx < resolvedTag.driverProfile!.documents.length - 1 && {
                                borderBottomWidth: 1,
                                borderBottomColor: colors.border,
                              },
                            ]}
                            activeOpacity={0.7}>
                            <View style={[styles.docIconSmall, { backgroundColor: colors.primaryLighter }]}>
                              <FileText size={18} color={colors.primary} />
                            </View>
                            <View style={styles.docInfoSmall}>
                              <Text style={[styles.docNameSmall, { color: colors.text }]}>
                                {doc.name}
                              </Text>
                              <Text style={[styles.docTypeSmall, { color: colors.textSecondary }]}>
                                {doc.type}
                                {doc.expiresAt && ` • Expires ${new Date(doc.expiresAt).toLocaleDateString()}`}
                              </Text>
                            </View>
                            <ChevronRight size={16} color={colors.textMuted} />
                          </TouchableOpacity>
                        ))}
                      </Card>
                    </View>
                  )}
                </View>
              )}

              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                {t('scan.contactOwner', { plate: resolvedTag!.plateNumber })}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                {t('scan.contactDesc')}
              </Text>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('scan.reason')}</Text>
              <View style={styles.optionWrap}>
                {CONTACT_REASON_OPTIONS.filter((option) =>
                  resolvedTag!.allowedReasonCodes.includes(option.value),
                ).map((option) => {
                  const selected = selectedReason === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedReason(option.value)}
                      activeOpacity={0.85}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: selected ? colors.primaryLighter : colors.surfaceSecondary,
                          borderColor: selected ? colors.primaryLight : colors.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.optionChipText,
                          { color: selected ? colors.primary : colors.textSecondary },
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{t('scan.channel')}</Text>
              <View style={styles.optionWrap}>
                {CONTACT_CHANNEL_OPTIONS.filter((option) =>
                  resolvedTag!.allowedChannels.includes(option.value),
                ).map((option) => {
                  const selected = selectedChannel === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedChannel(option.value)}
                      activeOpacity={0.85}
                      style={[
                        styles.optionChip,
                        {
                          backgroundColor: selected ? colors.primaryLighter : colors.surfaceSecondary,
                          borderColor: selected ? colors.primaryLight : colors.border,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.optionChipText,
                          { color: selected ? colors.primary : colors.textSecondary },
                        ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Input
                label={t('scan.yourName')}
                value={requesterName}
                onChangeText={setRequesterName}
                placeholder={t('scan.namePlaceholder')}
              />
              <Input
                label={t('scan.optionalMessage')}
                value={message}
                onChangeText={setMessage}
                placeholder={t('scan.messagePlaceholder')}
              />

              <View style={styles.formActions}>
                <Button variant="outline" fullWidth={false} onPress={resetFlow}>
                  {t('common.cancel')}
                </Button>
                <Button fullWidth={false} loading={submitting} onPress={handleSubmitRequest}>
                  {t('scan.sendRequest')}
                </Button>
              </View>
            </Animated.View>
          ) : (
            <View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>{t('scan.readyToScan')}</Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                {t('scan.readyScanDesc')}
              </Text>
              <Input
                label={t('scan.manualToken')}
                value={manualValue}
                onChangeText={setManualValue}
                placeholder="https://.../t/your-token or raw token"
              />
              {error ? (
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              ) : null}
              <Button loading={resolving} onPress={() => handleResolve(manualValue)}>
                {t('scan.resolveTag')}
              </Button>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Document Preview Modal */}
      <Modal
        visible={previewModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPreviewModalVisible(false)}>
        <View style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}>
          <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                {previewDocument?.name}
              </Text>
              <TouchableOpacity onPress={() => setPreviewModalVisible(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {previewDocument && (
              <ScrollView style={styles.previewBody}>
                {previewDocument!.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <Image
                    source={{ uri: previewDocument!.fileUrl }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.pdfPreview}>
                    <File size={64} color={colors.primary} />
                    <Text style={[styles.pdfName, { color: colors.text }]}>
                      {previewDocument!.name}
                    </Text>
                    <Button
                      onPress={() => Linking.openURL(previewDocument!.fileUrl)}
                      style={{ marginTop: spacing.section }}>
                      {t('scan.openDocument')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  placeholderBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0B1B30',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xlarge,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.xlarge,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.section,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 280,
  },
  flashButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
    paddingBottom: '35%', // Shift scanner up so it stays visually centered above the bottom sheet
  },
  scannerBox: {
    width: 280,
    height: 280,
    position: 'relative',
  },
  scanningInstructionText: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.xlarge,
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  corner: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 5,
    borderLeftWidth: 5,
    borderTopLeftRadius: 24,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 5,
    borderRightWidth: 5,
    borderTopRightRadius: 24,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 5,
    borderLeftWidth: 5,
    borderBottomLeftRadius: 24,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderBottomRightRadius: 24,
  },
  scanLine: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningIndicator: {
    position: 'absolute',
    bottom: -60,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.component,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.default,
  },
  scanningText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resolvedPlaceholderText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: spacing.large,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginTop: spacing.large,
  },
  permissionCopy: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.default,
    marginBottom: spacing.xlarge,
    textAlign: 'center',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderTopLeftRadius: borderRadius['3xl'],
    borderTopRightRadius: borderRadius['3xl'],
    maxHeight: '65%',
    minHeight: 280,
    ...shadows.lg,
  },
  sheetContent: {
    paddingHorizontal: spacing.card,
    paddingTop: spacing.card,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  sheetSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.default,
    marginBottom: spacing.xlarge * 1.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: spacing.component,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.default,
    marginBottom: spacing.large,
  },
  optionChip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.section,
    paddingVertical: spacing.default,
  },
  optionChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.component,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.component,
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.14)',
    marginBottom: spacing.section,
  },
  metaChips: {
    flexDirection: 'row',
    gap: spacing.default,
    marginBottom: spacing.large,
  },
  driverProfileSection: {
    alignItems: 'center',
    marginBottom: spacing.large * 1.5,
  },
  driverPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.component,
  },
  driverName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 16,
    marginBottom: spacing.section,
  },
  documentsSection: {
    width: '100%',
    marginTop: spacing.section,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.component,
    paddingHorizontal: spacing.section,
  },
  docIconSmall: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: spacing.component,
  },
  docInfoSmall: {
    flex: 1,
  },
  docNameSmall: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  docTypeSmall: {
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  previewCard: {
    flex: 1,
    marginTop: spacing.large * 3,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
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
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
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
