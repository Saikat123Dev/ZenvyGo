import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface CompressedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
  mimeType: string;
}

/**
 * Compress an image to reduce file size while maintaining acceptable quality
 * @param uri - The URI of the image to compress
 * @param options - Compression options
 * @returns Compressed image data
 */
export async function compressImage(
  uri: string,
  options: ImageCompressionOptions = {},
): Promise<CompressedImage> {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    format = 'jpeg',
  } = options;

  try {
    // Manipulate the image
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        {
          resize: {
            width: maxWidth,
            height: maxHeight,
          },
        },
      ],
      {
        compress: quality,
        format:
          format === 'jpeg'
            ? ImageManipulator.SaveFormat.JPEG
            : format === 'png'
              ? ImageManipulator.SaveFormat.PNG
              : ImageManipulator.SaveFormat.WEBP,
      },
    );

    // Get file size
    let fileSize = 0;
    if (Platform.OS !== 'web') {
      const FileSystem = await import('expo-file-system');
      const fileInfo = await FileSystem.getInfoAsync(manipResult.uri);
      if (fileInfo.exists && 'size' in fileInfo) {
        fileSize = fileInfo.size;
      }
    }

    return {
      uri: manipResult.uri,
      width: manipResult.width,
      height: manipResult.height,
      size: fileSize,
      mimeType: format === 'jpeg' ? 'image/jpeg' : format === 'png' ? 'image/png' : 'image/webp',
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
}

/**
 * Validate image file size
 * @param uri - The URI of the image
 * @param maxSizeBytes - Maximum allowed size in bytes
 * @returns true if valid, false otherwise
 */
export async function validateImageSize(
  uri: string,
  maxSizeBytes: number = 10 * 1024 * 1024, // 10MB default
): Promise<{ valid: boolean; size: number; error?: string }> {
  try {
    if (Platform.OS === 'web') {
      return { valid: true, size: 0 }; // Skip validation on web
    }

    const FileSystem = await import('expo-file-system');
    const fileInfo = await FileSystem.getInfoAsync(uri);

    if (!fileInfo.exists) {
      return { valid: false, size: 0, error: 'File does not exist' };
    }

    if (!('size' in fileInfo)) {
      return { valid: true, size: 0 }; // Cannot determine size, assume valid
    }

    const size = fileInfo.size;

    if (size > maxSizeBytes) {
      const sizeMB = (size / (1024 * 1024)).toFixed(2);
      const maxMB = (maxSizeBytes / (1024 * 1024)).toFixed(2);
      return {
        valid: false,
        size,
        error: `File size (${sizeMB}MB) exceeds maximum allowed size (${maxMB}MB)`,
      };
    }

    return { valid: true, size };
  } catch (error) {
    console.error('Image size validation failed:', error);
    return { valid: false, size: 0, error: 'Failed to validate file size' };
  }
}

/**
 * Get optimal compression settings based on file size
 * @param estimatedSize - Estimated file size in bytes
 * @returns Optimal compression options
 */
export function getOptimalCompressionOptions(estimatedSize: number): ImageCompressionOptions {
  // For files > 5MB, use aggressive compression
  if (estimatedSize > 5 * 1024 * 1024) {
    return {
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 0.7,
      format: 'jpeg',
    };
  }

  // For files > 2MB, use moderate compression
  if (estimatedSize > 2 * 1024 * 1024) {
    return {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 0.75,
      format: 'jpeg',
    };
  }

  // For smaller files, use light compression
  return {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    format: 'jpeg',
  };
}

/**
 * Format file size to human-readable string
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
