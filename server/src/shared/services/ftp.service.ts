import * as ftp from 'basic-ftp';
import * as path from 'path';
import { Readable } from 'stream';
import { env } from '../config/env';
import { log } from '../utils/logger';
import { generateUUID } from '../utils/crypto';

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  filePath: string;
}

/**
 * FTP Service for uploading files to remote FTP server
 */
class FtpService {
  private isConfigured: boolean = false;

  constructor() {
    this.isConfigured = this.checkConfiguration();
    if (!this.isConfigured) {
      log.warn('FTP service not configured. File uploads will be disabled.');
    } else {
      log.info('FTP service initialized');
    }
  }

  private checkConfiguration(): boolean {
    return !!(env.FTP_HOST && env.FTP_USER && env.FTP_PASSWORD && env.FTP_PUBLIC_URL);
  }

  /**
   * Create a new FTP client connection
   */
  private async createClient(): Promise<ftp.Client> {
    const client = new ftp.Client();
    client.ftp.verbose = env.NODE_ENV === 'development';

    try {
      await client.access({
        host: env.FTP_HOST!,
        port: env.FTP_PORT,
        user: env.FTP_USER!,
        password: env.FTP_PASSWORD!,
        secure: env.FTP_SECURE,
      });
    } catch (error: any) {
      const message = String(error?.message ?? 'Unknown FTP connection error');
      const isAuthFailure = message.includes('530');

      log.error('FTP connection failed', error, {
        host: env.FTP_HOST,
        port: env.FTP_PORT,
        secure: env.FTP_SECURE,
        userLength: env.FTP_USER?.length,
        passwordLength: env.FTP_PASSWORD?.length,
        hint: isAuthFailure
          ? 'FTP authentication failed. Verify FTP_USER/FTP_PASSWORD and quote passwords containing # in .env.'
          : undefined,
      });

      throw error;
    }

    return client;
  }

  /**
   * Upload a file buffer to FTP server
   * @param buffer - File buffer
   * @param originalName - Original file name
   * @param mimeType - MIME type of the file
   * @returns Upload result with file URL
   */
  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<UploadResult> {
    if (!this.isConfigured) {
      throw new Error('FTP service not configured');
    }

    const client = await this.createClient();

    try {
      // Generate unique file name
      const ext = this.getExtensionFromMime(mimeType) || path.extname(originalName) || '.jpg';
      const fileName = `${generateUUID()}${ext}`;
      const remotePath = `${env.FTP_BASE_PATH}/${fileName}`;

      // Ensure directory exists
      await client.ensureDir(env.FTP_BASE_PATH);

      // Create readable stream from buffer
      const stream = Readable.from(buffer);

      // Upload file
      await client.uploadFrom(stream, remotePath);

      const fileUrl = `${env.FTP_PUBLIC_URL}${remotePath}`;

      log.info('File uploaded successfully via FTP', {
        fileName,
        remotePath,
        size: buffer.length,
      });

      return {
        fileUrl,
        fileName,
        filePath: remotePath,
      };
    } finally {
      client.close();
    }
  }

  /**
   * Delete a file from FTP server
   * @param remotePath - Remote file path to delete
   */
  async deleteFile(remotePath: string): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('FTP service not configured');
    }

    const client = await this.createClient();

    try {
      await client.remove(remotePath);
      log.info('File deleted from FTP', { remotePath });
    } catch (error: any) {
      // Log but don't throw - file might already be deleted
      log.warn('Failed to delete file from FTP', {
        remotePath,
        error: error.message,
      });
    } finally {
      client.close();
    }
  }

  /**
   * Check if FTP service is available
   */
  async isAvailable(): Promise<boolean> {
    if (!this.isConfigured) {
      return false;
    }

    try {
      const client = await this.createClient();
      client.close();
      return true;
    } catch (error: any) {
      log.error('FTP connection test failed', { error: error.message });
      return false;
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getExtensionFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
    };

    return mimeToExt[mimeType.toLowerCase()] || '';
  }

  /**
   * Validate if the MIME type is allowed for document uploads
   */
  isAllowedMimeType(mimeType: string): boolean {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    return allowedTypes.includes(mimeType.toLowerCase());
  }

  /**
   * Get maximum allowed file size in bytes (5MB)
   */
  getMaxFileSize(): number {
    return 5 * 1024 * 1024; // 5MB
  }
}

export const ftpService = new FtpService();
