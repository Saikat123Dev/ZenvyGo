import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Flashlight, QrCode, ScanLine, ShieldCheck } from 'lucide-react-native';
import { Badge, Button, Input } from '@/components/ui';
import { Colors, borderRadius, spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { apiService, type ContactSession, type ResolvedTag } from '@/lib/api';
import { CONTACT_CHANNEL_OPTIONS, CONTACT_REASON_OPTIONS } from '@/lib/domain';
import { extractTagToken, formatChannel, formatReasonCode } from '@/lib/format';

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
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

  const handleResolve = async (rawValue: string) => {
    const token = extractTagToken(rawValue);
    if (!token) {
      setError('Scan a ZenvyGo QR code or paste the QR token/URL.');
      return;
    }

    setResolving(true);
    setError(null);
    setCreatedSession(null);

    const response = await apiService.resolveTag(token);
    setResolving(false);

    if (!response.success || !response.data) {
      setResolvedTag(null);
      setActiveToken(null);
      setError(response.error || 'This QR tag could not be resolved.');
      return;
    }

    setResolvedTag(response.data);
    setActiveToken(token);
    setSelectedReason(response.data.allowedReasonCodes[0] ?? CONTACT_REASON_OPTIONS[0].value);
    setSelectedChannel(response.data.allowedChannels[0] ?? CONTACT_CHANNEL_OPTIONS[0].value);
  };

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (resolving || resolvedTag || createdSession) {
      return;
    }

    await handleResolve(data);
  };

  const handleSubmitRequest = async () => {
    if (!activeToken || !resolvedTag) {
      return;
    }

    setSubmitting(true);
    const response = await apiService.createPublicContactSession({
      token: activeToken,
      reasonCode: selectedReason,
      requestedChannel: selectedChannel,
      requesterName: requesterName.trim() || null,
      message: message.trim() || null,
    });
    setSubmitting(false);

    if (!response.success || !response.data) {
      Alert.alert('Unable to send request', response.error || 'Please try again.');
      return;
    }

    setCreatedSession(response.data);
    setRequesterName('');
    setMessage('');
  };

  const resetFlow = () => {
    setError(null);
    setResolvedTag(null);
    setCreatedSession(null);
    setManualValue('');
    setActiveToken(null);
    setSelectedReason(CONTACT_REASON_OPTIONS[0].value);
    setSelectedChannel(CONTACT_CHANNEL_OPTIONS[0].value);
    setRequesterName('');
    setMessage('');
  };

  const hasCameraPermission = permission?.granted ?? false;

  return (
    <View style={[styles.container, { backgroundColor: '#03111F' }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.section }]}>
        <View>
          <Text style={styles.headerTitle}>Scan ZenvyGo QR</Text>
          <Text style={styles.headerSubtitle}>
            Resolve a tag, choose a reason, and create a contact request.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setFlashOn((current) => !current)}
          style={[
            styles.flashButton,
            { backgroundColor: flashOn ? 'rgba(59,130,246,0.28)' : 'rgba(255,255,255,0.12)' },
          ]}>
          <Flashlight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraSection}>
        {permission === null ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : hasCameraPermission ? (
          <View style={styles.cameraFrame}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              enableTorch={flashOn}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={handleBarcodeScanned}
            />
            <View style={styles.overlay}>
              <View style={styles.scannerBox}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                <View style={styles.scanLine}>
                  <ScanLine size={220} color="rgba(96, 165, 250, 0.9)" />
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.permissionCard}>
            <QrCode size={54} color="#FFFFFF" strokeWidth={1.5} />
            <Text style={styles.permissionTitle}>Camera permission required</Text>
            <Text style={styles.permissionCopy}>
              Grant camera access to scan QR tags directly, or paste the token manually below.
            </Text>
            <Button fullWidth={false} onPress={() => requestPermission()}>
              Grant Camera Access
            </Button>
          </View>
        )}
      </View>

      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.sheetContent, { paddingBottom: insets.bottom + spacing.large }]}>
          {createdSession ? (
            <View>
              <View style={styles.successIcon}>
                <ShieldCheck size={28} color={colors.success} />
              </View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Request logged</Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                The owner request was created through the public contact flow.
              </Text>
              <View style={styles.metaChips}>
                <Badge variant="warning">{formatReasonCode(createdSession.reasonCode)}</Badge>
                <Badge variant="primary">{formatChannel(createdSession.requestedChannel)}</Badge>
              </View>
              <Button onPress={resetFlow}>Scan Another Code</Button>
            </View>
          ) : resolvedTag ? (
            <View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>
                Contact owner of {resolvedTag.plateNumber}
              </Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                Choose the reason and contact channel. The owner never sees your personal number directly.
              </Text>

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>REASON</Text>
              <View style={styles.optionWrap}>
                {CONTACT_REASON_OPTIONS.filter((option) =>
                  resolvedTag.allowedReasonCodes.includes(option.value),
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

              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CHANNEL</Text>
              <View style={styles.optionWrap}>
                {CONTACT_CHANNEL_OPTIONS.filter((option) =>
                  resolvedTag.allowedChannels.includes(option.value),
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
                label="Your Name"
                value={requesterName}
                onChangeText={setRequesterName}
                placeholder="Parking attendant, guard, bystander"
              />
              <Input
                label="Optional Message"
                value={message}
                onChangeText={setMessage}
                placeholder="A short note for the owner"
              />

              <View style={styles.formActions}>
                <Button variant="outline" fullWidth={false} onPress={resetFlow}>
                  Cancel
                </Button>
                <Button fullWidth={false} loading={submitting} onPress={handleSubmitRequest}>
                  Send Request
                </Button>
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Ready to scan</Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>
                Scan the windshield QR sticker or paste the QR URL/token manually for testing.
              </Text>
              <Input
                label="Manual Token / URL"
                value={manualValue}
                onChangeText={setManualValue}
                placeholder="https://.../t/your-token or raw token"
              />
              {error ? (
                <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
              ) : null}
              <Button loading={resolving} onPress={() => handleResolve(manualValue)}>
                Resolve Tag
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.section,
    paddingBottom: spacing.section,
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
    color: 'rgba(255,255,255,0.74)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
    maxWidth: 260,
  },
  flashButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraSection: {
    flex: 1,
    paddingHorizontal: spacing.section,
    justifyContent: 'center',
  },
  cameraFrame: {
    flex: 1,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: '#0B1B30',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerBox: {
    width: 240,
    height: 240,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 38,
    height: 38,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: '45%',
    alignItems: 'center',
  },
  permissionCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xlarge,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: spacing.section,
  },
  permissionCopy: {
    color: 'rgba(255,255,255,0.74)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.default,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  sheet: {
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    minHeight: 320,
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
    marginBottom: spacing.large,
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
});
