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
   * All files are uploaded directly to FTP_REMOTE_DIR without subdirectories
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
      // Generate unique file name with timestamp for additional uniqueness
      const ext = this.getExtensionFromMime(mimeType) || path.extname(originalName) || '.jpg';
      const timestamp = Date.now();
      const fileName = `${timestamp}-${generateUUID()}${ext}`;

      // Upload directly to the configured remote directory (e.g., /zenvygo)
      const uploadDir = env.FTP_REMOTE_DIR || '/zenvygo';
      const remotePath = `${uploadDir}/${fileName}`;

      log.info('Starting FTP upload', {
        fileName,
        remotePath,
        uploadDir,
        bufferSize: buffer.length,
        mimeType,
      });

      // Upload the file (assumes directory already exists on server)
      await client.uploadFrom(Readable.from(buffer), remotePath);

      // Build public URL for the uploaded file
      const fileUrl = this.buildPublicFileUrl(fileName);

      log.info('File uploaded successfully via FTP', {
        fileName,
        remotePath,
        fileUrl,
        size: buffer.length,
      });

      return {
        fileUrl,
        fileName,
        filePath: remotePath,
      };
    } catch (error: any) {
      const message = String(error?.message ?? 'Unknown FTP upload error');

      log.error('FTP upload failed', error, {
        errorMessage: message,
        ftpHost: env.FTP_HOST,
        ftpPort: env.FTP_PORT,
        uploadDir: env.FTP_REMOTE_DIR,
        bufferSize: buffer.length,
        hint: message.includes('553')
          ? 'Directory does not exist or no write permission. Ensure FTP_REMOTE_DIR exists and is writable.'
          : undefined,
      });

      throw error;
    } finally {
      client.close();
    }
  }

  /**
   * Startup health check to validate FTP connectivity and directory access.
   * Non-throwing by design so it never blocks application boot.
   */
  async runStartupHealthCheck(): Promise<void> {
    if (!this.isConfigured) {
      log.warn('FTP startup health check skipped: FTP is not configured.');
      return;
    }

    const client = await this.createClient();

    try {
      const uploadDir = env.FTP_REMOTE_DIR || '/zenvygo';
      let currentDir: string | undefined;

      try {
        currentDir = await client.pwd();
        log.info('FTP current working directory', { pwd: currentDir });
      } catch {
        currentDir = undefined;
      }

      // Try to change to the upload directory to verify it exists
      try {
        await client.cd(uploadDir);
        log.info('FTP startup health check passed', {
          uploadDir,
          currentDir,
          status: 'Directory accessible',
        });
      } catch (error: any) {
        const message = String(error?.message ?? 'Unknown error');
        log.error('FTP startup health check failed', error, {
          uploadDir,
          currentDir,
          errorMessage: message,
          hint: 'Upload directory does not exist or is not accessible. Create the directory on FTP server manually.',
        });
      }
    } catch (error: any) {
      log.error('FTP startup health check encountered an unexpected error', error, {
        configuredUploadDir: env.FTP_REMOTE_DIR,
      });
    } finally {
      client.close();
    }
  }

  private buildPublicFileUrl(fileName: string): string {
    const baseUrl = env.FTP_PUBLIC_URL!.replace(/\/+$/, '');
    // Simply append the filename to the base URL
    // Example: https://cdn.example.com/1234567890-uuid.jpg
    return `${baseUrl}/${fileName}`;
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
