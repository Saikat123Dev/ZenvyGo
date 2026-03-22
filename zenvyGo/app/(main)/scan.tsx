import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, Flashlight, Image as ImageIcon, Camera } from 'lucide-react-native';
import { Colors, spacing, borderRadius, brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Button, IconButton } from '@/components/ui';

const { width } = Dimensions.get('window');
const SCAN_AREA_SIZE = width * 0.7;

export default function ScanScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const [flashOn, setFlashOn] = useState(false);
  const [hasPermission, setHasPermission] = useState(true); // For demo

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.component }]}>
        <IconButton
          icon={<X size={24} color="#FFFFFF" strokeWidth={2} />}
          onPress={() => router.back()}
          variant="ghost"
          size="md"
        />
        <Text style={styles.headerTitle}>Scan QR</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Camera View Placeholder */}
      <View style={styles.cameraContainer}>
        {/* Scan Frame */}
        <View style={styles.scanOverlay}>
          <View style={styles.scanFrame}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {/* Scanning line animation placeholder */}
            <View style={styles.scanLine} />
          </View>
        </View>

        {/* Camera placeholder */}
        <View style={styles.cameraPlaceholder}>
          <Camera size={64} color="#FFFFFF" strokeWidth={1.5} />
          <Text style={styles.placeholderText}>
            Camera preview will appear here
          </Text>
          <Text style={styles.placeholderSubtext}>
            Point at a Sampark QR code
          </Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Point your camera at a Sampark QR code
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.section }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {}}
          activeOpacity={0.7}>
          <View
            style={[
              styles.actionIcon,
              { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
            ]}>
            <ImageIcon size={24} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.actionLabel}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setFlashOn(!flashOn)}
          activeOpacity={0.7}>
          <View
            style={[
              styles.actionIcon,
              {
                backgroundColor: flashOn
                  ? brand[500]
                  : 'rgba(255, 255, 255, 0.2)',
              },
            ]}>
            <Flashlight size={24} color="#FFFFFF" strokeWidth={2} />
          </View>
          <Text style={styles.actionLabel}>
            {flashOn ? 'Flash On' : 'Flash Off'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: spacing.section,
  },
  placeholderSubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: spacing.default,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#FFFFFF',
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: brand[500],
    borderRadius: 1,
    opacity: 0.8,
  },
  instructions: {
    paddingHorizontal: spacing.xlarge,
    paddingVertical: spacing.section,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xlarge * 2,
    paddingTop: spacing.section,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.default,
  },
  actionLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
});
